<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Services\CommissionConfigService;
use App\Services\CheckinGiftConfigService;
use App\Services\SiteSettingsService;
use App\Services\TelegramService;
use App\Utils\HttpUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SystemController extends AppBaseController
{
    //
    public function getSystemConfig(){
        try {
            $config = DB::table('system_configs')->where('key','platforms_status')->first();
            return $this->sendResponse($config, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function updateSystemConfig(Request $request){
        try {
            $platforms = $request->input('platforms');
            DB::table('system_configs')->where('key','platforms_status')->update(['value' => $platforms]);
            return $this->sendResponse(null, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getCommissionConfig(CommissionConfigService $service)
    {
        return $this->sendResponse($service->getAll(), HttpUtils::getMessage(HttpUtils::HTTP_OK));
    }

    public function updateCommissionConfig(Request $request, CommissionConfigService $service)
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.shopee' => ['required', 'array'],
            'settings.tiktok' => ['required', 'array'],
            'settings.lazada' => ['required', 'array'],
            'settings.*.rank_rates' => ['required', 'array'],
            'settings.*.rank_rates.silver' => ['required', 'numeric', 'min:0', 'max:100'],
            'settings.*.rank_rates.gold' => ['required', 'numeric', 'min:0', 'max:100'],
            'settings.*.rank_rates.obsidian' => ['required', 'numeric', 'min:0', 'max:100'],
            'settings.*.sale_day_bonus' => ['required', 'numeric', 'min:0', 'max:100'],
            'settings.*.service_fee' => ['required', 'numeric', 'min:0', 'max:100'],
            'settings.*.tax' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        return $this->sendResponse(
            $service->update($validated['settings']),
            HttpUtils::getMessage(HttpUtils::HTTP_OK)
        );
    }

    public function getCheckinGiftConfig(CheckinGiftConfigService $service)
    {
        return $this->sendResponse($service->get(), HttpUtils::getMessage(HttpUtils::HTTP_OK));
    }

    public function updateCheckinGiftConfig(Request $request, CheckinGiftConfigService $service)
    {
        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
            'first_checkin_points' => ['required', 'integer', 'min:0', 'max:100000'],
            'exchange_options' => ['nullable', 'array'],
            'exchange_options.*.points' => ['required_with:exchange_options', 'integer', 'min:1', 'max:1000000'],
            'exchange_options.*.amount_vnd' => ['required_with:exchange_options', 'integer', 'min:0', 'max:1000000000'],
        ]);

        return $this->sendResponse(
            $service->update($validated),
            HttpUtils::getMessage(HttpUtils::HTTP_OK)
        );
    }

    public function getSiteSettings(SiteSettingsService $service)
    {
        return $this->sendResponse($service->get(), HttpUtils::getMessage(HttpUtils::HTTP_OK));
    }

    public function updateSiteSettings(Request $request, SiteSettingsService $service)
    {
        $validated = $request->validate([
            'contact_zalo' => ['required', 'url', 'max:2048'],
            'contact_email' => ['required', 'email', 'max:255'],
            'site_name' => ['required', 'string', 'max:100'],
            'seo_description' => ['required', 'string', 'max:320'],
        ]);

        return $this->sendResponse(
            $service->update($validated),
            HttpUtils::getMessage(HttpUtils::HTTP_OK)
        );
    }

    public function uploadSiteAsset(
        Request $request,
        string $asset,
        SiteSettingsService $service
    ) {
        $allowedAssets = ['logo_light', 'favicon', 'social_share_image', 'loading_image'];
        if (!in_array($asset, $allowedAssets, true)) {
            return $this->sendError('Loại hình ảnh không hợp lệ.', HttpUtils::HTTP_BAD_REQUEST);
        }

        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);

        $file = $validated['image'];
        $filename = $asset.'_'.now()->format('YmdHis').'_'.Str::random(10).'.'.$file->extension();
        $disk = Storage::disk('public');
        $oldUrl = $service->get()[$asset];
        $newPath = 'branding/'.$filename;
        $disk->putFileAs('branding', $file, $filename);
        $newUrl = '/storage/'.$newPath;

        try {
            $settings = $service->updateAsset($asset, $newUrl);
        } catch (\Throwable $e) {
            $disk->delete($newPath);
            throw $e;
        }

        $managedPrefix = '/storage/branding/';
        if (str_starts_with($oldUrl, $managedPrefix)) {
            $oldFilename = basename(parse_url($oldUrl, PHP_URL_PATH));
            if ($oldFilename !== $filename) {
                $disk->delete('branding/'.$oldFilename);
            }
        }

        return $this->sendResponse($settings, HttpUtils::getMessage(HttpUtils::HTTP_OK));
    }

    public function getShopeeCookieConfig(){
        try {
            $config = Cache::get("shopee:cookie");
            $res = 'Cookie not set.';
            if(isset($config) && isset($config['cookie'])){
                $expiredAt = Carbon::parse($config['updated_at'])->addDays(7);
                $remainingDays = now()->diffInDays($expiredAt, false);
                if ($remainingDays > 0) {
                    $res = "Cookie set. Remaining {$remainingDays} day(s).";
                } else {
                    $res = "Cookie expired. Please update a new cookie.";
                }
            }

            $configBlacklist = Cache::get("shopee-blacklist:cookie");
            $resBlackist = 'Cookie not set.';
            if(isset($configBlacklist) && isset($configBlacklist['cookie'])){
                $expiredAt = Carbon::parse($configBlacklist['updated_at'])->addDays(7);
                $remainingDays = now()->diffInDays($expiredAt, false);
                if ($remainingDays > 0) {
                    $resBlackist = "Cookie set. Remaining {$remainingDays} day(s).";
                } else {
                    $resBlackist = "Cookie expired. Please update a new cookie.";
                }
            }
            $notifyConfig = DB::table('system_configs')->where('key', 'shopee_cookie_notify')->value('value');
            $decodedNotify = is_string($notifyConfig) ? json_decode($notifyConfig, true) : null;
            $telegramNotify = (bool) ($decodedNotify['telegram_notify_on_expired'] ?? true);

            return $this->sendResponse([
                'shopee_cookies' => $res,
                'shopee_blacklist_cookies' => $resBlackist,
                'telegram_notify_on_expired' => $telegramNotify,
            ], HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function updateShopeeCookie(Request $request){
        try {
            if ($request->has('telegram_notify_on_expired')) {
                DB::table('system_configs')->updateOrInsert(
                    ['key' => 'shopee_cookie_notify'],
                    [
                        'value' => json_encode(['telegram_notify_on_expired' => (bool) $request->input('telegram_notify_on_expired')]),
                        'description' => 'Cấu hình thông báo Telegram khi Shopee Cookie hết hạn',
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }

            $cookies = $request->input('shopee_cookies');
            if ($cookies) {
                $isBlackList = $request->get('blacklist') ?? false;
                $cookieData = [
                    'cookie' => $cookies,
                    'updated_at' => now(),
                ];
                if($isBlackList){
                    Cache::put(
                        'shopee-blacklist:cookie',
                        $cookieData,
                        60 * 60 * 24 * 7
                    );
                } else {
                    Cache::put(
                        'shopee:cookie',
                        $cookieData,
                        60 * 60 * 24 * 7
                    );
                }

                // Reset Telegram notification flag whenever cookie is updated
                TelegramService::resetCookieExpiredNotificationFlag();
            }

            return $this->sendResponse(null, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
