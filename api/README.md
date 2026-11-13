# zalo-mvp

MVP 1 tài khoản Zalo dùng Node.js + TypeScript + Hono + pnpm + zca-js.

> zca-js là API Zalo cá nhân không chính thức. Tài liệu dự án cảnh báo việc sử dụng có thể khiến tài khoản bị khóa. Chỉ dùng với tài khoản và nhóm bạn được phép vận hành.

## Cài đặt

```bash
pnpm install
cp .env.example .env
```

Sửa `.env`:

```env
PORT=3000
API_KEY=your-secret-key
SOURCE_THREAD_IDs=BOX_A_ID,BOX_B_ID,BOX_C_ID,...
TARGET_THREAD_ID=<target box id>
TARGET_THREAD_TYPE=group
AUTO_FORWARD=1
BASE_API_URL=<base api url>
```

## Chạy dev

```bash
pnpm dev
```

Quét QR đăng nhập Zalo. Sau khi đăng nhập, listener realtime sẽ tự start.

## Lưu phiên Zalo qua restart

Không cần thêm biến môi trường hoặc tạo khóa. Khởi động API, mở trang quản trị
cấu hình Zalo và quét QR một lần. Sau khi đăng nhập thành công, cookie, IMEI
và User-Agent được lưu dưới dạng JSON trong `system_configs`, key
`zalo_login_session`. Không cần migration mới. Session không được trả qua
API cấu hình hoặc ghi vào log. Dữ liệu phiên nằm trực tiếp trong database;
quyền truy cập database và bản sao lưu cần được bảo vệ như thông tin đăng nhập.

Những lần khởi động tiếp theo, server tự khôi phục phiên và chạy listener.
Nếu khôi phục thất bại, server giữ nguyên dữ liệu và thử lại tối đa 3 lần,
cách nhau 15 giây. Server không tự mở luồng QR khi khởi động.
Nếu phiên bị thu hồi/hết hạn, vào trang quản trị và bấm đăng nhập để quét
QR lại; phiên mới sẽ thay thế phiên cũ sau khi đăng nhập thành công.

Nếu database không lưu được phiên sau đăng nhập, bot vẫn chạy nhưng trạng thái
admin sẽ có thông báo lỗi; cần xử lý trước khi restart.
Chỉ chạy một tiến trình bot cho một tài khoản Zalo, không chạy PM2 cluster
hoặc nhiều replica cùng khôi phục một phiên.


## Auto forward Box A -> Box B

Khi `AUTO_FORWARD=1`, listener sẽ nhận message ở `SOURCE_THREAD_IDS` và forward message text sang `TARGET_THREAD_ID`.

MVP bỏ qua `message.isSelf` để hạn chế loop.

## Build / production

```bash
pnpm build
pnpm start
```

## PM2

```bash
pnpm add -g pm2
pnpm build
pm2 start ecosystem.config.cjs
pm2 save
```
