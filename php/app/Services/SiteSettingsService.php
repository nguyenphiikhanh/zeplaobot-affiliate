<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class SiteSettingsService
{
    public const CONFIG_KEY = 'site_settings';

    public const DEFAULT_SETTINGS = [
        'contact_zalo' => 'https://zalo.me/',
        'contact_email' => 'support@saffi.vn',
        'site_name' => 'Saffi',
        'seo_description' => 'Hoàn tiền mua sắm tự động Shopee, TikTok Shop, Lazada. Tiết kiệm thông minh với mỗi đơn hàng.',
        'logo_light' => '/saffi_logo.webp',
        'favicon' => '/saficon.webp',
        'social_share_image' => '/saffi_gold.webp',
        'loading_image' => '/saffi_gold.webp',
    ];

    public function get(): array
    {
        $stored = DB::table('system_configs')->where('key', self::CONFIG_KEY)->value('value');
        $decoded = is_string($stored) ? json_decode($stored, true) : null;
        $settings = is_array($decoded) ? $decoded : [];

        return [
            'contact_zalo' => (string) ($settings['contact_zalo'] ?? self::DEFAULT_SETTINGS['contact_zalo']),
            'contact_email' => (string) ($settings['contact_email'] ?? self::DEFAULT_SETTINGS['contact_email']),
            'site_name' => (string) ($settings['site_name'] ?? self::DEFAULT_SETTINGS['site_name']),
            'seo_description' => (string) (
                $settings['seo_description'] ?? self::DEFAULT_SETTINGS['seo_description']
            ),
            'logo_light' => (string) ($settings['logo_light'] ?? self::DEFAULT_SETTINGS['logo_light']),
            'favicon' => (string) ($settings['favicon'] ?? self::DEFAULT_SETTINGS['favicon']),
            'social_share_image' => (string) (
                $settings['social_share_image'] ?? self::DEFAULT_SETTINGS['social_share_image']
            ),
            'loading_image' => (string) (
                $settings['loading_image'] ?? self::DEFAULT_SETTINGS['loading_image']
            ),
        ];
    }

    public function update(array $settings): array
    {
        $current = $this->get();
        $normalized = [
            'contact_zalo' => trim($settings['contact_zalo']),
            'contact_email' => trim($settings['contact_email']),
            'site_name' => trim($settings['site_name']),
            'seo_description' => trim($settings['seo_description']),
            'logo_light' => $settings['logo_light'] ?? $current['logo_light'],
            'favicon' => $settings['favicon'] ?? $current['favicon'],
            'social_share_image' => $settings['social_share_image'] ?? $current['social_share_image'],
            'loading_image' => $settings['loading_image'] ?? $current['loading_image'],
        ];

        DB::table('system_configs')->updateOrInsert(
            ['key' => self::CONFIG_KEY],
            [
                'value' => json_encode($normalized, JSON_UNESCAPED_UNICODE),
                'description' => 'Cấu hình liên hệ và thông tin website',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return $normalized;
    }

    public function updateAsset(string $asset, string $url): array
    {
        $settings = $this->get();
        $settings[$asset] = $url;

        return $this->update($settings);
    }
}
