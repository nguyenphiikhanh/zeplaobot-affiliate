<?php

namespace App\Jobs;

use App\Models\LinkGeneration;
use App\Models\Order;
use App\Services\OrderService;
use App\Utils\AppUtils;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private array $orderData;
    CONST IS_NOT_PAID = 0;
    CONST IS_PAID = 1;
    /**
     * Create a new job instance.
     */
    public function __construct(array $orderData)
    {
        //
        $this->orderData = $orderData;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //
        try {
            $successCount = 0;
            $failedCount = 0;
            foreach ($this->orderData as $order) {
                $currentOrderId = $order['orderId'] ?? 'Unknown_ID';
                try{
                    $subId = $order['subId1'] ?? null;
                    if (!$subId) continue;
                    $linkGeneration = LinkGeneration::query()->where('sub_id', $subId)->first();
                    if (!$linkGeneration) continue;
                    $user = $linkGeneration->user;
                    if (!$user) continue;
                    $commissionRates = AppUtils::getCommissionRates(
                        $user->rank,
                        'shopee',
                        AppUtils::checkSaleDay($order['orderTime'])
                    );
                    $userCommissionRate = $commissionRates['net'];
                    $displayCommissionRate = $commissionRates['gross'];
                    $totalCommission = (int) round($order['totalOrderCommission']);
                    $userCommission = (int) round($totalCommission * $userCommissionRate / 100);
                    $isCompleted = $order['orderStatus'] === AppUtils::ORDER_STATUS['completed'];
                    $isCancelled = $order['orderStatus'] === AppUtils::ORDER_STATUS['cancelled'];
                    $isNewOrder = $order['orderStatus'] === AppUtils::ORDER_STATUS['pending'];
                    DB::transaction(function () use ($order, $user, $userCommission, $displayCommissionRate, $totalCommission, $isCompleted, $isCancelled, $isNewOrder) {
                        $existingOrder = Order::query()->where('order_id', $order['orderId'])
                            ->where('sub_id', $order['subId1'])
                            ->first();
                        $updateData = [
                            'order_status' => $order['orderStatus'],
                            'order_time' => AppUtils::dateParseDB($order['orderTime']),
                            'complete_time' => AppUtils::dateParseDB($order['completeTime']),
                            'click_time' => AppUtils::dateParseDB($order['clickTime']),
                            'shop_name' => $order['shopName'],
                            'product_id' => $order['itemId'],
                            'product_name' => $order['itemName'],
                            'quantity' => $order['qty'] ?? 1,
                            'purchase_value' => round($order['purchaseValue']),
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
                            $updateData['order_id'] = $order['orderId'];
                            $updateData['sub_id']   = $order['subId1'];
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
                    $successCount++;
                }
                catch (\Throwable $e) {
                    $failedCount++;
                    Log::channel('order')->error("Failed to sync order data. Order ID: {$currentOrderId}");
                    Log::error($e->getMessage() . $e->getTraceAsString());
                    continue;
                }
            }
            Log::channel('order')->info("Sync Order done with {$successCount} success and {$failedCount} failed.");
        }
        catch (\Throwable $e) {
            Log::channel('order')->error('Have failed in sync order loop.');
            Log::channel('order')->error($e->getMessage() . $e->getTraceAsString());
        }
    }
}
