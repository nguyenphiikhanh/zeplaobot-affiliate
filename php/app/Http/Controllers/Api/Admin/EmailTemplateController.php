<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\Admin\TestSendEmailRequest;
use App\Http\Requests\Admin\UpdateEmailTemplateRequest;
use App\Services\EmailTemplateService;
use App\Utils\HttpUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailTemplateController extends AppBaseController
{
    protected EmailTemplateService $templateService;

    public function __construct(EmailTemplateService $templateService)
    {
        $this->templateService = $templateService;
    }

    public function index()
    {
        try {
            $templates = $this->templateService->getAllTemplates();
            return $this->sendResponse($templates, 'Lấy danh sách email template thành công');
        } catch (\Throwable $e) {
            Log::error("EmailTemplateController index error: " . $e->getMessage());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show(string $key)
    {
        try {
            $template = $this->templateService->getTemplateByKey($key);
            if (!$template) {
                return $this->sendError('Không tìm thấy email template với key: ' . $key, 404);
            }
            return $this->sendResponse($template, 'Lấy chi tiết email template thành công');
        } catch (\Throwable $e) {
            Log::error("EmailTemplateController show error: " . $e->getMessage());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(UpdateEmailTemplateRequest $request, string $key)
    {
        try {
            $template = $this->templateService->getTemplateByKey($key);
            if (!$template) {
                return $this->sendError('Không tìm thấy email template với key: ' . $key, 404);
            }

            $updated = $this->templateService->updateTemplate($key, $request->validated());
            return $this->sendResponse($updated, 'Cập nhật email template thành công');
        } catch (\Throwable $e) {
            Log::error("EmailTemplateController update error: " . $e->getMessage());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function preview(Request $request, string $key)
    {
        try {
            $customBody = $request->input('body_html');
            $customSubject = $request->input('subject');
            $preview = $this->templateService->previewTemplate($key, $customBody, $customSubject);
            return $this->sendResponse($preview, 'Render preview email template thành công');
        } catch (\Throwable $e) {
            Log::error("EmailTemplateController preview error: " . $e->getMessage());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function sendTest(TestSendEmailRequest $request, string $key)
    {
        try {
            $template = $this->templateService->getTemplateByKey($key);
            if (!$template) {
                return $this->sendError('Không tìm thấy email template với key: ' . $key, 404);
            }

            $toEmail = $request->input('to_email');
            $this->templateService->sendTestEmail(
                $key,
                $toEmail,
                $request->input('body_html'),
                $request->input('subject')
            );
            return $this->sendSuccess("Đã gửi email thử nghiệm mẫu [{$template->name}] đến {$toEmail}");
        } catch (\Throwable $e) {
            Log::error("EmailTemplateController sendTest error: " . $e->getMessage());
            return $this->sendError("Không thể gửi email thử nghiệm: " . $e->getMessage(), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function seed()
    {
        try {
            $seeder = new \Database\Seeders\EmailTemplateSeeder();
            $seeder->run();
            $templates = $this->templateService->getAllTemplates();
            return $this->sendResponse($templates, 'Khởi tạo danh sách mẫu email mặc định thành công!');
        } catch (\Throwable $e) {
            Log::error("EmailTemplateController seed error: " . $e->getMessage());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function reset(string $key)
    {
        try {
            $template = $this->templateService->getTemplateByKey($key);
            if (!$template) {
                return $this->sendError('Không tìm thấy email template với key: ' . $key, 404);
            }

            $reset = $this->templateService->resetTemplate($key);
            return $this->sendResponse($reset, 'Khôi phục email template về mặc định thành công');
        } catch (\Throwable $e) {
            Log::error("EmailTemplateController reset error: " . $e->getMessage());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
