<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    /**
     * Send a message to Telegram bot using config in config/services.php.
     * Non-blocking / Fail-safe execution.
     */
    public function sendMessage(string $message): bool
    {
        try {
            $botToken = config('services.telegram.bot_token');
            $chatId = config('services.telegram.chat_id');
            $sendUrl = config('services.telegram.send_message_api');

            if (empty($sendUrl) && !empty($botToken)) {
                $sendUrl = "https://api.telegram.org/bot{$botToken}/sendMessage";
            }

            if (empty($sendUrl) || empty($chatId)) {
                Log::warning('Telegram bot token or chat ID is missing in config/services.php.');
                return false;
            }

            $response = Http::timeout(5)->post($sendUrl, [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'Markdown',
            ]);

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error("TelegramService sendMessage error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify Telegram bot when Shopee Cookie expires or fails.
     * Guaranteed to send ONLY ONCE per cookie lifecycle and fail silently on errors.
     */
    public function notifyShopeeCookieExpired(string $sourceAction = 'Thao tác Shopee'): void
    {
        try {
            // Check Admin setting
            $storedConfig = DB::table('system_configs')->where('key', 'shopee_cookie_notify')->value('value');
            $decodedConfig = is_string($storedConfig) ? json_decode($storedConfig, true) : null;
            $enabled = (bool) ($decodedConfig['telegram_notify_on_expired'] ?? true);

            if (!$enabled) {
                return;
            }

            // Lock check: Send ONLY ONCE per cookie lifecycle using Cache::add atomic operation
            $isFirstNotice = Cache::add('shopee_cookie_expired_notified', true, now()->addDays(30));
            if (!$isFirstNotice) {
                return;
            }

            $nowStr = now()->format('H:i:s d/m/Y');
            $message = "⚠️ *[CẢNH BÁO HỆ THỐNG]*\n"
                . "Shopee Cookie đã hết hạn hoặc không hoạt động!\n\n"
                . "📍 *Thao tác phát hiện:* {$sourceAction}\n"
                . "⏰ *Thời gian:* {$nowStr}\n\n"
                . "👉 *Vui lòng đăng nhập Admin để làm mới Cookie.*";

            $this->sendMessage($message);
        } catch (\Throwable $e) {
            Log::error("Failed to execute notifyShopeeCookieExpired: " . $e->getMessage());
        }
    }

    /**
     * Clear the notification lock (call when Admin updates a new cookie).
     */
    public static function resetCookieExpiredNotificationFlag(): void
    {
        try {
            Cache::forget('shopee_cookie_expired_notified');
        } catch (\Throwable $e) {
            Log::error("Failed to reset Telegram cookie notification flag: " . $e->getMessage());
        }
    }
}
