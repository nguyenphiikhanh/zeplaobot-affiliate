import { and, desc, eq, gte, lte, like, or, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { db } from '../db/index.js'
import { bankAccounts, orders, users, wallets, walletTransactions } from '../db/schema.js'
import { getWithdrawalSettings } from './withdrawal-config.service.js'

export async function getUserOrders(
  userId: string,
  input: { page: number; limit: number; status?: string; search?: string; month?: string }
) {
  const page = Math.max(1, input.page || 1), limit = Math.max(1, Math.min(100, input.limit || 15))
  const conditions = [eq(orders.userId, userId)]

  if (input.status) {
    conditions.push(eq(orders.orderStatus, input.status))
  }

  if (input.search && input.search.trim()) {
    const q = `%${input.search.trim()}%`
    conditions.push(
      or(
        like(orders.orderId, q),
        like(orders.productName, q),
        like(orders.shopName, q)
      )!
    )
  }

  if (input.month && /^\d{4}-\d{2}$/.test(input.month.trim())) {
    const [yearStr, monthStr] = input.month.trim().split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      const paddedMonth = String(month).padStart(2, '0')
      const lastDay = new Date(year, month, 0).getDate()
      const startOfMonth = `${year}-${paddedMonth}-01 00:00:00`
      const endOfMonth = `${year}-${paddedMonth}-${String(lastDay).padStart(2, '0')} 23:59:59`
      conditions.push(gte(orders.orderTime, startOfMonth))
      conditions.push(lte(orders.orderTime, endOfMonth))
    }
  }

  const where = and(...conditions)
  const records = await db.select().from(orders).where(where).orderBy(desc(orders.orderTime), desc(orders.id)).limit(limit).offset((page - 1) * limit)
  
  const [stats] = await db
    .select({
      total: sql<number>`count(*)`,
      unreceivedCount: sql<number>`sum(case when order_status = 'Pending' or order_status = 'Unpaid' or order_status is null or lower(order_status) = 'pending' then 1 else 0 end)`,
      estimatedCommission: sql<number>`sum(coalesce(user_commission, 0))`,
    })
    .from(orders)
    .where(where)

  const total = Number(stats?.total || 0)
  const unreceivedCount = Number(stats?.unreceivedCount || 0)
  const estimatedCommission = Number(stats?.estimatedCommission || 0)

  return {
    orders: records,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    summary: {
      unreceivedCount,
      estimatedCommission,
    },
  }
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

type BankAccountInput = {
  bankId?: unknown
  bankName?: unknown
  accountNo?: unknown
  accountName?: unknown
  bank_id?: unknown
  bank_name?: unknown
  account_no?: unknown
  account_name?: unknown
}

export async function saveUserBankAccount(userId: string, input: BankAccountInput) {
  const bankId = String(input.bankId ?? input.bank_id ?? '').trim()
  const bankName = String(input.bankName ?? input.bank_name ?? '').trim()
  const accountNo = String(input.accountNo ?? input.account_no ?? '').replace(/\s/g, '')
  const accountName = String(input.accountName ?? input.account_name ?? '').trim().toUpperCase()
  if (!bankId || !bankName || !accountNo || !accountName) throw new Error('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng')
  if (!/^[A-Z]+(?:\s[A-Z]+)*$/.test(accountName) || accountName.length > 35) throw new Error('Tên chủ tài khoản không hợp lệ (viết không dấu, tối đa 35 ký tự)')
  if (!/^\d{5,20}$/.test(accountNo)) throw new Error('Số tài khoản ngân hàng không hợp lệ')
  await db.insert(bankAccounts).values({ userId, bankId, bankName, accountNo, accountName })
    .onDuplicateKeyUpdate({ set: { bankId, bankName, accountNo, accountName, updatedAt: new Date() } })
  return getUserBankAccount(userId)
}

export async function createUserWithdrawal(userId: string, amountInput: unknown) {
  const amount = Math.round(Number(amountInput))
  const { minimum_withdrawal_amount: minimumAmount } = await getWithdrawalSettings()
  if (!Number.isFinite(amount) || amount < minimumAmount) {
    throw new Error(`Số tiền rút tối thiểu là ${minimumAmount.toLocaleString('vi-VN')}đ`)
  }
  return db.transaction(async tx => {
    const [wallet] = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1)
    if (!wallet || wallet.availableBalance < amount) throw new Error('Số dư khả dụng không đủ')
    const [bank] = await tx.select().from(bankAccounts).where(eq(bankAccounts.userId, userId)).limit(1)
    if (!bank) throw new Error('Vui lòng cấu hình tài khoản ngân hàng trước khi rút tiền')
    const referenceId = `WD${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`
    const description = `Cashback ${referenceId}`
    const qrCodeUrl = `https://img.vietqr.io/image/${bank.bankId}-${bank.accountNo}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(bank.accountName)}`
    await tx.update(wallets).set({ availableBalance: wallet.availableBalance - amount, pendingBalance: wallet.pendingBalance + amount, updatedAt: new Date() }).where(eq(wallets.id, wallet.id))
    const result = await tx.insert(walletTransactions).values({ walletId: wallet.id, type: 'withdrawal', amount: -amount, status: 'pending', referenceId, description, qrCodeUrl })
    return { id: Number(result[0].insertId), reference_id: referenceId, amount: -amount, status: 'pending' }
  })
}

