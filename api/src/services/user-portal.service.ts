import { and, desc, eq, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { db } from '../db/index.js'
import { bankAccounts, orders, wallets, walletTransactions } from '../db/schema.js'

export async function getUserOrders(userId: string, input: { page: number; limit: number; status?: string }) {
  const page = Math.max(1, input.page || 1), limit = Math.max(1, Math.min(100, input.limit || 15))
  const conditions = [eq(orders.userId, userId)]
  if (input.status) conditions.push(eq(orders.orderStatus, input.status))
  const where = and(...conditions)
  const records = await db.select().from(orders).where(where).orderBy(desc(orders.orderTime), desc(orders.id)).limit(limit).offset((page - 1) * limit)
  const [count] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(where)
  const total = Number(count?.count || 0)
  return { orders: records, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getUserWallet(userId: string) {
  await db.insert(wallets).values({ userId }).onDuplicateKeyUpdate({ set: { userId } })
  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1)
  return wallet!
}

export async function getUserWalletTransactions(userId: string, input: { page: number; limit: number }) {
  const wallet = await getUserWallet(userId)
  const page = Math.max(1, input.page || 1), limit = Math.max(1, Math.min(100, input.limit || 10))
  const rows = await db.select().from(walletTransactions).where(eq(walletTransactions.walletId, wallet.id)).orderBy(desc(walletTransactions.createdAt)).limit(limit).offset((page - 1) * limit)
  const [count] = await db.select({ count: sql<number>`count(*)` }).from(walletTransactions).where(eq(walletTransactions.walletId, wallet.id))
  const total = Number(count?.count || 0)
  return { transactions: rows, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getUserBankAccount(userId: string) {
  const [bank] = await db.select().from(bankAccounts).where(eq(bankAccounts.userId, userId)).limit(1)
  return bank || null
}

export async function saveUserBankAccount(userId: string, input: { bank_id?: unknown; bank_name?: unknown; account_no?: unknown; account_name?: unknown }) {
  const bankId = String(input.bank_id || '').trim(), bankName = String(input.bank_name || '').trim()
  const accountNo = String(input.account_no || '').replace(/\s/g, ''), accountName = String(input.account_name || '').trim().toUpperCase()
  if (!bankId || !bankName || !accountNo || !accountName) throw new Error('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng')
  if (!/^[A-Z]+(?:\s[A-Z]+)*$/.test(accountName) || accountName.length > 35) throw new Error('Tên chủ tài khoản không hợp lệ (viết không dấu, tối đa 35 ký tự)')
  if (!/^\d{5,20}$/.test(accountNo)) throw new Error('Số tài khoản ngân hàng không hợp lệ')
  await db.insert(bankAccounts).values({ userId, bankId, bankName, accountNo, accountName })
    .onDuplicateKeyUpdate({ set: { bankId, bankName, accountNo, accountName, updatedAt: new Date() } })
  return getUserBankAccount(userId)
}

export async function createUserWithdrawal(userId: string, amountInput: unknown) {
  const amount = Math.round(Number(amountInput))
  if (!Number.isFinite(amount) || amount < 10000) throw new Error('Số tiền rút tối thiểu là 10.000đ')
  return db.transaction(async tx => {
    const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1)
    if (!wallet || wallet.availableBalance < amount) throw new Error('Số dư khả dụng không đủ')
    const [bank] = await tx.select().from(bankAccounts).where(eq(bankAccounts.userId, userId)).limit(1)
    if (!bank) throw new Error('Vui lòng cấu hình tài khoản ngân hàng trước khi rút tiền')
    const referenceId = `WD${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`
    const description = `Hoàn tiền Shopee ${referenceId}`
    const qrCodeUrl = `https://img.vietqr.io/image/${bank.bankId}-${bank.accountNo}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(bank.accountName)}`
    await tx.update(wallets).set({ availableBalance: wallet.availableBalance - amount, pendingBalance: wallet.pendingBalance + amount, updatedAt: new Date() }).where(eq(wallets.id, wallet.id))
    const result = await tx.insert(walletTransactions).values({ walletId: wallet.id, type: 'withdrawal', amount: -amount, status: 'pending', referenceId, description, qrCodeUrl })
    return { id: Number(result[0].insertId), reference_id: referenceId, amount: -amount, status: 'pending' }
  })
}
