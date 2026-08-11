<?php

namespace App\Services;

use App\Utils\AppUtils;
use Illuminate\Support\Facades\DB;

class CommissionConfigService
{
    public const CONFIG_KEY = 'commission_settings';

    public const DEFAULT_SETTINGS = [
        'shopee' => [
            'rank_rates' => ['silver' => 60, 'gold' => 70, 'obsidian' => 80],
            'sale_day_bonus' => 10,
            'service_fee' => 0.98,
            'tax' => 10,
        ],
        'tiktok' => [
            'rank_rates' => ['silver' => 60, 'gold' => 70, 'obsidian' => 80],
            'sale_day_bonus' => 10,
            'service_fee' => 0,
            'tax' => 0,
        ],
        'lazada' => [
            'rank_rates' => ['silver' => 60, 'gold' => 70, 'obsidian' => 80],
            'sale_day_bonus' => 10,
            'service_fee' => 0,
            'tax' => 0,
        ],
    ];

    public function getAll(): array
    {
        $stored = DB::table('system_configs')->where('key', self::CONFIG_KEY)->value('value');
        $decoded = is_string($stored) ? json_decode($stored, true) : null;

        return $this->normalize(is_array($decoded) ? $decoded : []);
    }

    public function update(array $settings): array
    {
        $normalized = $this->normalize($settings);

        DB::table('system_configs')->updateOrInsert(
            ['key' => self::CONFIG_KEY],
            [
                'value' => json_encode($normalized),
                'description' => 'Cấu hình tỷ lệ hoàn tiền theo từng sàn',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return $normalized;
    }

    public function getPlatform(string $platform): array
    {
        // ShopeeFood sử dụng chung toàn bộ cấu hình hoàn tiền của Shopee.
        $platform = $platform === 'shopeefood' ? 'shopee' : $platform;

        return $this->getAll()[$platform] ?? self::DEFAULT_SETTINGS['shopee'];
    }

    public function getGrossRate(?string $rank, string $platform, bool $isSaleDay = false): float
    {
        return $this->getRates($rank, $platform, $isSaleDay)['gross'];
    }

    public function getNetRate(?string $rank, string $platform, bool $isSaleDay = false): float
    {
        return $this->getRates($rank, $platform, $isSaleDay)['net'];
    }

    public function getRates(?string $rank, string $platform, bool $isSaleDay = false): array
    {
        $config = $this->getPlatform($platform);
        $rank = in_array($rank, AppUtils::USER_RANK, true) ? $rank : AppUtils::DEFAULT_USER_RANK;
        $grossRate = (float) $config['rank_rates'][$rank]
            + ($isSaleDay ? (float) $config['sale_day_bonus'] : 0);

        return [
            'gross' => $grossRate,
            'net' => max(
                0,
                $grossRate
                    * (1 - (float) $config['service_fee'] / 100)
                    * (1 - (float) $config['tax'] / 100)
            ),
        ];
    }

    private function normalize(array $settings): array
    {
        $normalized = [];

        foreach (self::DEFAULT_SETTINGS as $platform => $defaults) {
            $input = is_array($settings[$platform] ?? null) ? $settings[$platform] : [];
            $rankRates = is_array($input['rank_rates'] ?? null) ? $input['rank_rates'] : [];

            $normalized[$platform] = [
                'rank_rates' => [
                    'silver' => (float) ($rankRates['silver'] ?? $defaults['rank_rates']['silver']),
                    'gold' => (float) ($rankRates['gold'] ?? $defaults['rank_rates']['gold']),
                    'obsidian' => (float) ($rankRates['obsidian'] ?? $defaults['rank_rates']['obsidian']),
                ],
                'sale_day_bonus' => (float) ($input['sale_day_bonus'] ?? $defaults['sale_day_bonus']),
                'service_fee' => (float) ($input['service_fee'] ?? $defaults['service_fee']),
                'tax' => (float) ($input['tax'] ?? $defaults['tax']),
            ];
        }

        return $normalized;
    }
}
