<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class CheckinGiftConfigService
{
    public const CONFIG_KEY = 'checkin_gift';

    public const DEFAULT_SETTINGS = [
        'enabled' => true,
        'first_checkin_points' => 2,
        'exchange_options' => [
            ['points' => 6, 'amount_vnd' => 2000],
            ['points' => 12, 'amount_vnd' => 4000],
            ['points' => 30, 'amount_vnd' => 12000],
            ['points' => 60, 'amount_vnd' => 24000],
        ],
    ];

    public function get(): array
    {
        $stored = DB::table('system_configs')->where('key', self::CONFIG_KEY)->value('value');
        $decoded = is_string($stored) ? json_decode($stored, true) : null;

        $rawOptions = $decoded['exchange_options'] ?? self::DEFAULT_SETTINGS['exchange_options'];
        $options = $this->normalizeExchangeOptions(is_array($rawOptions) ? $rawOptions : self::DEFAULT_SETTINGS['exchange_options']);

        return [
            'enabled' => (bool) ($decoded['enabled'] ?? self::DEFAULT_SETTINGS['enabled']),
            'first_checkin_points' => (int) (
                $decoded['first_checkin_points'] ?? self::DEFAULT_SETTINGS['first_checkin_points']
            ),
            'exchange_options' => $options,
        ];
    }

    public function update(array $settings): array
    {
        $rawOptions = $settings['exchange_options'] ?? self::DEFAULT_SETTINGS['exchange_options'];
        $options = $this->normalizeExchangeOptions(is_array($rawOptions) ? $rawOptions : self::DEFAULT_SETTINGS['exchange_options']);

        $normalized = [
            'enabled' => (bool) $settings['enabled'],
            'first_checkin_points' => (int) $settings['first_checkin_points'],
            'exchange_options' => $options,
        ];

        DB::table('system_configs')->updateOrInsert(
            ['key' => self::CONFIG_KEY],
            [
                'value' => json_encode($normalized),
                'description' => 'Cấu hình chức năng quà điểm danh',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return $normalized;
    }

    private function normalizeExchangeOptions(array $rawOptions): array
    {
        $options = [];
        foreach ($rawOptions as $opt) {
            if (!is_array($opt)) continue;
            $pts = (int) ($opt['points'] ?? 0);
            $vnd = (int) ($opt['amount_vnd'] ?? 0);
            if ($pts > 0 && $vnd >= 0) {
                $options[] = [
                    'points' => $pts,
                    'amount_vnd' => $vnd,
                ];
            }
        }

        if (empty($options)) {
            $options = self::DEFAULT_SETTINGS['exchange_options'];
        }

        usort($options, fn ($a, $b) => $a['points'] <=> $b['points']);

        return array_values($options);
    }
}
