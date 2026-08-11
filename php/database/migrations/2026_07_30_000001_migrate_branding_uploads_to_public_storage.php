<?php

use App\Services\SiteSettingsService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        $config = DB::table('system_configs')
            ->where('key', SiteSettingsService::CONFIG_KEY)
            ->first();

        if (!$config) {
            return;
        }

        $settings = json_decode($config->value, true);
        if (!is_array($settings)) {
            return;
        }

        foreach (['logo_light', 'favicon', 'social_share_image', 'loading_image'] as $asset) {
            $oldUrl = $settings[$asset] ?? null;
            if (!is_string($oldUrl) || !str_starts_with($oldUrl, '/uploads/branding/')) {
                continue;
            }

            $filename = basename(parse_url($oldUrl, PHP_URL_PATH));
            $oldPath = public_path('uploads/branding/'.$filename);
            $newPath = 'branding/'.$filename;

            if (File::isFile($oldPath)) {
                Storage::disk('public')->put($newPath, File::get($oldPath));
                File::delete($oldPath);
                $settings[$asset] = '/storage/'.$newPath;
            }
        }

        unset($settings['logo_dark']);

        DB::table('system_configs')
            ->where('key', SiteSettingsService::CONFIG_KEY)
            ->update([
                'value' => json_encode($settings, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // Uploaded files remain in public storage when rolling back.
    }
};
