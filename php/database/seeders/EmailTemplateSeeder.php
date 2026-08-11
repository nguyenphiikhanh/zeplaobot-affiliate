<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $newOrderHtml = <<<'HTML'
<div style="background-color: #f9fafb; padding: 40px 20px; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #eaeaea;">
    <div style="height: 6px; background: linear-gradient(90deg, #ff7a45 0%, #ee4d2d 100%);">&nbsp;</div>
    <div style="padding: 32px 24px; text-align: center; border-bottom: 1px solid #f3f4f6;">
      <h2 style="color: #ee4d2d; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Hoàn Tiền Shopee</h2>
      <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 13px;">Ghi nhận đơn hàng mới thành công</p>
    </div>
    <div style="padding: 32px 24px;">
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #1f2937; line-height: 1.5;">Xin chào <strong>{name}</strong>,</p>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">Chúc mừng! Hệ thống Saffi vừa ghi nhận thêm một đơn hàng mua sắm hoàn tiền mới từ tài khoản của bạn.</p>
      
      <!-- Khung thông tin đơn hàng -->
      <div style="background-color: #fffbeab0; border: 1px solid #ffeada; border-radius: 14px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="background-color: #ee4d2d; color: #ffffff; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em;">Đã Ghi Nhận</span>
        <div style="margin-top: 16px; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase;">Mã đơn hàng</div>
        <div style="font-size: 22px; font-weight: 900; color: #1f2937; margin-top: 2px;">#{order_id}</div>
        <div style="height: 1px; background-color: #ffeada; margin: 16px auto; width: 80%;"></div>
        <div style="font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase;">Hoa hồng dự kiến nhận</div>
        <div style="font-size: 26px; font-weight: 900; color: #ee4d2d; margin-top: 2px;">+{amount} ₫</div>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 13px; color: #9ca3af; line-height: 1.6; font-style: italic; border-left: 3px solid #ee4d2d; padding-left: 12px;">Hoa hồng sẽ sẵn sàng rút sau khi đơn hàng hoàn tất thời gian đổi trả của sàn (thông thường từ 7-14 ngày).</p>
    </div>
    <div style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 11px; line-height: 1.5;">Đây là email tự động từ hệ thống, bạn có thể bật/tắt nhận email này trong cài đặt trang cá nhân.</p>
      <p style="margin: 0; color: #9ca3af; font-size: 11px;">© Saffi.vn. Tất cả quyền được bảo lưu.</p>
    </div>
  </div>
</div>
HTML;

        $completeOrderHtml = <<<'HTML'
<div style="background-color: #f9fafb; padding: 40px 20px; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #eaeaea;">
    <div style="height: 6px; background: linear-gradient(90deg, #10b981 0%, #059669 100%);">&nbsp;</div>
    <div style="padding: 32px 24px; text-align: center; border-bottom: 1px solid #f3f4f6;">
      <h2 style="color: #059669; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Hoàn Tiền Thành Công 🎉</h2>
      <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 13px;">Hoa hồng đã được cộng vào Ví của bạn</p>
    </div>
    <div style="padding: 32px 24px;">
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #1f2937; line-height: 1.5;">Xin chào <strong>{name}</strong>,</p>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">Đơn hàng <strong>#{order_id}</strong> của bạn đã hoàn tất thời gian đối soát. Số tiền hoàn lại đã được cộng trực tiếp vào ví khả dụng!</p>

      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 14px; padding: 24px; text-align: center; margin: 24px 0;">
        <div style="font-size: 12px; color: #047857; font-weight: 700; text-transform: uppercase;">Số tiền hoàn nhận được</div>
        <div style="font-size: 30px; font-weight: 900; color: #059669; margin-top: 4px;">+{amount} ₫</div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);" href="https://app.saffi.vn/tai-chinh">Xem Ví & Rút Tiền</a>
      </div>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #9ca3af; line-height: 1.6; font-style: italic; border-left: 3px solid #10b981; padding-left: 12px;">Bạn có thể thực hiện rút tiền về tài khoản ngân hàng bất kỳ lúc nào.</p>
    </div>
    <div style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 11px; line-height: 1.5;">Đây là email tự động từ hệ thống, bạn có thể bật/tắt nhận email này trong cài đặt trang cá nhân.</p>
      <p style="margin: 0; color: #9ca3af; font-size: 11px;">© Saffi.vn. Tất cả quyền được bảo lưu.</p>
    </div>
  </div>
</div>
HTML;

        $newWithdrawalHtml = <<<'HTML'
