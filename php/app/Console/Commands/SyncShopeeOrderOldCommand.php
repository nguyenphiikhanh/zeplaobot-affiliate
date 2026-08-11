<?php

namespace App\Console\Commands;

use App\Jobs\SyncOrderJob;
use App\Services\OrderService;
use App\Utils\AppUtils;
use App\Utils\JobUtils;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncShopeeOrderOldCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'shopee:sync-order-old';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Shopee Orders from Shopee API to local database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        try{
            // sync old orders
            $blackListUser = DB::table('commission_blacklist_users')->pluck('user_id')->toArray();
            $pendingOrders = DB::table('orders')->select([
                            DB::raw("DATE(orders.order_time) as order_date"),
                            'link_generations.user_id as user_id',
                        ])
                        ->leftJoin('link_generations', 'orders.sub_id', '=', 'link_generations.sub_id')
                        ->where('orders.order_status', AppUtils::ORDER_STATUS['pending'])
                        ->where('link_generations.type', AppUtils::LINK_TYPE['shopee'])
                        ->groupBy(
                    DB::raw("DATE(orders.order_time)"),
                            'link_generations.user_id'
                        )
                        ->get();
            list($blacklistedOrders, $orders) = $pendingOrders->partition(function ($order) use ($blackListUser) {
                return in_array($order->user_id, $blackListUser);
            });
            $normalDates = $orders->pluck('order_date')->unique()->values()->all();
            $blacklistDates = $blacklistedOrders->pluck('order_date')->unique()->values()->all();
            foreach ($normalDates as $date) {
                $startDate = Carbon::createFromFormat('Y-m-d', $date, 'Asia/Ho_Chi_Minh')->startOfDay()->timestamp;
                $endDate = Carbon::createFromFormat('Y-m-d', $date, 'Asia/Ho_Chi_Minh')->endOfDay()->timestamp;
                $data = OrderService::getShopeeOrders($startDate, $endDate);
                $orderList = data_get($data, 'data.list') ?? [];
                $orderData = OrderService::formatShopeeOrderInfo($orderList);
                if(count($orderData)){
                    SyncOrderJob::dispatch($orderData)->onQueue(JobUtils::SYNC_ORDER_JOB);
                }
                sleep(1); // Add a 1-second delay between each request
            }

            foreach ($blacklistDates as $date) {
                $startDate = Carbon::createFromFormat('Y-m-d', $date, 'Asia/Ho_Chi_Minh')->startOfDay()->timestamp;
                $endDate = Carbon::createFromFormat('Y-m-d', $date, 'Asia/Ho_Chi_Minh')->endOfDay()->timestamp;
                $data = OrderService::getShopeeOrders($startDate, $endDate, true);
                $orderList = data_get($data, 'data.list') ?? [];
                $orderData = OrderService::formatShopeeOrderInfo($orderList);
                if(count($orderData)){
                    SyncOrderJob::dispatch($orderData)->onQueue(JobUtils::SYNC_ORDER_JOB);
                }
                sleep(1); // Add a 2-seconds delay between each request
            }

            Log::info("Success auto sync Shopee orders Old! Time: ".now());
            return self::SUCCESS;
        }
        catch (\Exception $e) {
            Log::error("Failed auto sync Shopee orders old!");
            Log::error($e->getMessage().$e->getTraceAsString());
            return self::FAILURE;
        }
    }
}
