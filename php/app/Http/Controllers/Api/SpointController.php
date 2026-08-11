<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Models\DailyCheckin;
use App\Models\DailyCheckinCounter;
use App\Models\SpointTransaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\CheckinGiftConfigService;
use App\Utils\AppUtils;
use App\Utils\HttpUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SpointController extends AppBaseController
{
    public function __construct(private readonly CheckinGiftConfigService $checkinGiftConfig)
    {
    }

    /**
     * Get current user's checkin & S-Point status.
     */
    public function status(Request $request)
    {
        try {
            $giftConfig = $this->checkinGiftConfig->get();
            if (!$giftConfig['enabled']) {
                return $this->sendError(
                    'Chức năng quà điểm danh hiện đang tạm tắt.',
                    HttpUtils::HTTP_FORBIDDEN
                );
            }

            $user = $request->user();
            $today = Carbon::today()->toDateString();

            $todayCheckin = DailyCheckin::where('user_id', $user->id)
                ->where('checkin_date', $today)
                ->first();

            $checkedInToday = !is_null($todayCheckin);

            // Determine current streak display
            if ($checkedInToday) {
                $currentStreak = $todayCheckin->streak_count;
            } else {
                $lastCheckin = DailyCheckin::where('user_id', $user->id)
                    ->orderBy('checkin_date', 'desc')
                    ->first();

                if ($lastCheckin && Carbon::parse($lastCheckin->checkin_date)->isYesterday()) {
                    $currentStreak = $user->spoint_streak;
                } else {
                    $currentStreak = 0;
                }
            }

            $earlyBirdsToday = DailyCheckin::where('checkin_date', $today)
                ->where('early_bird_rank', 1)
                ->with('user:id,name,email,image')
                ->get();

            $data = [
                'spoint_balance' => (int) $user->spoint_balance,
                'spoint_total' => (int) ($user->spoint_total ?? $user->spoint_balance),
                'spoint_streak' => (int) $currentStreak,
                'checked_in_today' => $checkedInToday,
                'today_checkin' => $todayCheckin,
                'early_birds_today' => $earlyBirdsToday,
                'first_checkin_points' => $giftConfig['first_checkin_points'],
                'exchange_options' => $giftConfig['exchange_options'] ?? [],
                'checkin_gift_enabled' => (bool) ($giftConfig['enabled'] ?? true),
                'turnstile_site_key' => config('services.turnstile.site_key'),
            ];

            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Perform daily checkin.
     */
    public function checkin(Request $request)
    {
        try {
            $giftConfig = $this->checkinGiftConfig->get();
            if (!$giftConfig['enabled']) {
                return $this->sendError(
                    'Chức năng quà điểm danh hiện đang tạm tắt.',
                    HttpUtils::HTTP_FORBIDDEN
                );
            }

            // Verify Cloudflare Turnstile CAPTCHA token
            $turnstileSecret = config('services.turnstile.secret_key');
            if (!empty($turnstileSecret)) {
                $turnstileToken = $request->input('cf_turnstile_response') ?? $request->input('turnstile_token');
                if (empty($turnstileToken)) {
                    return $this->sendError(
                        'Vui lòng hoàn thành xác thực chống bot (Captcha) trước khi điểm danh!',
                        HttpUtils::HTTP_BAD_REQUEST
                    );
                }

                $verifyResponse = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                    'secret' => $turnstileSecret,
                    'response' => $turnstileToken,
                    'remoteip' => $request->ip(),
                ]);

                if (!$verifyResponse->successful() || !($verifyResponse->json('success') ?? false)) {
                    Log::warning('Turnstile checkin verification failed', [
                        'user_id' => $request->user()->id,
                        'ip' => $request->ip(),
                        'errors' => $verifyResponse->json('error-codes', []),
                    ]);

                    return $this->sendError(
                        'Request không hợp lệ. Vui lòng thử lại!',
                        HttpUtils::HTTP_BAD_REQUEST
                    );
                }
            }

            $user = $request->user();
            $today = Carbon::today()->toDateString();


            return DB::transaction(function () use ($user, $today, $giftConfig) {
                /** @var User $lockedUser */
                $lockedUser = User::where('id', $user->id)->lockForUpdate()->first();

                $alreadyCheckedIn = DailyCheckin::where('user_id', $lockedUser->id)
                    ->where('checkin_date', $today)
                    ->exists();

                if ($alreadyCheckedIn) {
                    return $this->sendError('Bạn đã điểm danh ngày hôm nay rồi!', HttpUtils::HTTP_BAD_REQUEST);
                }

                // Lock the daily checkin counter row for TODAY atomically across ALL users!
                // Using lockForUpdate() on the today counter row serializes all concurrent checkins for today.
                $counter = DailyCheckinCounter::whereDate('checkin_date', $today)->lockForUpdate()->first();
                if (!$counter) {
                    $counter = DailyCheckinCounter::create([
                        'checkin_date' => $today,
                        'checkin_count' => 0,
                    ]);
                    $counter = DailyCheckinCounter::where('id', $counter->id)->lockForUpdate()->first();
                }

                $todayRank = $counter->checkin_count + 1;
                $counter->checkin_count = $todayRank;
                $counter->save();

                // Calculate streak count
                $lastCheckin = DailyCheckin::where('user_id', $lockedUser->id)
                    ->orderBy('checkin_date', 'desc')
                    ->first();

                if ($lastCheckin && Carbon::parse($lastCheckin->checkin_date)->isYesterday()) {
                    $newStreak = ($lockedUser->spoint_streak % 5) + 1;
                } else {
                    $newStreak = 1;
                }

                // Base points (Day 5 gives +2 points, other days give +1 point)
                $basePoints = ($newStreak === 5) ? 2 : 1;

                // Calculate Early Bird Bonus using atomic $todayRank
                $earlyBirdRank = null;
                $earlyBirdPoints = 0;

                if ($todayRank === 1) {
                    $earlyBirdRank = 1;
                    $earlyBirdPoints = $giftConfig['first_checkin_points'];
                }

                $totalPoints = $basePoints + $earlyBirdPoints;

                // Create check-in record
                $checkin = DailyCheckin::create([
                    'user_id' => $lockedUser->id,
                    'checkin_date' => $today,
                    'streak_count' => $newStreak,
                    'base_points' => $basePoints,
                    'early_bird_rank' => $earlyBirdRank,
                    'early_bird_points' => $earlyBirdPoints,
                    'total_points' => $totalPoints,
                ]);

                // Update user balance, total accumulated points & streak
                $lockedUser->spoint_balance += $totalPoints;
                $lockedUser->spoint_total += $totalPoints;
                $lockedUser->spoint_streak = $newStreak;
                $lockedUser->last_checkin_at = Carbon::now();
                $lockedUser->save();

                // Log SpointTransaction for check-in
                $streakDesc = ($newStreak === 5)
                    ? 'Điểm danh Ngày 5 (Thưởng chuỗi 5 ngày +2 S-Point)'
                    : "Điểm danh hàng ngày (Ngày {$newStreak}/5)";

                SpointTransaction::create([
                    'user_id' => $lockedUser->id,
                    'type' => 'checkin',
                    'points' => $basePoints,
                    'amount_vnd' => 0,
                    'description' => $streakDesc,
                ]);

                // Log SpointTransaction for early bird if applicable
                if ($earlyBirdPoints > 0) {
                    SpointTransaction::create([
                        'user_id' => $lockedUser->id,
                        'type' => 'early_bird',
                        'points' => $earlyBirdPoints,
                        'amount_vnd' => 0,
                        'description' => "Thưởng người điểm danh sớm nhất (+{$earlyBirdPoints} S-Point)",
                    ]);
                }

                $resultData = [
                    'checkin' => $checkin,
                    'spoint_balance' => (int) $lockedUser->spoint_balance,
                    'spoint_total' => (int) $lockedUser->spoint_total,
                    'spoint_streak' => (int) $newStreak,
                ];

                return $this->sendResponse($resultData, "Điểm danh thành công! Bạn nhận được +{$totalPoints} S-Point.");
            });
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Top 10 S-Point leaderboard.
     */
    public function leaderboard(Request $request)
    {
        try {
            $topUsers = User::where(function ($q) {
                    $q->where('spoint_total', '>=', 1)
                      ->orWhere('spoint_balance', '>=', 1);
                })
                ->orderBy(DB::raw('GREATEST(spoint_total, spoint_balance)'), 'desc')
                ->take(10)
                ->get(['id', 'name', 'email', 'image', 'spoint_balance', 'spoint_total', 'rank']);

            $formattedUsers = $topUsers->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'image' => $u->image,
                    'spoint_balance' => (int) max($u->spoint_total, $u->spoint_balance),
                    'spoint_total' => (int) max($u->spoint_total, $u->spoint_balance),
                    'rank' => $u->rank,
                ];
            });

            return $this->sendResponse($formattedUsers, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Lấy lịch sử tích lũy/nhận S-Point của người dùng
     * Bao gồm:
     * - TYPE_CHECKIN: Thưởng điểm danh hàng ngày
     * - TYPE_EARLY_BIRD: Thưởng điểm danh sớm
     * - TYPE_REFERRAL_FIRST_ORDER: Thưởng 5 S-Point cho đơn hàng đầu tiên từ chương trình giới thiệu
     */
    public function history(Request $request)
    {
        try {
            $historyTypes = [
                SpointTransaction::TYPE_CHECKIN,
                SpointTransaction::TYPE_EARLY_BIRD,
                SpointTransaction::TYPE_REFERRAL_FIRST_ORDER,
            ];

            $history = SpointTransaction::where('user_id', $request->user()->id)
                ->whereIn('type', $historyTypes)
                ->orderBy('id', 'desc')
                ->paginate(15);

            return $this->sendResponse($history, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Exchange S-Point to cash.
     */
    public function exchange(Request $request)
    {
        try {
            $config = $this->checkinGiftConfig->get();
            if (!$config['enabled']) {
                return $this->sendError('Chức năng quy đổi S-Point hiện đang tạm khóa.', HttpUtils::HTTP_UNPROCESSABLE_ENTITY);
            }

            $exchangeOptions = $config['exchange_options'] ?? [];
            $minPoints = !empty($exchangeOptions) ? (int) $exchangeOptions[0]['points'] : 6;

            $request->validate([
                'points' => "required|integer|min:{$minPoints}",
            ], [
                'points.required' => 'Vui lòng nhập số S-Point cần quy đổi.',
                'points.integer' => 'Số điểm quy đổi phải là số nguyên.',
                'points.min' => "Số S-Point quy đổi tối thiểu là {$minPoints} S-Point.",
            ]);

            $points = (int) $request->points;

            $user = $request->user();

            return DB::transaction(function () use ($user, $points, $exchangeOptions) {
                /** @var User $lockedUser */
                $lockedUser = User::where('id', $user->id)->lockForUpdate()->first();

                if ($lockedUser->spoint_balance < $points) {
                    return $this->sendError('Số dư S-Point của bạn không đủ để thực hiện quy đổi này.', HttpUtils::HTTP_UNPROCESSABLE_ENTITY);
                }

                // Check exact match or calculate proportional rate based on configured tiers
                $exactMatch = null;
                foreach ($exchangeOptions as $opt) {
                    if ((int) $opt['points'] === $points) {
                        $exactMatch = $opt;
                        break;
                    }
                }

                if ($exactMatch) {
                    $vndAmount = (int) $exactMatch['amount_vnd'];
                } else {
                    $bestTier = $exchangeOptions[0];
                    foreach ($exchangeOptions as $opt) {
                        if ($points >= (int) $opt['points']) {
                            $bestTier = $opt;
                        }
                    }
                    $vndAmount = (int) round(($points / (int) $bestTier['points']) * (int) $bestTier['amount_vnd']);
                }

                // Deduct S-Point balance
                $lockedUser->spoint_balance -= $points;
                $lockedUser->save();

                // Find or create user wallet & credit available_balance
                $wallet = Wallet::firstOrCreate(
                    ['user_id' => $lockedUser->id],
                    ['available_balance' => 0, 'pending_balance' => 0, 'total_paid' => 0]
                );

                $wallet->available_balance += $vndAmount;
                $wallet->save();

                // Create WalletTransaction with type 'point'
                WalletTransaction::create([
                    'wallet_id' => $wallet->id,
                    'amount' => $vndAmount,
                    'type' => AppUtils::WALLET_TRANSACTION_TYPE['point'], // 'point'
                    'status' => AppUtils::WALLET_TRANSACTION_STATUS['success'], // 'success'
                    'description' => "Quy đổi {$points} S-Point sang " . number_format($vndAmount) . " VNĐ vào ví",
                ]);

                // Create SpointTransaction
                $spointTx = SpointTransaction::create([
                    'user_id' => $lockedUser->id,
                    'type' => 'exchange',
                    'points' => -$points,
                    'amount_vnd' => $vndAmount,
                    'description' => "Đổi {$points} S-Point nhận " . number_format($vndAmount) . " VNĐ",
                ]);

                $resultData = [
                    'spoint_balance' => (int) $lockedUser->spoint_balance,
                    'available_balance' => (int) $wallet->available_balance,
                    'amount_vnd' => $vndAmount,
                    'transaction' => $spointTx,
                ];

                return $this->sendResponse($resultData, "Đã quy đổi thành công {$points} S-Point thành " . number_format($vndAmount) . " VNĐ vào Ví!");
            });
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return $this->sendError($ve->getMessage(), HttpUtils::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * User's S-Point cash redemption history.
     */
    public function exchanges(Request $request)
    {
        try {
            $exchanges = SpointTransaction::where('user_id', $request->user()->id)
                ->where('type', 'exchange')
                ->orderBy('id', 'desc')
                ->paginate(15);

            return $this->sendResponse($exchanges, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Admin: Xem lịch sử tích lũy & quy đổi S-Point của tất cả người dùng
     */
    public function adminHistory(Request $request)
    {
        try {
            $query = SpointTransaction::with('user:id,name,email,image');

            if ($request->filled('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($qSub) use ($search) {
                    $qSub->whereHas('user', function ($qUser) use ($search) {
                        $qUser->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })->orWhere('description', 'like', "%{$search}%");
                });
            }

            $perPage = (int) ($request->per_page ?? 15);
            $history = $query->orderBy('id', 'desc')->paginate($perPage);

            return $this->sendResponse($history, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
