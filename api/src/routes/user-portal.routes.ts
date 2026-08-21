import { Hono } from 'hono'
import { getSessionUserService } from '../services/auth.service.js'
import {
  createUserWithdrawal,
  getUserBankAccount,
  getUserDashboardSummary,
  getUserOrders,
  getUserWallet,
  getUserWalletTransactions,
  saveUserBankAccount,
} from '../services/user-portal.service.js'
import { sendError, sendResponse } from '../utils/response.js'
import { shopeeService } from '../services/shopee.service.js'
import { getWithdrawalSettings } from '../services/withdrawal-config.service.js'

export const userPortalRoutes = new Hono<{ Variables: { userId: string } }>()
userPortalRoutes.use('/user/*', async (c, next) => {
  try {
    const user = await getSessionUserService(c.req.header('Authorization') || '')
    if (user.role !== 'user') return c.json(sendError('Unauthorized'), 403)
    c.set('userId', user.id)
    await next()
  } catch {
    return c.json(sendError('Unauthorized'), 401)
  }
})

userPortalRoutes.get('/user/dashboard-summary', async (c) => {
  try {
    const summary = await getUserDashboardSummary(c.get('userId'))
    return c.json(sendResponse(summary, 'Đã tải dữ liệu tổng quan'))
  } catch (error) {
    return c.json(sendError(error instanceof Error ? error.message : 'Không thể tải tổng quan'), 500)
  }
})

userPortalRoutes.get('/user/orders', async (c) =>
  c.json(
    sendResponse(
      await getUserOrders(c.get('userId'), {
        page: Number(c.req.query('page') || 1),
        limit: Number(c.req.query('limit') || 15),
        status: c.req.query('status'),
        search: c.req.query('search'),
        month: c.req.query('month'),
      }),
      'Đã tải đơn hàng',
    ),
  ),
)

userPortalRoutes.post('/user/convert-link', async (c) => {
  try {
    const { link } = await c.req.json<{ link?: string }>()
    const originalLink = String(link || '').trim()
    if (!originalLink) return c.json(sendError('Vui lòng nhập link Shopee'), 422)
    return c.json(
      sendResponse(
        await shopeeService.generateShopeeLink(originalLink, c.get('userId')),
        'Chuyển đổi link thành công',
      ),
    )
  } catch (error) {
    return c.json(
      sendError(
        error instanceof Error ? error.message : 'Không thể chuyển đổi link Shopee'),
      422,
    )
  }
})

userPortalRoutes.get('/user/wallet', async (c) =>
  c.json(sendResponse(await getUserWallet(c.get('userId')), 'Đã tải ví')),
)

userPortalRoutes.get('/user/withdrawal-settings', async (c) =>
  c.json(sendResponse(await getWithdrawalSettings(), 'Đã tải cấu hình rút tiền')),
)

userPortalRoutes.get('/user/wallet/transactions', async (c) =>
  c.json(
    sendResponse(
      await getUserWalletTransactions(c.get('userId'), {
        page: Number(c.req.query('page') || 1),
        limit: Number(c.req.query('limit') || 10),
      }),
      'Đã tải lịch sử ví',
    ),
  ),
)

userPortalRoutes.post('/user/wallet/withdraw', async (c) => {
  try {
    const body = await c.req.json()
    return c.json(
      sendResponse(
        await createUserWithdrawal(c.get('userId'), body.amount),
        'Tạo yêu cầu rút tiền thành công',
      ),
    )
  } catch (e) {
    return c.json(
      sendError(e instanceof Error ? e.message : 'Không thể tạo yêu cầu rút tiền'),
      422,
    )
  }
})

userPortalRoutes.get('/user/bank-account', async (c) =>
  c.json(
    sendResponse(await getUserBankAccount(c.get('userId')), 'Đã tải tài khoản ngân hàng'),
  ),
)

userPortalRoutes.put('/user/bank-account', async (c) => {
  try {
    return c.json(
      sendResponse(
        await saveUserBankAccount(c.get('userId'), await c.req.json()),
        'Lưu tài khoản ngân hàng thành công',
      ),
    )
  } catch (e) {
    return c.json(
      sendError(
        e instanceof Error ? e.message : 'Không thể lưu tài khoản ngân hàng'),
      422,
    )
  }
})

