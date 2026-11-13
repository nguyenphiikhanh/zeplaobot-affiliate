import { eq } from 'drizzle-orm'
import type { Zalo } from 'zca-js'
import { db } from '../db/index.js'
import { systemConfigs } from '../db/schema.js'

export type ZaloCredentials = Parameters<Zalo['login']>[0]
const SESSION_KEY = 'zalo_login_session'

export async function loadZaloSession(): Promise<ZaloCredentials | null> {
  const [record] = await db.select({ value: systemConfigs.value }).from(systemConfigs)
    .where(eq(systemConfigs.key, SESSION_KEY)).limit(1)
  if (!record) return null
  const value = JSON.parse(record.value) as Partial<ZaloCredentials> | null
  if (!value || typeof value.imei !== 'string' || !value.imei ||
      typeof value.userAgent !== 'string' || !value.userAgent ||
      !Array.isArray(value.cookie) || !value.cookie.length) {
    throw new Error('Dữ liệu phiên Zalo không hợp lệ')
  }
  return value as ZaloCredentials
}

export async function saveZaloSession(credentials: ZaloCredentials): Promise<void> {
  const value = JSON.stringify(credentials)
  await db.insert(systemConfigs).values({ key: SESSION_KEY, value, description: 'Phiên đăng nhập Zalo' })
    .onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } })
}
