<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Services\CommissionConfigService;
use App\Utils\RoleUtils;
use Database\Seeders\SystemConfigSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommissionConfigTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemConfigSeeder::class);
    }

    public function test_admin_can_get_default_commission_settings(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => RoleUtils::ROLE_ADMIN]));

        $this->getJson('/api/admin/system-config/commission')
            ->assertOk()
            ->assertJsonPath('data.shopee.rank_rates.silver', 60)
            ->assertJsonPath('data.shopee.rank_rates.gold', 70)
            ->assertJsonPath('data.shopee.rank_rates.obsidian', 80)
            ->assertJsonPath('data.shopee.sale_day_bonus', 10)
            ->assertJsonPath('data.shopee.service_fee', 0.98)
            ->assertJsonPath('data.shopee.tax', 10)
            ->assertJsonPath('data.tiktok.service_fee', 0)
            ->assertJsonPath('data.lazada.tax', 0);
    }

    public function test_admin_can_update_commission_settings(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => RoleUtils::ROLE_ADMIN]));
        $settings = CommissionConfigService::DEFAULT_SETTINGS;
        $settings['tiktok']['rank_rates']['silver'] = 65;
        $settings['tiktok']['service_fee'] = 1.5;

        $this->putJson('/api/admin/system-config/commission', ['settings' => $settings])
            ->assertOk()
            ->assertJsonPath('data.tiktok.rank_rates.silver', 65)
            ->assertJsonPath('data.tiktok.service_fee', 1.5);

        $this->assertEqualsWithDelta(
            64.025,
            app(CommissionConfigService::class)->getNetRate('silver', 'tiktok'),
            0.00001
        );
    }

    public function test_shopeefood_uses_shopee_commission_settings(): void
    {
        $rates = app(CommissionConfigService::class)
            ->getRates('gold', 'shopeefood', true);

        $this->assertSame(80.0, $rates['gross']);
        $this->assertEqualsWithDelta(71.2944, $rates['net'], 0.00001);
    }
}
