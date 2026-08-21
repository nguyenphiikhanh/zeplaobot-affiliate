import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { systemConfigs } from '../db/schema.js'

const CONFIG_KEY = 'withdrawal_settings'

export interface WithdrawalSettings {
  minimum_withdrawal_amount: number
}

export const defaultWithdrawalSettings: WithdrawalSettings = {
  minimum_withdrawal_amount: 10000,
}

export async function getWithdrawalSettings(): Promise<WithdrawalSettings> {
  const [record] = await db.select({ value: systemConfigs.value })
    .from(systemConfigs).where(eq(systemConfigs.key, CONFIG_KEY)).limit(1)
  if (!record?.value) return defaultWithdrawalSettings
  try {
    const stored = JSON.parse(record.value) as Partial<WithdrawalSettings>
    const amount = Math.floor(Number(stored.minimum_withdrawal_amount))
    return { minimum_withdrawal_amount: Number.isFinite(amount) && amount >= 1000 ? amount : defaultWithdrawalSettings.minimum_withdrawal_amount }
  } catch {
    return defaultWithdrawalSettings
  }
}

export async function saveWithdrawalSettings(input: Partial<WithdrawalSettings>) {
  const amount = Math.floor(Number(input.minimum_withdrawal_amount))
  if (!Number.isFinite(amount) || amount < 1000) throw new Error('Số tiền rút tối thiểu phải từ 1.000đ trở lên')
  const settings: WithdrawalSettings = { minimum_withdrawal_amount: amount }
  const value = JSON.stringify(settings)
  await db.insert(systemConfigs).values({ key: CONFIG_KEY, value, description: 'Cấu hình rút tiền' })
    .onDuplicateKeyUpdate({ set: { value, description: 'Cấu hình rút tiền', updatedAt: new Date() } })
  return settings
}
