<?php

namespace Tests\Feature\Admin;

use App\Models\EmailTemplate;
use App\Models\User;
use App\Utils\RoleUtils;
use Database\Seeders\EmailTemplateSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailTemplateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(EmailTemplateSeeder::class);
    }

    public function test_non_admin_cannot_access_email_template_routes()
    {
        $user = User::factory()->create([
            'role' => RoleUtils::ROLE_USER ?? 'USER',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/email-templates');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_email_templates()
    {
        $admin = User::factory()->create([
            'role' => RoleUtils::ROLE_ADMIN,
        ]);
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/email-templates');
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertCount(4, $response->json('data'));
    }

    public function test_admin_can_get_single_email_template_by_key()
    {
        $admin = User::factory()->create([
            'role' => RoleUtils::ROLE_ADMIN,
        ]);
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/email-templates/new_order');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.key', 'new_order');
    }

    public function test_admin_can_update_email_template()
    {
        $admin = User::factory()->create([
            'role' => RoleUtils::ROLE_ADMIN,
        ]);
        Sanctum::actingAs($admin);

        $payload = [
            'subject' => '[SAFFI NEW SUBJECT] Đơn hàng #{order_id}',
            'body_html' => '<h1>Xin chào {name}</h1><p>Đơn hàng #{order_id} nhận được {amount} đ</p>',
            'is_active' => false,
        ];

        $response = $this->putJson('/api/admin/email-templates/new_order', $payload);
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.subject', '[SAFFI NEW SUBJECT] Đơn hàng #{order_id}')
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('email_templates', [
            'key' => 'new_order',
            'subject' => '[SAFFI NEW SUBJECT] Đơn hàng #{order_id}',
            'is_active' => false,
        ]);
    }

    public function test_admin_can_preview_email_template()
    {
        $admin = User::factory()->create([
            'role' => RoleUtils::ROLE_ADMIN,
        ]);
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/email-templates/new_order/preview', [
            'subject' => 'Test Preview {order_id}',
            'body_html' => '<div>Preview for {name}</div>',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.subject', 'Test Preview 2407289999');
    }

    public function test_reset_password_preview_replaces_all_supported_variables()
    {
        $admin = User::factory()->create([
            'role' => RoleUtils::ROLE_ADMIN,
        ]);
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/email-templates/reset_password/preview', [
            'subject' => 'Reset {email} - {year}',
            'body_html' => '<p>{name}</p><a href="{reset_url}">{email}</a><footer>{year}</footer>',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonMissing(['{email}', '{reset_url}', '{year}'])
            ->assertJsonPath('data.subject', 'Reset nguyenvana@example.com - ' . now()->year);

        $this->assertStringContainsString(
            'https://app.saffi.vn/dat-lai-mat-khau?token=TEST_RESET_TOKEN',
            $response->json('data.html')
        );
    }

    public function test_admin_can_reset_email_template()
    {
        $admin = User::factory()->create([
            'role' => RoleUtils::ROLE_ADMIN,
        ]);
        Sanctum::actingAs($admin);

        // First modify
        $template = EmailTemplate::where('key', 'new_order')->first();
        $template->update(['subject' => 'Modified Subject', 'is_active' => false]);

        // Reset
        $response = $this->postJson('/api/admin/email-templates/new_order/reset');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.subject', '[SAFFI] ĐƠN HÀNG #{order_id} ĐÃ ĐƯỢC GHI NHẬN')
            ->assertJsonPath('data.is_active', true);
    }
}
