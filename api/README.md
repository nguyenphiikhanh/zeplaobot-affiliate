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