export async function getUserDashboardSummary(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  const wallet = await getUserWallet(userId)

  const userOrders = await db.select().from(orders).where(eq(orders.userId, userId))

  const totalOrders = userOrders.length
  let completedOrders = 0
  let pendingOrders = 0
  let paidOrders = 0

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  let currentMonthCommission = 0
  let currentMonthCompletedOrders = 0

  const monthlyData: { monthKey: string; monthLabel: string; year: number; month: number; amount: number; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    monthlyData.push({
      monthKey: `T${m}`,
      monthLabel: `Tháng ${m}/${y}`,
      year: y,
      month: m,
      amount: 0,
      count: 0,
    })
  }

  let completedCommission = 0
  let pendingCommission = 0

  for (const o of userOrders) {
    const status = (o.orderStatus || '').trim().toUpperCase()
    const isCompleted = status === 'COMPLETED' || status === 'HOÀN THÀNH'
    const isCancelled = status === 'CANCELLED' || status === 'ĐÃ HỦY' || status === 'INVALID'
    const isPending = !isCompleted && !isCancelled

    if (o.isPaid === 1) {
      paidOrders++
    }
    
    if (isCompleted) {
      completedOrders++
      completedCommission += Number(o.userCommission || 0)
    } else if (isPending) {
      pendingOrders++
      pendingCommission += Number(o.userCommission || 0)
    }

    const oDate = o.orderTime ? new Date(o.orderTime) : (o.createdAt ? new Date(o.createdAt) : null)
    if (oDate && isCompleted) {
      const oMonth = oDate.getMonth() + 1
      const oYear = oDate.getFullYear()

      if (oMonth === currentMonth + 1 && oYear === currentYear) {
        currentMonthCommission += Number(o.userCommission || 0)
        currentMonthCompletedOrders++
      }

      const matchMonth = monthlyData.find(m => m.month === oMonth && m.year === oYear)
      if (matchMonth) {
        matchMonth.amount += Number(o.userCommission || 0)
        matchMonth.count++
      }
    }
  }

  const highestMonth = monthlyData.reduce((max, cur) => cur.amount > max.amount ? cur : max, monthlyData[0] || { monthKey: 'T1', amount: 0 })
  const total6Months = monthlyData.reduce((sum, cur) => sum + cur.amount, 0)

  return {
    user: {
      id: user?.id || userId,
      name: user?.name || 'Khách hàng',
      tracking_code: user?.trackingCode || '',
      image: user?.image || null,
    },
    wallet: {
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      totalPaid: wallet.totalPaid,
    },
    stats: {
      total_orders: totalOrders,
      completed_orders: completedOrders,
      completed_commission: completedCommission,
      pending_orders: pendingOrders,
      pending_commission: pendingCommission,
      paid_orders: paidOrders,
      current_month_commission: currentMonthCommission,
      current_month_orders: currentMonthCompletedOrders,
      current_month_label: `Tháng ${currentMonth + 1}/${currentYear}`,
    },
    chart: {
      months: monthlyData,
      highest_month: highestMonth,
      total_6_months: total6Months,
    },
  }
}

