<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SystemConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        DB::table('system_configs')->updateOrInsert(
            ['key' => 'platforms_status'],
            [
                'value' => json_encode([
                    'shopee' => true,
                    'tiktok' => false,
                    'lazada' => false,
                    'shopeefood' => false,
                ]),
                'description' => 'Trạng thái hoạt động của các sàn affiliate',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        DB::table('system_configs')->updateOrInsert(
            ['key' => \App\Services\CommissionConfigService::CONFIG_KEY],
            [
                'value' => json_encode(\App\Services\CommissionConfigService::DEFAULT_SETTINGS),
                'description' => 'Cấu hình tỷ lệ hoàn tiền theo từng sàn',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        DB::table('system_configs')->updateOrInsert(
            ['key' => \App\Services\CheckinGiftConfigService::CONFIG_KEY],
            [
                'value' => json_encode(\App\Services\CheckinGiftConfigService::DEFAULT_SETTINGS),
                'description' => 'Cấu hình chức năng quà điểm danh',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        DB::table('system_configs')->updateOrInsert(
            ['key' => \App\Services\SiteSettingsService::CONFIG_KEY],
            [
                'value' => json_encode(
                    \App\Services\SiteSettingsService::DEFAULT_SETTINGS,
                    JSON_UNESCAPED_UNICODE
                ),
                'description' => 'Cấu hình liên hệ và thông tin website',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }
}
