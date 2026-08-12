import { Hono } from 'hono'
import { getSessionUserService } from '../services/auth.service.js'
import { createUserWithdrawal, getUserBankAccount, getUserOrders, getUserWallet, getUserWalletTransactions, saveUserBankAccount } from '../services/user-portal.service.js'
import { sendError, sendResponse } from '../utils/response.js'

export const userPortalRoutes = new Hono<{ Variables: { userId: string } }>()
userPortalRoutes.use('/user/*', async (c, next) => {
  try { const user = await getSessionUserService(c.req.header('Authorization') || ''); if (user.role !== 'user') return c.json(sendError('Unauthorized'), 403); c.set('userId', user.id); await next() }
  catch { return c.json(sendError('Unauthorized'), 401) }
})
userPortalRoutes.get('/user/orders', async c => c.json(sendResponse(await getUserOrders(c.get('userId'), { page: Number(c.req.query('page') || 1), limit: Number(c.req.query('limit') || 15), status: c.req.query('status') }), 'Đã tải đơn hàng')))
userPortalRoutes.get('/user/wallet', async c => c.json(sendResponse(await getUserWallet(c.get('userId')), 'Đã tải ví')))
userPortalRoutes.get('/user/wallet/transactions', async c => c.json(sendResponse(await getUserWalletTransactions(c.get('userId'), { page: Number(c.req.query('page') || 1), limit: Number(c.req.query('limit') || 10) }), 'Đã tải lịch sử ví')))
userPortalRoutes.post('/user/wallet/withdraw', async c => { try { const body = await c.req.json(); return c.json(sendResponse(await createUserWithdrawal(c.get('userId'), body.amount), 'Tạo yêu cầu rút tiền thành công')) } catch (e) { return c.json(sendError(e instanceof Error ? e.message : 'Không thể tạo yêu cầu rút tiền'), 422) } })
userPortalRoutes.get('/user/bank-account', async c => c.json(sendResponse(await getUserBankAccount(c.get('userId')), 'Đã tải tài khoản ngân hàng')))
userPortalRoutes.put('/user/bank-account', async c => { try { return c.json(sendResponse(await saveUserBankAccount(c.get('userId'), await c.req.json()), 'Lưu tài khoản ngân hàng thành công')) } catch (e) { return c.json(sendError(e instanceof Error ? e.message : 'Không thể lưu tài khoản ngân hàng'), 422) } })
