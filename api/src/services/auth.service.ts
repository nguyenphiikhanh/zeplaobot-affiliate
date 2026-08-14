import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { systemConfigs, users } from '../db/schema.js'

export const ADMIN_ACCESS_TOKEN_TTL_SECONDS = 15 * 60
export const ADMIN_REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

export type AuthRole = 'admin' | 'user'

export type AuthToken = {
  sub: string
  role: AuthRole
  type: 'access' | 'refresh'
  exp: number
}

let cachedAuthSecret: string | null = null

export const getAuthTokenSecret = async (): Promise<string> => {
  if (cachedAuthSecret) return cachedAuthSecret

  try {
    const [record] = await db
      .select({ value: systemConfigs.value })
      .from(systemConfigs)
      .where(eq(systemConfigs.key, 'auth_token_secret'))
      .limit(1)

    if (record?.value) {
      cachedAuthSecret = record.value
      return cachedAuthSecret
    }

    const newSecret = randomBytes(32).toString('hex')
    await db
      .insert(systemConfigs)
      .values({
        key: 'auth_token_secret',
        value: newSecret,
        description: 'Secret key dùng để ký Auth Token',
      })
      .onDuplicateKeyUpdate({ set: { value: newSecret, updatedAt: new Date() } })

    cachedAuthSecret = newSecret
    return cachedAuthSecret
  } catch (error) {
    console.error('[Auth] Failed to load/generate auth_token_secret from DB:', error)
    if (!cachedAuthSecret) {
      cachedAuthSecret = 'fallback_secret_' + randomBytes(16).toString('hex')
    }
    return cachedAuthSecret
  }
}

export const getAdminPasscodeHash = async (): Promise<string | null> => {
  const [record] = await db
    .select({ value: systemConfigs.value })
    .from(systemConfigs)
    .where(eq(systemConfigs.key, 'admin_passcode'))
    .limit(1)

  return record?.value || null
}

export const setAdminPasscode = async (newPasscode: string): Promise<void> => {
  const hash = await bcrypt.hash(newPasscode, 10)
  await db
    .insert(systemConfigs)
    .values({
      key: 'admin_passcode',
      value: hash,
      description: 'Mật khẩu đăng nhập quản trị (bcrypt hash)',
    })
    .onDuplicateKeyUpdate({
      set: {
        value: hash,
        description: 'Mật khẩu đăng nhập quản trị (bcrypt hash)',
        updatedAt: new Date(),
      },
    })
}

export const changeAdminPasswordService = async (currentPass: string, newPass: string) => {
  let currentHash = await getAdminPasscodeHash()
  if (!currentHash) {
    // If not seeded yet, seed 'KhanhNT'
    await setAdminPasscode('KhanhNT')
    currentHash = await getAdminPasscodeHash()
  }

  const isValid = currentHash ? await bcrypt.compare(currentPass, currentHash) : false
  if (!isValid) {
    throw { status: 400, message: 'Mật khẩu hiện tại không chính xác' }
  }

  const cleanPass = String(newPass || '').trim()
  if (!cleanPass || cleanPass.length < 6) {
    throw { status: 400, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }
  }

  await setAdminPasscode(cleanPass)
}

export const signAuthToken = (payload: AuthToken, secret: string): string => {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url')

  return `${encodedPayload}.${signature}`
}

export const verifyAuthToken = (
  token: string,
  expectedType: AuthToken['type'],
  secret: string,
): AuthToken | null => {
  if (!secret) return null

  const [encodedPayload, signature, extra] = token.split('.')
  if (!encodedPayload || !signature || extra) return null

  const expectedSignature = createHmac('sha256', secret)
    .update(encodedPayload)
    .digest()

  let suppliedSignature: Buffer
  try {
    suppliedSignature = Buffer.from(signature, 'base64url')
  } catch {
    return null
  }

  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as AuthToken

    const validRole = payload.role === 'admin' || payload.role === 'user'
    const isValid =
      Boolean(payload.sub) &&
      validRole &&
      payload.type === expectedType &&
      payload.exp > Math.floor(Date.now() / 1000)

    return isValid ? payload : null
  } catch {
    return null
  }
}

export const createAuthTokens = async (sub: string, role: AuthRole) => {
  const secret = await getAuthTokenSecret()
  const now = Math.floor(Date.now() / 1000)
  return {
    access_token: signAuthToken(
      {
        sub,
        role,
        type: 'access',
        exp: now + ADMIN_ACCESS_TOKEN_TTL_SECONDS,
      },
      secret,
    ),
    refresh_token: signAuthToken(
      {
        sub,
        role,
        type: 'refresh',
        exp: now + ADMIN_REFRESH_TOKEN_TTL_SECONDS,
      },
      secret,
    ),
    expires_in: ADMIN_ACCESS_TOKEN_TTL_SECONDS,
  }
}

export const loginAdminService = async (passcode: string) => {
  let adminPassHash = await getAdminPasscodeHash()
  if (!adminPassHash) {
    // If not seeded yet, seed 'KhanhNT'
    await setAdminPasscode('KhanhNT')
    adminPassHash = await getAdminPasscodeHash()
  }

  const isValid = adminPassHash ? await bcrypt.compare(passcode, adminPassHash) : false
  if (!isValid) {
    throw { status: 401, message: 'Mật khẩu quản trị không chính xác' }
  }

  return await createAuthTokens('admin', 'admin')
}

export const loginUserService = async (trackingCode: string) => {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      trackingCode: users.trackingCode,
    })
    .from(users)
    .where(eq(users.trackingCode, trackingCode.trim()))
    .limit(1)

  if (!user) {
    throw { status: 401, message: 'Mã theo dõi không đúng, vui lòng thử lại.' }
  }

  const role: AuthRole = 'user'
  const tokens = await createAuthTokens(user.id, role)
  return {
    ...tokens,
    user: {
      id: user.id,
      name: user.name,
      image: user.image,
      role,
      tracking_code: user.trackingCode,
    },
  }
}

export const refreshAccessTokenService = async (refreshToken: string) => {
  const secret = await getAuthTokenSecret()
  const refreshPayload = verifyAuthToken(refreshToken, 'refresh', secret)
  if (!refreshPayload) {
    throw { status: 401, message: 'Invalid or expired refresh token' }
  }

  return {
    access_token: signAuthToken(
      {
        sub: refreshPayload.sub,
        role: refreshPayload.role,
        type: 'access',
        exp: Math.floor(Date.now() / 1000) + ADMIN_ACCESS_TOKEN_TTL_SECONDS,
      },
      secret,
    ),
    expires_in: ADMIN_ACCESS_TOKEN_TTL_SECONDS,
  }
}

export const getSessionUserService = async (authorization: string) => {
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  const secret = await getAuthTokenSecret()
  const payload = verifyAuthToken(token, 'access', secret)

  if (!payload) {
    throw { status: 401, message: 'Unauthorized' }
  }

  let userInfo: {
    id: string
    role: AuthRole
    name?: string | null
    image?: string | null
    tracking_code?: string | null
  } = {
    id: payload.sub,
    role: payload.role,
  }

  if (payload.role === 'user') {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        trackingCode: users.trackingCode,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1)

    if (user) {
      userInfo = {
        id: user.id,
        role: 'user',
        name: user.name,
        image: user.image,
        tracking_code: user.trackingCode,
      }
    }
  }

  return userInfo
}
