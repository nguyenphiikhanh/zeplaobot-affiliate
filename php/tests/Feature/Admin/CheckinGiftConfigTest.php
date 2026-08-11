<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Services\CheckinGiftConfigService;
use App\Utils\RoleUtils;
use Database\Seeders\SystemConfigSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckinGiftConfigTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemConfigSeeder::class);
    }

    public function test_admin_can_update_checkin_gift_config(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => RoleUtils::ROLE_ADMIN]));

        $this->putJson('/api/admin/system-config/checkin-gift', [
            'enabled' => false,
            'first_checkin_points' => 7,
        ])
            ->assertOk()
            ->assertJsonPath('data.enabled', false)
            ->assertJsonPath('data.first_checkin_points', 7);
    }

    public function test_disabled_feature_blocks_status_and_checkin_api(): void
    {
        app(CheckinGiftConfigService::class)->update([
            'enabled' => false,
            'first_checkin_points' => 2,
        ]);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/spoint/status')->assertForbidden();
        $this->postJson('/api/spoint/checkin')->assertForbidden();
    }

    public function test_only_first_user_receives_configured_early_checkin_points(): void
    {
        app(CheckinGiftConfigService::class)->update([
            'enabled' => true,
            'first_checkin_points' => 7,
        ]);
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();

        Sanctum::actingAs($firstUser);
        $this->postJson('/api/spoint/checkin')
            ->assertOk()
            ->assertJsonPath('data.checkin.early_bird_rank', 1)
            ->assertJsonPath('data.checkin.early_bird_points', 7)
            ->assertJsonPath('data.checkin.total_points', 8);

        Sanctum::actingAs($secondUser);
        $this->postJson('/api/spoint/checkin')
            ->assertOk()
            ->assertJsonPath('data.checkin.early_bird_rank', null)
            ->assertJsonPath('data.checkin.early_bird_points', 0)
            ->assertJsonPath('data.checkin.total_points', 1);

        $this->assertDatabaseCount('spoint_transactions', 3);
        $this->assertDatabaseHas('spoint_transactions', [
            'user_id' => $firstUser->id,
            'type' => 'early_bird',
            'points' => 7,
        ]);
        $this->assertDatabaseMissing('spoint_transactions', [
            'user_id' => $secondUser->id,
            'type' => 'early_bird',
        ]);
    }
}
