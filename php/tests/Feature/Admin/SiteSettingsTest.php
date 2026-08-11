<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Utils\RoleUtils;
use Database\Seeders\SystemConfigSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SiteSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SystemConfigSeeder::class);
    }

    public function test_site_settings_are_publicly_readable(): void
    {
        $this->getJson('/api/site-settings')
            ->assertOk()
            ->assertJsonPath('data.contact_email', 'support@saffi.vn')
            ->assertJsonPath('data.site_name', 'Saffi')
            ->assertJsonPath('data.logo_light', '/saffi_logo.webp')
            ->assertJsonPath('data.favicon', '/saficon.webp')
            ->assertJsonPath('data.loading_image', '/saffi_gold.webp');
    }

    public function test_admin_can_update_contact_and_website_settings(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => RoleUtils::ROLE_ADMIN]));

        $settings = [
            'contact_zalo' => 'https://zalo.me/g/example',
            'contact_email' => 'hello@example.com',
            'site_name' => 'Saffi Test',
            'seo_description' => 'Mô tả SEO được cấu hình từ trang quản trị.',
        ];

        $this->putJson('/api/admin/system-config/site-settings', $settings)
            ->assertOk()
            ->assertJsonPath('data.contact_zalo', $settings['contact_zalo'])
            ->assertJsonPath('data.contact_email', $settings['contact_email'])
            ->assertJsonPath('data.site_name', $settings['site_name'])
            ->assertJsonPath('data.seo_description', $settings['seo_description']);

        $this->get('/')
            ->assertOk()
            ->assertSee('<title>Saffi Test</title>', false)
            ->assertSee('name="description" content="' . $settings['seo_description'] . '"', false);
    }

    public function test_uploading_new_branding_image_replaces_previous_uploaded_file(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create(['role' => RoleUtils::ROLE_ADMIN]));
        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII='
        );

        $firstResponse = $this->post('/api/admin/system-config/site-settings/assets/logo_light', [
            'image' => UploadedFile::fake()->createWithContent('logo-first.png', $png),
        ])->assertOk();

        $firstUrl = $firstResponse->json('data.logo_light');
        $firstFilename = basename($firstUrl);
        $this->assertStringStartsWith('/storage/branding/', $firstUrl);
        Storage::disk('public')->assertExists('branding/'.$firstFilename);

        $secondResponse = $this->post('/api/admin/system-config/site-settings/assets/logo_light', [
            'image' => UploadedFile::fake()->createWithContent('logo-second.png', $png),
        ])->assertOk();

        $secondFilename = basename($secondResponse->json('data.logo_light'));
        Storage::disk('public')->assertExists('branding/'.$secondFilename);
        Storage::disk('public')->assertMissing('branding/'.$firstFilename);
    }
}