<div style="background-color: #f9fafb; padding: 40px 20px; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #eaeaea;">
    <div style="height: 6px; background: linear-gradient(90deg, #ff7a45 0%, #ee4d2d 100%);">&nbsp;</div>
    <div style="padding: 32px 24px; text-align: center; border-bottom: 1px solid #f3f4f6;">
      <h2 style="color: #ee4d2d; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Yêu Cầu Rút Tiền Mới 💸</h2>
      <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 13px;">Thông báo từ hệ thống quản trị Saffi Admin</p>
    </div>
    <div style="padding: 32px 24px;">
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #1f2937; line-height: 1.5;">Xin chào <strong>Admin</strong>,</p>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">Hệ thống vừa ghi nhận một yêu cầu rút tiền mới từ người dùng: <strong style="color: #ee4d2d;">{name}</strong>.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a style="background: linear-gradient(135deg, #ff7a45 0%, #ee4d2d 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(238, 77, 45, 0.25);" href="https://app.saffi.vn/admin/withdrawals">Phê Duyệt Rút Tiền ➔</a>
      </div>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #9ca3af; line-height: 1.6; font-style: italic; border-left: 3px solid #ee4d2d; padding-left: 12px;">Vui lòng kiểm tra số dư đối soát trong trang quản trị trước khi thực hiện chuyển khoản.</p>
    </div>
    <div style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 11px;">© Saffi.vn Admin System. Tất cả quyền được bảo lưu.</p>
    </div>
  </div>
</div>
HTML;

        $resetPasswordHtml = <<<'HTML'
<div style="background-color: #f9fafb; padding: 40px 20px; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #eaeaea;">
    <div style="height: 6px; background: linear-gradient(90deg, #ff7a45 0%, #ee4d2d 100%);">&nbsp;</div>
    <div style="padding: 32px 24px; text-align: center; border-bottom: 1px solid #f3f4f6;">
      <h2 style="color: #ee4d2d; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Hoàn Tiền Shopee</h2>
      <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 13px;">Đặt lại mật khẩu tài khoản của bạn</p>
    </div>
    <div style="padding: 32px 24px;">
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #1f2937; line-height: 1.5;">Xin chào <strong>{name}</strong>,</p>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email <strong style="color: #1f2937;">{email}</strong>. Vui lòng nhấn vào nút bên dưới để thiết lập mật khẩu mới (yêu cầu này có hiệu lực trong vòng 60 phút):</p>
      <div style="text-align: center; margin: 32px 0;">
        <a style="background: linear-gradient(135deg, #ff7a45 0%, #ee4d2d 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(238, 77, 45, 0.25);" href="{reset_url}">Đặt Lại Mật Khẩu</a>
      </div>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #9ca3af; line-height: 1.6; font-style: italic; border-left: 3px solid #e5e7eb; padding-left: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn được bảo mật an toàn.</p>
    </div>
    <div style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 11px;">© {year} Hoàn Tiền Shopee. Tất cả quyền được bảo lưu.</p>
    </div>
  </div>
</div>
HTML;

        $templates = [
            [
                'key' => 'new_order',
                'name' => 'Ghi nhận đơn hàng mới',
                'subject' => '[SAFFI] ĐƠN HÀNG #{order_id} ĐÃ ĐƯỢC GHI NHẬN',
                'body_html' => $newOrderHtml,
                'available_variables' => ['name', 'order_id', 'amount'],
            ],
            [
                'key' => 'complete_order',
                'name' => 'Hoàn tiền đơn hàng thành công',
                'subject' => '[SAFFI] HOÀN TIỀN CHO ĐƠN HÀNG #{order_id}',
                'body_html' => $completeOrderHtml,
                'available_variables' => ['name', 'order_id', 'amount'],
            ],
            [
                'key' => 'new_withdrawal',
                'name' => 'Yêu cầu rút tiền mới (Gửi Admin)',
                'subject' => '[SAFFI] YÊU CẦU RÚT TIỀN MỚI TỪ NGƯỜI DÙNG',
                'body_html' => $newWithdrawalHtml,
                'available_variables' => ['name'],
            ],
            [
                'key' => 'reset_password',
                'name' => 'Yêu cầu đặt lại mật khẩu',
                'subject' => '[SAFFI] Yêu Cầu Đặt Lại Mật Khẩu - Hoàn Tiền Shopee',
                'body_html' => $resetPasswordHtml,
                'available_variables' => ['name', 'email', 'reset_url', 'year'],
            ],
        ];

        foreach ($templates as $t) {
            EmailTemplate::updateOrCreate(
                ['key' => $t['key']],
                [
                    'name' => $t['name'],
                    'subject' => $t['subject'],
                    'body_html' => $t['body_html'],
                    'available_variables' => $t['available_variables'],
                    'is_active' => true,
                ]
            );
        }
    }
}
