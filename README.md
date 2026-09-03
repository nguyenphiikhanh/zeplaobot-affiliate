# ZeplaoBot Affiliate

Hướng dẫn triển khai production cho hệ thống ZeplaoBot Affiliate gồm:

- `FE/`: Vue 3 + Vite.
- `api/`: Node.js + TypeScript + Hono.
- MySQL: lưu người dùng, đơn hàng, ví và cấu hình hệ thống.
- PM2: quản lý tiến trình API.
- Nginx: phục vụ frontend, HTTPS và reverse proxy tới API.

## 1. Yêu cầu máy chủ

Ví dụ bên dưới dành cho Ubuntu/Debian. Máy chủ cần có:

- Node.js 22 LTS.
- pnpm 10 trở lên.
- MySQL 8 hoặc MariaDB tương thích MySQL.
- Nginx.
- PM2.
- Một tên miền đã trỏ DNS về máy chủ.

Kiểm tra phiên bản:

```bash
node --version
pnpm --version
mysql --version
nginx -v
pm2 --version
```

Cài pnpm và PM2 nếu chưa có:

```bash
corepack enable
corepack prepare pnpm@latest --activate
sudo npm install -g pm2
```

## 2. Cấu hình API

> **Lưu ý:** Database phải sử dụng character set `utf8mb4` và collation `utf8mb4_unicode_ci` để lưu tiếng Việt và ký tự Unicode chính xác.

Tạo file môi trường từ mẫu:

```bash
cd /var/www/zeplaobot-affiliate/api
cp .env.example .env
nano .env
```

Cấu hình production mẫu:

```env
PORT=3030
APP_URL=https://example.com
SHORT_LINK_BASE_URL=https://example.com

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=zeplaobot
DB_USERNAME=zeplaobot
DB_PASSWORD=THAY_BANG_MAT_KHAU_MANH

SHOPEE_BASE_API=https://affiliate.shopee.vn/api/v3
SHOPEE_FETCH_PRODUCT_API=https://data.addlivetag.com/product-data/product-data.php
SHOPEE_COOKIE=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Ý nghĩa các biến quan trọng:

| Biến | Mô tả |
| --- | --- |
| `PORT` | Cổng nội bộ của API. Nên giữ sau firewall và chỉ cho Nginx truy cập. |
| `APP_URL` | URL public chính xác của website, không có dấu `/` cuối. Biến này cũng được dùng cho CORS và Google OAuth. |
| `SHORT_LINK_BASE_URL` | Domain tạo liên kết rút gọn `/s/...`; thường giống `APP_URL`. |
| `DB_*` | Thông tin kết nối MySQL. |
| `SHOPEE_COOKIE` | Cookie tùy chọn. Có thể cấu hình lại trong trang quản trị. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Bắt buộc khi bật đăng nhập Google. |

Giới hạn quyền đọc file môi trường:

```bash
chmod 600 /var/www/zeplaobot-affiliate/api/.env
```

## 3. Cấu hình frontend

Khuyến nghị frontend và API chạy cùng domain. Khi đó trình duyệt gọi API qua Nginx và `BASE_API_URL` để trống:

```bash
cd /var/www/zeplaobot-affiliate/FE
cp .env.example .env.production
nano .env.production
```

Nội dung:

```env
BASE_API_URL=
VITE_GOOGLE_CLIENT_ID=
```

Nếu bật Google Login, điền cùng Client ID với `GOOGLE_CLIENT_ID` của API. Trong Google Cloud Console, thêm URI sau vào **Authorized redirect URIs**:

```text
https://example.com/login
```

Không đặt secret trong biến frontend: mọi biến Vite được đóng gói vào JavaScript và người dùng có thể đọc được.

## 4. Cài dependencies, migrate và build

Cài đúng phiên bản dependencies từ lockfile:

```bash
cd /var/www/zeplaobot-affiliate/api
pnpm install --frozen-lockfile

cd /var/www/zeplaobot-affiliate/FE
pnpm install --frozen-lockfile
```

Chạy migration và seed cấu hình ban đầu:

```bash
cd /var/www/zeplaobot-affiliate/api
pnpm db:migrate
pnpm db:seed
```

Lệnh seed có thể chạy lại: cấu hình đã tồn tại sẽ được giữ lại. Lần seed đầu tạo mật khẩu quản trị mặc định là `KhanhNT`; phải đổi ngay sau lần đăng nhập đầu tiên.

Build API và frontend:

```bash
cd /var/www/zeplaobot-affiliate/api
pnpm build

cd /var/www/zeplaobot-affiliate/FE
pnpm build
```

Kết quả build:

- API: `/var/www/zeplaobot-affiliate/api/dist`.
- Frontend: `/var/www/zeplaobot-affiliate/FE/dist`.

## 5. Chạy API bằng PM2

Dự án đã có `api/ecosystem.config.cjs`:

```bash
cd /var/www/zeplaobot-affiliate/api
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Lệnh `pm2 startup` sẽ in ra một lệnh `sudo ...`; chạy đúng lệnh đó rồi chạy lại `pm2 save`.

Kiểm tra API:

```bash
pm2 status
pm2 logs zeplaobot-api --lines 100
curl http://127.0.0.1:3030/health
```

Chỉ nên chạy **một instance** API vì mỗi instance sẽ khởi tạo lịch đồng bộ Shopee và kết nối Zalo riêng. Không bật PM2 cluster mode nếu chưa bổ sung cơ chế distributed lock.

## 6. Cấu hình Nginx

Tạo file `/etc/nginx/sites-available/zeplaobot-affiliate`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com;

    root /var/www/zeplaobot-affiliate/FE/dist;
    index index.html;

    client_max_body_size 10m;

    location /api/ {
        proxy_pass http://127.0.0.1:3030;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    location = /manifest.webmanifest {
        proxy_pass http://127.0.0.1:3030/manifest.webmanifest;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~ ^/s/[^/]+$ {
        proxy_pass http://127.0.0.1:3030;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Lưu ý: không bỏ `try_files ... /index.html`, nếu không các URL Vue như `/login`, `/admin` hoặc `/wallet` sẽ trả về 404 khi tải trực tiếp.

Bật site và kiểm tra cấu hình:

```bash
sudo ln -s /etc/nginx/sites-available/zeplaobot-affiliate /etc/nginx/sites-enabled/zeplaobot-affiliate
sudo nginx -t
sudo systemctl reload nginx
```

Nếu site mặc định của Nginx gây xung đột, tắt nó:

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Thiết lập lần đầu

1. Mở `https://example.com/admin/login`.
2. Đăng nhập bằng mật khẩu mặc định `KhanhNT`.
3. Đổi mật khẩu ngay trong phần cấu hình quản trị.
4. Cấu hình Affiliate ID và cookie Shopee.
5. Cấu hình nội dung bot, nhóm Zalo và các lệnh cần dùng.
6. Kết nối Zalo bằng mã QR trong trang quản trị.
7. Nếu dùng Google Login, bật tính năng sau khi OAuth đã cấu hình hoàn chỉnh.

Thư viện `zca-js` sử dụng API Zalo cá nhân không chính thức; tài khoản có thể bị hạn chế hoặc khóa. Chỉ sử dụng tài khoản được phép vận hành và tự chịu trách nhiệm với chính sách của Zalo.
