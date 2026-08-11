<?php

namespace App\Jobs;

use App\Models\LinkGeneration;
use App\Models\Order;
use App\Services\LazadaService;
use App\Services\OrderService;
use App\Utils\AppUtils;
use App\Utils\LazadaUtils;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncLazadaOrder implements ShouldQueue
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
    public function handle(LazadaService $lazadaService): void
    {
        //
        $order = $this->orderData;
        $orderId = $order['order_id'].'-'.$order['sub_order_id'];
        try {
            $subId = $order['sub_id'];
            if (!$subId) {
                Log::channel('order')->warning("Lazada Sync: Sub ID missing for Order ID: {$orderId}");
                return;
            };
            $linkGeneration = LinkGeneration::query()->where('sub_id', $subId)->first();
            if (!$linkGeneration) {
                Log::channel('order')->warning("Lazada Sync: No Info with Order ID: {$orderId}");
                return;
            }
            $conversionInfo = $lazadaService->getConversionInfo($order['time_created'], $order['sub_order_id']);
            if(!$conversionInfo){
                Log::channel('order')->warning("Lazada Sync: No conversion info for Order ID: {$orderId}");
                return;
            }
            $user = $linkGeneration->user;
            $commissionRates = AppUtils::getCommissionRates(
                $user->rank,
                'lazada',
                AppUtils::checkSaleDay($order['time_created'])
            );
            $userCommissionRate = $commissionRates['net'];
            $displayCommissionRate = $commissionRates['gross'];

            $totalCommission = (int) round($conversionInfo['estPayout']);
            $userCommission = (int) round($totalCommission * $userCommissionRate / 100);
            $status = LazadaUtils::ORDER_STATUS[$order['status']];
            $isCompleted = $status === AppUtils::ORDER_STATUS['completed'];
            $isCancelled = $status === AppUtils::ORDER_STATUS['cancelled'];
            $isNewOrder = $status === AppUtils::ORDER_STATUS['pending'];
            DB::transaction(function () use ($order, $user, $userCommission, $displayCommissionRate, $totalCommission, $isCompleted, $isCancelled, $isNewOrder, $status, $conversionInfo) {
                $existingOrder = Order::query()->where('order_id', $order['order_id'])
                    ->where('sub_id', $order['sub_id'])
                    ->where('sub_order_id', $order['sub_order_id'])
                    ->first();
                $updateData = [
                    'order_status' => $status,
                    'order_time' => Carbon::parse($order['time_created'])->toDateTimeString(),
                    'complete_time' => empty($order['time_delivered']) ? null : AppUtils::dateParseDB($order['time_delivered']),
                    'click_time' => empty($order['click_time']) ? null : Carbon::createFromFormat('YmdHis', $order['click_time']),
                    'shop_name' => $conversionInfo['sellerName'],
                    'product_id' => $conversionInfo['sku'],
                    'product_name' => $conversionInfo['skuName'],
                    'quantity' => 0,
                    'purchase_value' => round($order['purchase_value']),
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
                    $updateData['sub_order_id'] = $order['sub_order_id'];
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

            Log::channel('order')->info("Sync Lazada order success for ID: {$orderId}");
        }
        catch (\Throwable $e) {
            Log::channel('order')->error("Failed to sync Lazada order data for ID: {$orderId}");
            Log::error($e->getMessage() . $e->getTraceAsString());
        }
    }
}
