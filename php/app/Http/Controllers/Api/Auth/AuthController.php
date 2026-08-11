<?php

namespace App\Http\Controllers\Api\Auth;

use App\Models\User;
use App\Http\Controllers\AppBaseController;
use App\Utils\HttpUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Services\CheckinGiftConfigService;

class AuthController extends AppBaseController
{
    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $credentials['email'])->first();
            if (!$user) {
                return $this->sendError(
                    'Tài khoản không tồn tại.',
                    HttpUtils::HTTP_UNPROCESSABLE_ENTITY
                );
            }
            if (!$user->hasPassword) {
                return $this->sendError('Tài khoản chưa được thiết lập mật khẩu, vui lòng đăng nhập bằng Goolge và cài đặt mật khẩu trong trang cài đặt.', HttpUtils::HTTP_UNPROCESSABLE_ENTITY);
            }

            if (!password_verify($credentials['password'], $user->password)) {
                return $this->sendError('Sai mật khẩu, vui lòng thử lại hoặc đăng nhập bằng phương thức khác.', HttpUtils::HTTP_UNPROCESSABLE_ENTITY);
            }

            $token = $user->createToken('saffi_auth_token')->plainTextToken;

            return $this->sendResponse([
                'token' => $token,
                'user' => $user,
            ], HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendError($e->validator->errors()->first(), HttpUtils::HTTP_BAD_REQUEST);
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    //
    public function getAuthUser(Request $request, CheckinGiftConfigService $checkinGiftConfig){
        try {
            $user = $request->user();
//            $user->has_password = $user->has_password;
            $systemConfig = DB::table('system_configs')->where('key', 'platforms_status')->first();
            $configData = json_decode($systemConfig->value, true);
            $user->setAttribute('platforms', $configData);
            $user->setAttribute('checkin_gift', $checkinGiftConfig->get());
            return $this->sendResponse($user, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage().$e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
