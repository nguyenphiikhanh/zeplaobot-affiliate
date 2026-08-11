<?php

namespace App\Jobs;

use App\Models\LinkGeneration;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\RiohubService;
use App\Utils\AppUtils;
use App\Utils\TiktokUtils;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncTiktokOrder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    private array $orderData;
    CONST IS_NOT_PAID = 0;
    CONST IS_PAID = 1;
    public function __construct(array $orderData)
    {
        //
        $this->orderData = $orderData;
    }

    /**
     * Execute the job.
     */
    public function handle(RiohubService $service): void
    {
        //
        $data = $this->orderData['data'];
        $orderId = $data['order_id'];
        try {
            $order = $service->getOrderByOrderId($orderId);
            $subId = $order['sub_id'];
            if (!$subId) {
                Log::channel('order')->warning("Tiktok Sync: Sub ID missing for Order ID: {$orderId}");
                return;
            };
            $linkGeneration = LinkGeneration::query()->where('sub_id', $subId)->first();
            if (!$linkGeneration) {
                Log::channel('order')->warning("Tiktok Sync: No Info with Order ID: {$orderId}");
                return;
            };
            $user = $linkGeneration->user;
            $commissionRates = AppUtils::getCommissionRates(
                $user->rank,
                'tiktok',
                AppUtils::checkSaleDay($order['time_created'])
            );
            $userCommissionRate = $commissionRates['net'];
            $displayCommissionRate = $commissionRates['gross'];

            $totalCommission = $order['actual_commission'] ? (int) round($order['actual_commission']) : (int) round($order['est_commission']);
            $userCommission = (int) round($totalCommission * $userCommissionRate / 100);
            $status = TiktokUtils::TIKTOK_ORDER_STATUS[$order['status']];
            $isCompleted = $status === AppUtils::ORDER_STATUS['completed'];
            $isCancelled = $status === AppUtils::ORDER_STATUS['cancelled'];
            $isNewOrder = $status === AppUtils::ORDER_STATUS['pending'];
            DB::transaction(function () use ($order, $user, $userCommission, $displayCommissionRate, $totalCommission, $isCompleted, $isCancelled, $isNewOrder, $status) {
                $existingOrder = Order::query()->where('order_id', $order['order_id'])
                        ->where('sub_id', $order['sub_id'])
                    ->first();
                $updateData = [
                    'order_status' => $status,
                    'order_time' => Carbon::createFromTimestamp($order['create_time']),
                    'complete_time' => AppUtils::dateParseDB($order['time_delivered']),
                    'click_time' => null,
                    'shop_name' => $order['shop_name'] ?? null,
                    'product_id' => $order['product_id'],
                    'product_name' => $order['product_name'],
                    'quantity' => $order['quantity'],
                    'purchase_value' => round($order['price']),
                    'actual_commission' => $totalCommission,
                    'user_rank' => $user->rank,
                    'commission_rate' => round($displayCommissionRate),
                    'user_commission' => !$isCancelled ? $userCommission : 0,
                    'is_paid' => $isCompleted ? self::IS_PAID : self::IS_NOT_PAID,
                    'updated_at' => now(),
                ];
                if($existingOrder){
                    if ($existingOrder->is_paid == self::IS_NOT_PAID) {
                        $existingOrder->update($updateData);
                        if($isCompleted){
                            OrderService::processOrderCompleted($existingOrder, $user);
                        }
                    }
                } else {
                    $updateData['order_id'] = $order['order_id'];
                    $updateData['sub_id']   = $order['sub_id'];
                    $updateData['created_at']   = now();
                    $orderCreate = Order::query()->create($updateData);
                    if($isCompleted){
                        OrderService::processOrderCompleted($orderCreate, $user);
                    }
                    elseif ($isNewOrder){ // is new order
                        OrderService::processOrderNew($orderCreate, $user);
                    }
                }
            });

            Log::channel('order')->info("Sync Tiktok order success for ID: {$orderId}");
        }
        catch (\Throwable $e) {
            Log::channel('order')->error("Failed to sync Tiktok order data for ID: {$orderId}");
            Log::error($e->getMessage() . $e->getTraceAsString());
        }
    }
}
