<?php

namespace App\Services;

use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Resend\Laravel\Facades\Resend;

class EmailTemplateService
{
    /**
     * Get mock data for variables
     */
    public function getMockData(): array
    {
        return [
            'name' => 'Nguyễn Văn A',
            'email' => 'nguyenvana@example.com',
            'order_id' => '2407289999',
            'amount' => 150000,
            'commission' => 150000,
            'reset_url' => rtrim((string) env('FRONTEND_URL', 'https://app.saffi.vn'), '/')
                . '/dat-lai-mat-khau?token=TEST_RESET_TOKEN',
            'year' => now()->year,
        ];
    }

    /**
     * Get all email templates
     */
    public function getAllTemplates()
    {
        return EmailTemplate::orderBy('id', 'asc')->get();
    }

    /**
     * Get single template by key
     */
    public function getTemplateByKey(string $key): ?EmailTemplate
    {
        return EmailTemplate::where('key', $key)->first();
    }

    /**
     * Update template by key
     */
    public function updateTemplate(string $key, array $data): EmailTemplate
    {
        $template = EmailTemplate::where('key', $key)->firstOrFail();
        $template->update([
            'subject' => $data['subject'] ?? $template->subject,
            'body_html' => $data['body_html'] ?? $template->body_html,
            'is_active' => isset($data['is_active']) ? (bool) $data['is_active'] : $template->is_active,
        ]);

        return $template;
    }

    /**
     * Reset template content from static Blade view file
     */
    public function resetTemplate(string $key): EmailTemplate
    {
        $seeder = new \Database\Seeders\EmailTemplateSeeder();
        $seeder->run();

        return EmailTemplate::where('key', $key)->firstOrFail();
    }

    /**
     * Render subject & body HTML for a template with data
     */
    public function renderTemplate(string $key, array $data = []): array
    {
        $template = $this->getTemplateByKey($key);
        if (!$template || !$template->is_active) {
            return [
                'is_active' => false,
                'subject' => '',
                'html' => '',
            ];
        }

        $subject = $template->subject;
        $bodyHtml = $template->body_html;

        // Standardize {variable} -> {{ $variable }} if written as {name}
        foreach ($data as $varName => $val) {
            $subject = str_replace('{' . $varName . '}', (string) $val, $subject);
            $subject = str_replace('{$' . $varName . '}', (string) $val, $subject);
            $bodyHtml = str_replace('{' . $varName . '}', (string) $val, $bodyHtml);
            $bodyHtml = str_replace('{$' . $varName . '}', (string) $val, $bodyHtml);
        }

        try {
            $renderedHtml = Blade::render($bodyHtml, $data);
        } catch (\Throwable $e) {
            Log::error("Failed to render blade email template [{$key}]: " . $e->getMessage());
            $renderedHtml = $bodyHtml;
        }

        return [
            'is_active' => true,
            'subject' => $subject,
            'html' => $renderedHtml,
        ];
    }

    /**
     * Preview template HTML rendering with mock data or provided custom body
     */
    public function previewTemplate(string $key, ?string $customBody = null, ?string $customSubject = null): array
    {
        $template = $this->getTemplateByKey($key);
        $mockData = $this->getMockData();

        $bodyHtml = $customBody ?? ($template ? $template->body_html : '');
        $subject = $customSubject ?? ($template ? $template->subject : '');

        foreach ($mockData as $varName => $val) {
            $subject = str_replace('{' . $varName . '}', (string) $val, $subject);
            $subject = str_replace('{$' . $varName . '}', (string) $val, $subject);
            $bodyHtml = str_replace('{' . $varName . '}', (string) $val, $bodyHtml);
            $bodyHtml = str_replace('{$' . $varName . '}', (string) $val, $bodyHtml);
        }

        try {
            $renderedHtml = Blade::render($bodyHtml, $mockData);
        } catch (\Throwable $e) {
            $renderedHtml = "<!-- Rendering Error: " . e($e->getMessage()) . " -->\n" . $bodyHtml;
        }

        return [
            'key' => $key,
            'subject' => $subject,
            'html' => $renderedHtml,
            'available_variables' => $template ? $template->available_variables : [],
        ];
    }

    /**
     * Send test email to target address
     */
    public function sendTestEmail(
        string $key,
        string $toEmail,
        ?string $customBody = null,
        ?string $customSubject = null
    ): bool
    {
        $rendered = $this->previewTemplate($key, $customBody, $customSubject);

        Resend::emails()->send([
            'from' => env('RESEND_TRACKING_EMAIL', 'noreply@saffi.vn'),
            'to' => [$toEmail],
            'subject' => '[TEST] ' . $rendered['subject'],
            'html' => $rendered['html'],
        ]);

        return true;
    }
}
