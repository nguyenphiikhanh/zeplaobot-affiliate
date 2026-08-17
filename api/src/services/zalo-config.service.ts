import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { systemConfigs } from '../db/schema.js'

const CONFIG_KEY = 'zalo_bot_settings'

export interface ZaloBotSettings {
  group_ids: string[]
  link_convert_template: string
  link_convert_error_template: string
  welcome_enabled: boolean
  welcome_template: string
  group_commands: {
    wallet: { command: string; response: string }
    withdraw: { command: string; response: string; insufficient_response: string; no_bank_response: string }
    orders: { command: string; response: string; private_response: string }
    order_list: { command: string; response: string; item_response: string; next_page_response: string; empty_response: string }
  }
  private_commands: {
    tracking: { command: string; response: string }
    reset_tracking: { command: string; response: string }
  }
}

export const defaultZaloBotSettings: ZaloBotSettings = {
  group_ids: [],
  link_convert_template: '🛒 Link hoàn tiền của bạn:\n{affiliate_link}\n\n📦 Sản phẩm: {product_name}\n💰 Hoa hồng: {commission} ({commission_rate})\n💰 Hoa hồng cho bạn(ước tính): {user_commission}\n\n📌 Lưu ý cách mua đúng\n• Xoá sản phẩm cũ trong giỏ -> bấm link -> thêm giỏ mới -> mua hàng bình thường.\n• Tuyệt đối không được xem live và video.\n• Mua hàng không xem sản phẩm khác.',
  link_convert_error_template: '⚠️ Không thể lấy thông tin sản phẩm từ link này:\n{original_link}\n\nVui lòng kiểm tra lại link Shopee hoặc thử lại sau.',
  welcome_enabled: true,
  welcome_template: '👋 Chào mừng {user_name} đã tham gia nhóm {group_name}!\n\n🤖 Mình là Bot Hoàn Tiền. Hãy dán link Shopee vào nhóm để nhận ngay hoàn tiền tự động nhé! 💸',
  group_commands: {
    wallet: { command: 'vitien', response: '👤 TÀI KHOẢN #{uid}\n───────────────────\n💰 Số dư ví:      {total_balance}\n🔄 Đang xử lý:    {pending_balance}\n💸 Đã thanh toán:  {total_paid}\n───────────────────' },
    withdraw: { command: 'ruttien', response: '✅ Đã tạo yêu cầu rút toàn bộ {total_balance}. Vui lòng chờ quản trị viên xử lý.', insufficient_response: '⚠️ Số dư hiện tại của bạn là {total_balance}. Số tiền rút tối thiểu là 10.000đ.', no_bank_response: '⚠️ Bạn chưa cấu hình tài khoản ngân hàng. Vui lòng truy cập {url} để cập nhật thông tin trước khi rút tiền.' },
    orders: { command: 'id', response: '📦 Theo dõi các đơn hàng của bạn tại đây:\n{url}\n🔐 Mã đăng nhập đã được gửi qua tin nhắn riêng.\nChú ý: Tin nhắn có thể nằm trong phần "Tin nhắn từ người lạ". Nếu tắt nhận tin nhắn từ người lạ, vui lòng nhắn riêng cho bot với cú pháp {get_tracking_code_command}', private_response: '🔐 Mã theo dõi của bạn: {tracking_code}\nTuyệt đối không chia sẻ mã này với bất kỳ ai. Nếu quên mã vui lòng chat {new_tracking_code} vào đoạn chat riêng này.' },
    order_list: {
      command: 'donhang',
      response: '📄 Trang {page}/{total_pages}\n🛒 Đơn hàng của bạn:\n{orders}\n\n➡️ {next_page_instruction}',
      item_response: '{index}. 📦 {product_name}\n🆔 ID: {order_id}\n💰 Hoa hồng: {user_commission}\n📌 Trạng thái: {order_status}',
      next_page_response: '➡️ Nhắn #{next_command} để xem tiếp các đơn của bạn.',
      empty_response: '📭 Bạn chưa có đơn hàng nào.\n🔗 Hãy tiếp tục gửi link và 🛍️ mua sắm nhé!',
    },
  },
  private_commands: {
    tracking: { command: 'tracking-code', response: '🔐 Mã theo dõi của bạn: {tracking_code}\nTuyệt đối không chia sẻ mã này với bất kỳ ai. Nếu quên mã vui lòng chat {new_tracking_code} vào đoạn chat riêng này.' },
    reset_tracking: { command: 'new-tracking-code', response: '🔐 Mã theo dõi của bạn: {tracking_code}\nTuyệt đối không chia sẻ mã này với bất kỳ ai. Nếu quên mã vui lòng chat {new_tracking_code} vào đoạn chat riêng này.' },
  },
}

