<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Models\User;
use App\Utils\AppUtils;
use App\Utils\HttpUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReferralController extends AppBaseController
{
    /**
     * Get summary statistics for current user's referral program
     */
    public function getSummary(Request $request)
    {
        try {
            $user = $request->user();
            $referralCode = $user->referral_code;

            // Ensure user has a referral code
            if (empty($referralCode)) {
                $referralCode = User::generateReferralCode();
                $user->referral_code = $referralCode;
                $user->save();
            }

            $wallet = $user->wallet;
            $walletId = $wallet ? $wallet->id : null;

            // Calculate total referral commission earned
            $totalCommission = 0;
            if ($walletId) {
                $totalCommission = (int) DB::table('wallet_transactions')
                    ->where('wallet_id', $walletId)
                    ->where('type', AppUtils::WALLET_TRANSACTION_TYPE['referral_commission'])
                    ->where('status', AppUtils::WALLET_TRANSACTION_STATUS['success'])
                    ->sum('amount');
            }

            // Total count of referred users
            $totalReferred = User::query()->where('referred_by', $referralCode)->count();

            // Count of active referred users (within 365 days)
            $cutoffDate = now()->subDays(AppUtils::REFERRAL_VALID_DAYS);
            $activeReferred = User::query()
                ->where('referred_by', $referralCode)
                ->where(function ($q) use ($cutoffDate) {
                    $q->where('referred_at', '>=', $cutoffDate)
                      ->orWhere(function ($sub) use ($cutoffDate) {
                          $sub->whereNull('referred_at')->where('created_at', '>=', $cutoffDate);
                      });
                })->count();

            return $this->sendResponse([
                'referral_code' => $referralCode,
                'total_referred' => $totalReferred,
                'active_referred' => $activeReferred,
                'total_commission' => $totalCommission,
                'commission_rate' => AppUtils::REFERRAL_COMMISSION_RATE,
                'valid_days' => AppUtils::REFERRAL_VALID_DAYS,
            ], HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get paginated list of referred users
     */
    public function getReferrals(Request $request)
    {
        try {
            $user = $request->user();
            $limit = $request->input('limit', AppUtils::DEFAULT_LIMIT);

            $query = User::query()
                ->where('referred_by', $user->referral_code)
                ->select(['id', 'name', 'email', 'image', 'referred_at', 'created_at', 'completed_orders_count'])
                ->orderByDesc('created_at');

            $referrals = $query->paginate($limit);

            // Enhance with active status & days remaining
            $now = now();
            $referrals->getCollection()->transform(function ($item) use ($now) {
                $registeredAt = $item->referred_at ? Carbon::parse($item->referred_at) : Carbon::parse($item->created_at);
                $expiresAt = $registeredAt->copy()->addDays(AppUtils::REFERRAL_VALID_DAYS);
                $isExpired = $now->isAfter($expiresAt);
                $daysRemaining = $isExpired ? 0 : (int) ceil($now->diffInDays($expiresAt, false));

                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'email' => $item->email,
                    'image' => $item->image,
                    'registered_at' => $registeredAt->toDateTimeString(),
                    'expires_at' => $expiresAt->toDateTimeString(),
                    'is_active' => !$isExpired,
                    'days_remaining' => max(0, $daysRemaining),
                    'completed_orders_count' => $item->completed_orders_count ?? 0,
                ];
            });

            return $this->sendResponse($referrals, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
