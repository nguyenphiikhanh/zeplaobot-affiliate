<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Resend\Laravel\Facades\Resend;

class ResendService
{
    protected EmailTemplateService $templateService;

    public function __construct(?EmailTemplateService $templateService = null)
    {
        $this->templateService = $templateService ?? app(EmailTemplateService::class);
    }

    public function orderNewPostResendEmail(User $user, Order $order)
    {
        if (!$user->email_order_notifications) {
            Log::info("User [{$user->id}] disabled order email notifications. Skipping [new_order].");
            return;
        }

        $data = [
            'name' => $user->name,
            'order_id' => $order->order_id,
            'amount' => $order->user_commission,
        ];

        $rendered = $this->templateService->renderTemplate('new_order', $data);

        if (!$rendered['is_active']) {
            Log::info("Email template [new_order] is inactive. Skipping.");
            return;
        }

        $subject = $rendered['subject'] ?: "[SAFFI] ĐƠN HÀNG #{$order->order_id} ĐÃ ĐƯỢC GHI NHẬN";
        $content = $rendered['html'] ?: View::make('emails.new-order', $data)->render();

        Resend::emails()->send([
            'from' => env('RESEND_TRACKING_EMAIL'),
            'to' => [$user->email],
            'subject' => $subject,
            'html' => $content
        ]);
    }

    public function orderCompletePostResendEmail(User $user, Order $order)
    {
        if (!$user->email_order_notifications) {
            Log::info("User [{$user->id}] disabled order email notifications. Skipping [complete_order].");
            return;
        }

        $data = [
            'name' => $user->name,
            'order_id' => $order->order_id,
            'amount' => $order->user_commission,
        ];

        $rendered = $this->templateService->renderTemplate('complete_order', $data);

        if (!$rendered['is_active']) {
            Log::info("Email template [complete_order] is inactive. Skipping.");
            return;
        }

        $subject = $rendered['subject'] ?: "[SAFFI] HOÀN TIỀN CHO ĐƠN HÀNG #{$order->order_id}";
        $content = $rendered['html'] ?: View::make('emails.complete-order', $data)->render();

        Resend::emails()->send([
            'from' => env('RESEND_TRACKING_EMAIL'),
            'to' => [$user->email],
            'subject' => $subject,
            'html' => $content
        ]);
    }

    public function newWidrawalResendEmail(User $user)
    {
        $data = [
            'name' => $user->name,
        ];

        $rendered = $this->templateService->renderTemplate('new_withdrawal', $data);

        if (!$rendered['is_active']) {
            Log::info("Email template [new_withdrawal] is inactive. Skipping.");
            return;
        }

        $subject = $rendered['subject'] ?: "[SAFFI] YÊU CẦU RÚT TIỀN MỚI TỪ NGƯỜI DÙNG";
        $content = $rendered['html'] ?: View::make('emails.new-withdrawal', $data)->render();

        sleep(2);
        $adminEmails = explode(',', env('RESEND_TRACKING_ADMIN_EMAIL', ''));
        if (empty($adminEmails) || empty($adminEmails[0])) {
            return;
        }

        Resend::emails()->send([
            'from' => env('RESEND_TRACKING_EMAIL'),
            'to' => $adminEmails,
            'subject' => $subject,
            'html' => $content
        ]);
    }
}