const normalizeCommand = (value: unknown) => String(value ?? '').trim().replace(/^#+/, '').toLowerCase()

export const getZaloBotSettings = async (): Promise<ZaloBotSettings> => {
  const [record] = await db.select({ value: systemConfigs.value })
    .from(systemConfigs).where(eq(systemConfigs.key, CONFIG_KEY)).limit(1)
  if (!record?.value) return defaultZaloBotSettings
  try {
    const stored = JSON.parse(record.value) as Partial<ZaloBotSettings>
    return {
      ...defaultZaloBotSettings,
      ...stored,
      group_commands: {
        wallet: { ...defaultZaloBotSettings.group_commands.wallet, ...stored.group_commands?.wallet },
        withdraw: { ...defaultZaloBotSettings.group_commands.withdraw, ...stored.group_commands?.withdraw },
        orders: { ...defaultZaloBotSettings.group_commands.orders, ...stored.group_commands?.orders },
        order_list: { ...defaultZaloBotSettings.group_commands.order_list, ...stored.group_commands?.order_list },
      },
      private_commands: {
        tracking: { ...defaultZaloBotSettings.private_commands.tracking, ...stored.private_commands?.tracking },
        reset_tracking: { ...defaultZaloBotSettings.private_commands.reset_tracking, ...stored.private_commands?.reset_tracking },
      },
    }
  } catch { return defaultZaloBotSettings }
}

export const saveZaloBotSettings = async (input: Partial<ZaloBotSettings>) => {
  const current = await getZaloBotSettings()
  const groupIds = Array.isArray(input.group_ids)
    ? [...new Set(input.group_ids.map(String).map((id) => id.trim()).filter(Boolean))]
    : current.group_ids
  const settings: ZaloBotSettings = {
    group_ids: groupIds,
    link_convert_template: String(input.link_convert_template ?? current.link_convert_template).trim(),
    link_convert_error_template: String(input.link_convert_error_template ?? current.link_convert_error_template).trim(),
    welcome_enabled: typeof input.welcome_enabled === 'boolean' ? input.welcome_enabled : current.welcome_enabled,
    welcome_template: String(input.welcome_template ?? current.welcome_template).trim(),
    group_commands: {
      wallet: {
        command: normalizeCommand(input.group_commands?.wallet?.command ?? current.group_commands.wallet.command),
        response: String(input.group_commands?.wallet?.response ?? current.group_commands.wallet.response).trim(),
      },
      withdraw: {
        command: normalizeCommand(input.group_commands?.withdraw?.command ?? current.group_commands.withdraw.command),
        response: String(input.group_commands?.withdraw?.response ?? current.group_commands.withdraw.response).trim(),
        insufficient_response: String(input.group_commands?.withdraw?.insufficient_response ?? current.group_commands.withdraw.insufficient_response).trim(),
        no_bank_response: String(input.group_commands?.withdraw?.no_bank_response ?? current.group_commands.withdraw.no_bank_response).trim(),
      },
      orders: {
        command: normalizeCommand(input.group_commands?.orders?.command ?? current.group_commands.orders.command),
        response: String(input.group_commands?.orders?.response ?? current.group_commands.orders.response).trim(),
        private_response: String(input.group_commands?.orders?.private_response ?? current.group_commands.orders.private_response).trim(),
      },
      order_list: {
        command: normalizeCommand(input.group_commands?.order_list?.command ?? current.group_commands.order_list.command),
        response: String(input.group_commands?.order_list?.response ?? current.group_commands.order_list.response).trim(),
        item_response: String(input.group_commands?.order_list?.item_response ?? current.group_commands.order_list.item_response).trim(),
        next_page_response: String(input.group_commands?.order_list?.next_page_response ?? current.group_commands.order_list.next_page_response).trim(),
        empty_response: String(input.group_commands?.order_list?.empty_response ?? current.group_commands.order_list.empty_response).trim(),
      },
    },
    private_commands: {
      tracking: {
        command: normalizeCommand(input.private_commands?.tracking?.command ?? current.private_commands.tracking.command),
        response: String(input.private_commands?.tracking?.response ?? current.private_commands.tracking.response).trim(),
      },
      reset_tracking: {
        command: normalizeCommand(input.private_commands?.reset_tracking?.command ?? current.private_commands.reset_tracking.command),
        response: String(input.private_commands?.reset_tracking?.response ?? current.private_commands.reset_tracking.response).trim(),
      },
    },
  }
  if (!settings.link_convert_template) throw new Error('Mẫu chuyển đổi link không được để trống')
  if (!settings.link_convert_error_template) throw new Error('Mẫu báo lỗi sản phẩm không được để trống')
  if (settings.welcome_enabled && !settings.welcome_template) throw new Error('Mẫu chào mừng không được để trống')
  const commands = Object.values(settings.group_commands).map(item => item.command)
  if (commands.some(command => !command)) throw new Error('Lệnh chat nhóm không được để trống')
  if (commands.some(command => !/^[a-z0-9_]+$/i.test(command))) throw new Error('Lệnh chỉ được chứa chữ không dấu, số và dấu gạch dưới')
  if (new Set(commands).size !== commands.length) throw new Error('Các lệnh chat nhóm không được trùng nhau')
  if (!settings.group_commands.wallet.response || !settings.group_commands.withdraw.response || !settings.group_commands.withdraw.insufficient_response || !settings.group_commands.withdraw.no_bank_response || !settings.group_commands.orders.response || !settings.group_commands.orders.private_response || !settings.group_commands.order_list.response || !settings.group_commands.order_list.item_response || !settings.group_commands.order_list.next_page_response || !settings.group_commands.order_list.empty_response) throw new Error('Nội dung phản hồi lệnh không được để trống')
  const privateCommands = Object.values(settings.private_commands).map(item => item.command)
  if (privateCommands.some(command => !command)) throw new Error('Lệnh chat riêng không được để trống')
  if (privateCommands.some(command => !/^[a-z0-9_-]+$/i.test(command))) throw new Error('Lệnh chat riêng chỉ được chứa chữ không dấu, số, gạch ngang và gạch dưới')
  if (new Set(privateCommands).size !== privateCommands.length) throw new Error('Các lệnh chat riêng không được trùng nhau')
  if (Object.values(settings.private_commands).some(item => !item.response)) throw new Error('Nội dung phản hồi lệnh chat riêng không được để trống')

  const value = JSON.stringify(settings)
  await db.insert(systemConfigs).values({ key: CONFIG_KEY, value, description: 'Cấu hình Bot Zalo' })
    .onDuplicateKeyUpdate({ set: { value, description: 'Cấu hình Bot Zalo', updatedAt: new Date() } })
  return settings
}

export const renderZaloTemplate = (template: string, variables: Record<string, string | number | null | undefined>) =>
  template.replace(/\{([a-z_]+)\}/gi, (placeholder, name: string) => {
    const value = variables[name]
    return value === undefined || value === null ? placeholder : String(value)
  })
