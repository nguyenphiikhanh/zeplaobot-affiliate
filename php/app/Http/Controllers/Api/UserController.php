<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Utils\AppUtils;
use App\Utils\HttpUtils;
use App\Utils\RoleUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends AppBaseController
{
    //
    public function selfUpdateUser(UpdateUserRequest $request)
    {
        try {
            $user = $request->user();
            $user->fill($request->validated());
            $user->save();
            return $this->sendResponse($user->fresh(), HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getUserList(Request $request){
        try {
            $search = $request->query('search', '');
            $rank = $request->query('rank');
            $limit = $request->query('limit', AppUtils::DEFAULT_LIMIT);
            $query = User::query()->select('users.*')->leftJoin('wallets', 'wallets.user_id', '=', 'users.id')->with(['wallet' => function($q) {
                $q->select('user_id', 'available_balance as availableBalance');
            }]);
            if(!empty($search)){
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            }
            $query->where('users.role', '!=', RoleUtils::ROLE_ADMIN);
            if(!empty($rank)) {
                $query->where('users.rank', $rank);
            }
            $users = $query->orderByDesc('wallets.available_balance')
                ->orderByDesc('users.created_at')->paginate($limit);
            return $this->sendResponse($users, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function updatePassword(Request $request)
    {
        try {
            $user = $request->user();
            $hasPassword = !empty($user->password);

            if ($hasPassword) {
                $request->validate([
                    'current_password' => 'required|string',
                    'password' => 'required|string|min:6|confirmed',
                ], [
                    'current_password.required' => 'Vui lòng nhập mật khẩu hiện tại.',
                    'password.required' => 'Vui lòng nhập mật khẩu mới.',
                    'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
                    'password.confirmed' => 'Mật khẩu xác nhận không khớp.',
                ]);

                if (!\Illuminate\Support\Facades\Hash::check($request->input('current_password'), $user->password)) {
                    return $this->sendError('Mật khẩu hiện tại không chính xác.', HttpUtils::HTTP_BAD_REQUEST);
                }
            } else {
                $request->validate([
                    'password' => 'required|string|min:6|confirmed',
                ], [
                    'password.required' => 'Vui lòng nhập mật khẩu.',
                    'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
                    'password.confirmed' => 'Mật khẩu xác nhận không khớp.',
                ]);
            }

            $user->password = \Illuminate\Support\Facades\Hash::make($request->input('password'));
            $user->save();

            return $this->sendResponse(null, 'Cập nhật mật khẩu thành công.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendError($e->validator->errors()->first(), HttpUtils::HTTP_BAD_REQUEST);
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
