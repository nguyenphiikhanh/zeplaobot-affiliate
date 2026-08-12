import { createHmac, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'

export const ADMIN_ACCESS_TOKEN_TTL_SECONDS = 15 * 60
export const ADMIN_REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

export type AuthRole = 'admin' | 'user'

export type AuthToken = {
  sub: string
  role: AuthRole
  type: 'access' | 'refresh'
  exp: number
}

export const signAuthToken = (payload: AuthToken): string => {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', config.authTokenSecret)
    .update(encodedPayload)
    .digest('base64url')

  return `${encodedPayload}.${signature}`
}

export const verifyAuthToken = (
  token: string,
  expectedType: AuthToken['type'],
): AuthToken | null => {
  if (!config.authTokenSecret) return null

  const [encodedPayload, signature, extra] = token.split('.')
  if (!encodedPayload || !signature || extra) return null

  const expectedSignature = createHmac('sha256', config.authTokenSecret)
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

export const createAuthTokens = (sub: string, role: AuthRole) => {
  const now = Math.floor(Date.now() / 1000)
  return {
    access_token: signAuthToken({
      sub,
      role,
      type: 'access',
      exp: now + ADMIN_ACCESS_TOKEN_TTL_SECONDS,
    }),
    refresh_token: signAuthToken({
      sub,
      role,
      type: 'refresh',
      exp: now + ADMIN_REFRESH_TOKEN_TTL_SECONDS,
    }),
    expires_in: ADMIN_ACCESS_TOKEN_TTL_SECONDS,
  }
}

export const loginAdminService = async (passcode: string) => {
  if (!config.adminPassCode) {
    throw { status: 503, message: 'Admin login is not configured' }
  }

  const isValid = await bcrypt.compare(passcode, config.adminPassCode)
  if (!isValid) {
    throw { status: 401, message: 'Passcode is incorrect' }
  }

  return createAuthTokens('admin', 'admin')
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
  return {
    ...createAuthTokens(user.id, role),
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
  const refreshPayload = verifyAuthToken(refreshToken, 'refresh')
  if (!refreshPayload) {
    throw { status: 401, message: 'Invalid or expired refresh token' }
  }

  return {
    access_token: signAuthToken({
      sub: refreshPayload.sub,
      role: refreshPayload.role,
      type: 'access',
      exp: Math.floor(Date.now() / 1000) + ADMIN_ACCESS_TOKEN_TTL_SECONDS,
    }),
    expires_in: ADMIN_ACCESS_TOKEN_TTL_SECONDS,
  }
}

export const getSessionUserService = async (authorization: string) => {
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  const payload = verifyAuthToken(token, 'access')

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
