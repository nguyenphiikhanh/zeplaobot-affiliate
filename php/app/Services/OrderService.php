<?php

namespace App\Services;

use App\Jobs\ResendSendEmailJob;
use App\Models\Order;
use App\Models\User;
use App\Services\TelegramService;
use App\Utils\AppUtils;
use App\Utils\JobUtils;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class OrderService
{
    private const SHOPEE_ORDER_STATUS = [
        1 => AppUtils::ORDER_STATUS['pending'],
        2 => AppUtils::ORDER_STATUS['completed'],
        3 => AppUtils::ORDER_STATUS['cancelled'],
        4 => AppUtils::ORDER_STATUS['unpaid'],
    ];
    private const SHOPEE_ORDER_ENDPOINT = '/report/list';
    public static function processOrderCompleted(Order $order, User $user){
        $user->increment('completed_orders_count', 1);
        $userRank = $user->rank ?? AppUtils::DEFAULT_USER_RANK;
        $remainingOrder = AppUtils::getOrderRemainByRank($userRank, $user->completed_orders_count);
        $isUpgradeRank = AppUtils::checkRankIsUpgrade((int) $user->completed_orders_count);
        $user->update([
            'rank' => $isUpgradeRank ? AppUtils::getNextRank($userRank) : $userRank,
            'orders_to_next_rank' => $remainingOrder,
        ]);

        $wallet = $user->wallet ?: Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['available_balance' => 0, 'pending_balance' => 0, 'total_paid' => 0]
        );
        $wallet->increment('available_balance', $order->user_commission);
        $wallet->transactions()->create([
            'type' => AppUtils::WALLET_TRANSACTION_TYPE['commission'],
            'amount' => $order->user_commission,
            'status' => AppUtils::WALLET_TRANSACTION_STATUS['success'],
            'description' => "Hoa hồng đơn hàng #{$order->order_id}",
            'reference_id' => $order->order_id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Process referral commission for referrer (5% within 365 days)
        if (!empty($user->referred_by)) {
            $referredAt = $user->referred_at ?? $user->created_at;
            $orderTime = $order->order_time ? Carbon::parse($order->order_time) : now();
            $isWithinValidPeriod = $referredAt && Carbon::parse($referredAt)->addDays(AppUtils::REFERRAL_VALID_DAYS)->isAfter($orderTime);

            if ($isWithinValidPeriod) {
                $referrer = User::query()->where('referral_code', $user->referred_by)->first();
                if ($referrer) {
                    $referralCommission = (int) round($order->user_commission * (AppUtils::REFERRAL_COMMISSION_RATE / 100));
                    if ($referralCommission > 0) {
                        $referrerWallet = $referrer->wallet ?: Wallet::firstOrCreate(
                            ['user_id' => $referrer->id],
                            ['available_balance' => 0, 'pending_balance' => 0, 'total_paid' => 0]
                        );
                        $referrerWallet->increment('available_balance', $referralCommission);
                        $referrerWallet->transactions()->create([
                            'type' => AppUtils::WALLET_TRANSACTION_TYPE['referral_commission'],
                            'amount' => $referralCommission,
                            'status' => AppUtils::WALLET_TRANSACTION_STATUS['success'],
                            'description' => "Hoa hồng từ đơn hàng của {$user->name}",
                            'reference_id' => $order->order_id,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        // First order bonus: Both Referrer and Referred User receive S-Points
        if ((int) $user->completed_orders_count === 1 && !empty($user->referred_by)) {
            $referrerUser = User::query()->where('referral_code', $user->referred_by)->first();
            if ($referrerUser) {
                $rewardPoints = AppUtils::REFERRAL_FIRST_ORDER_SPOINT;

                // Reward S-Points to Referred User
                $user->increment('spoint_balance', $rewardPoints);
                $user->increment('spoint_total', $rewardPoints);
                \App\Models\SpointTransaction::create([
                    'user_id' => $user->id,
                    'type' => \App\Models\SpointTransaction::TYPE_REFERRAL_FIRST_ORDER,
                    'points' => $rewardPoints,
                    'description' => "Thưởng {$rewardPoints} S-Point từ đơn hàng đầu tiên (Chương trình giới thiệu)",
                ]);

                // Reward S-Points to Referrer
                $referrerUser->increment('spoint_balance', $rewardPoints);
                $referrerUser->increment('spoint_total', $rewardPoints);
                \App\Models\SpointTransaction::create([
                    'user_id' => $referrerUser->id,
                    'type' => \App\Models\SpointTransaction::TYPE_REFERRAL_FIRST_ORDER,
                    'points' => $rewardPoints,
                    'description' => "Thưởng {$rewardPoints} S-Point khi bạn bè ({$user->name}) hoàn thành đơn hàng đầu tiên",
                ]);
            }
        }

        ResendSendEmailJob::dispatch($user, $order, AppUtils::ORDER_STATUS['completed'])->onQueue(JobUtils::RESEND_EMAIL);
    }

    public static function processOrderNew(Order $order, User $user){
        ResendSendEmailJob::dispatch($user, $order, AppUtils::ORDER_STATUS['pending'])->onQueue(JobUtils::RESEND_EMAIL);
    }

    public static function getShopeeOrders($start, $end, $isBackList = false){
        try {
            $baseApi = env('SHOPEE_BASE_API'). self::SHOPEE_ORDER_ENDPOINT;
            $page_num = 1;
            $page_size = 100; // sync 100 orders data/time
            $params = [
                'page_num' => $page_num,
                'page_size' => $page_size,
                'purchase_time_s' => $start,
                'purchase_time_e' => $end,
                'version' => 1
            ];

            $cookieData = !$isBackList ? Cache::get("shopee:cookie") : Cache::get("shopee-blacklist:cookie");
            if(isset($cookieData) && isset($cookieData['cookie'])){
                $expiredAt = Carbon::parse($cookieData['updated_at'])->addDays(7);
                $remainingDays = now()->diffInDays($expiredAt, false);
                if (!($remainingDays > 0)) {
                    app(TelegramService::class)->notifyShopeeCookieExpired('Lấy thông tin đơn hàng Shopee');
                    throw new \Exception("Sync Order Error: Cookie not set.");
                }
            }
            $response = Http::withHeaders([
                'accept' => '*/*',
                'user-agent' => AppUtils::USER_AGENT,
                "sec-fetch-dest" => "empty",
                "sec-fetch-site" => "same-origin",
                "sec-ch-ua" =>      '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
                "content-type" =>   "application/json",
                'cookie' => $cookieData['cookie'] ?? null,
            ])->get($baseApi, $params);

            if (!$response->successful()) {
                app(TelegramService::class)->notifyShopeeCookieExpired('Lấy thông tin đơn hàng Shopee');
            }

            return $response->json();
        }
        catch (\Exception $exception){
            app(TelegramService::class)->notifyShopeeCookieExpired('Lấy thông tin đơn hàng Shopee');
            throw new \Exception("get shopee Order Error: {$exception->getMessage()}");
        }
    }

    public static function formatShopeeOrderInfo(array $data){
        $orderData = [];
        foreach ($data as $item) {
            $orderInfo = data_get($item, 'orders.0');
            $productInfo = data_get($orderInfo, 'items.0');
            $totalPrice = collect($orderInfo['items'])->sum('actual_amount');
            $orderData[] = [
                'subId1' => str_replace('-', '', $item['utm_content']),
                'orderId' => $orderInfo['order_sn'],
                'orderTime' => Carbon::createFromTimestamp($item['purchase_time'])->toDateTimeString(),
                'totalOrderCommission' => round((int)$item['estimated_total_commission'] / 100000),
                'orderStatus' => self::SHOPEE_ORDER_STATUS[$orderInfo['display_order_status']],
                'completeTime' => $orderInfo['complete_time'] ? Carbon::createFromTimestamp($orderInfo['complete_time'])->toDateTimeString() : null,
                'clickTime' => Carbon::createFromTimestamp($item['click_time'])->toDateTimeString(),
                'shopName' => $productInfo['shop_name'],
                'itemId' => $productInfo['item_id'],
                'itemName' => $productInfo['item_name'],
                'qty' => 1,
                'purchaseValue' => (int)$totalPrice / 100000,
            ];
        }

        return $orderData;
    }
}
