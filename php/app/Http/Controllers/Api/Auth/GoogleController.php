<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\GoogleAuthRequest;
use App\Models\SocialAccount;
use App\Models\User;
use App\Utils\HttpUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GoogleController extends AppBaseController
{
    public function __construct(
        private readonly \App\Services\AuthService $authService
    ) {}
    public function handleGoogleLogin(GoogleAuthRequest $request)
    {
        try {
            if ($request->filled('id_token')) {
                // One Tap / Google Sign-In
                $payload = $this->authService->loginWithCredentials($request->id_token);
            } else {
                // OAuth Code Flow
                $payload = $this->authService->loginWithCode($request->code);
            }
            if(!$payload){
                return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_UNAUTHORIZED), HttpUtils::HTTP_UNAUTHORIZED);
            }
            $user = null;

            $refCode = $request->input('ref') ?? $request->input('ref_code');

            DB::transaction(function () use ($payload, $refCode, &$user) {
                $user = User::query()->where('email', $payload['email'])->first();
                $isNewUser = !$user;

                if ($isNewUser) {
                    $createData = [
                        'name' => $payload['name'] ?? '',
                    ];

                    if (!empty($refCode)) {
                        $referrer = User::query()->where('referral_code', $refCode)->first();
                        if ($referrer) {
                            $createData['referred_by'] = $referrer->referral_code;
                            $createData['referred_at'] = now();
                        }
                    }

                    $user = User::query()->create(array_merge(['email' => $payload['email']], $createData));
                }

                $user->image = $payload['picture'] ?? null;
                $user->save();

                SocialAccount::query()->firstOrCreate(
                    ['user_id' => $user->id, 'social_id' => $payload['sub'], 'social_provider' => 'google'],
                    ['social_name' => 'Google']
                );
            });

            $token = $user->createToken('saffi_auth_token')->plainTextToken;

            return $this->sendResponse([
                'token' => $token,
                'user' => $user,
            ], HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage().$e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function logout(Request $request){
        try {
            $request->user()->currentAccessToken()->delete();
            return $this->sendResponse(null, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage().$e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
