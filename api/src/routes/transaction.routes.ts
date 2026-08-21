import { Hono } from 'hono'
import { getSessionUserService } from '../services/auth.service.js'
import { getAdminUsers, getTransactionHistory, getUserTransactionOverview, getWithdrawals, updateWithdrawalStatus } from '../services/transaction.service.js'
import { sendError, sendResponse } from '../utils/response.js'
import { getAdminUserList } from '../services/user.service.js'
import { getWithdrawalSettings, saveWithdrawalSettings } from '../services/withdrawal-config.service.js'

export const transactionRoutes = new Hono()
transactionRoutes.use('/admin/*', async (c, next) => {
  try { const user = await getSessionUserService(c.req.header('Authorization') || ''); if (user.role !== 'admin') return c.json(sendError('Unauthorized'), 403); await next() }
  catch { return c.json(sendError('Unauthorized'), 401) }
})
transactionRoutes.get('/admin/users', async c => c.json(sendResponse(await getAdminUsers(c.req.query('search') || ''), 'Đã tải người dùng')))
transactionRoutes.get('/admin/users/list', async c => c.json(sendResponse(await getAdminUserList({
  page: Number(c.req.query('page') || 1),
  limit: Number(c.req.query('limit') || 20),
  search: c.req.query('search'),
}), 'Đã tải danh sách người dùng')))
transactionRoutes.get('/admin/transactions', async c => c.json(sendResponse(await getTransactionHistory({ page: Number(c.req.query('page') || 1), limit: Number(c.req.query('limit') || 20), userId: c.req.query('userId'), type: c.req.query('type'), status: c.req.query('status'), startDate: c.req.query('startDate'), endDate: c.req.query('endDate') }), 'Đã tải lịch sử giao dịch')))
transactionRoutes.get('/admin/transactions/overview/:userId', async c => {
  const data = await getUserTransactionOverview(c.req.param('userId')); return data ? c.json(sendResponse(data, 'Đã tải tổng quan')) : c.json(sendError('Không tìm thấy người dùng'), 404)
})
transactionRoutes.get('/admin/withdrawals', async c => c.json(sendResponse(await getWithdrawals({ page: Number(c.req.query('page') || 1), limit: Number(c.req.query('limit') || 20), search: c.req.query('search'), status: c.req.query('status') }), 'Đã tải yêu cầu rút tiền')))
transactionRoutes.get('/admin/withdrawals/settings', async c => c.json(sendResponse(await getWithdrawalSettings(), 'Đã tải cấu hình rút tiền')))
transactionRoutes.put('/admin/withdrawals/settings', async c => {
  try {
    return c.json(sendResponse(await saveWithdrawalSettings(await c.req.json()), 'Lưu cấu hình rút tiền thành công'))
  } catch (error) {
    return c.json(sendError(error instanceof Error ? error.message : 'Không thể lưu cấu hình rút tiền'), 422)
  }
})
transactionRoutes.put('/admin/withdrawals/:id/status', async c => {
  try {
    const body = await c.req.json<{ status?: string; rejectReason?: string }>()
    if (body.status !== 'success' && body.status !== 'rejected') return c.json(sendError('Trạng thái không hợp lệ'), 400)
    await updateWithdrawalStatus(Number(c.req.param('id')), body.status, body.rejectReason)
    return c.json(sendResponse(null, 'Cập nhật trạng thái thành công'))
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    const messages: Record<string, string> = { NOT_FOUND: 'Không tìm thấy giao dịch', ALREADY_PROCESSED: 'Yêu cầu này đã được xử lý', WALLET_NOT_FOUND: 'Không tìm thấy ví', REJECT_REASON_REQUIRED: 'Vui lòng nhập lý do từ chối' }
    return c.json(sendError(messages[code] || 'Không thể cập nhật trạng thái'), code === 'NOT_FOUND' ? 404 : 422)
  }
})
