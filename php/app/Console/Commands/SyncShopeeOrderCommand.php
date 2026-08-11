<?php

namespace App\Console\Commands;

use App\Jobs\SyncOrderJob;
use App\Services\OrderService;
use App\Utils\JobUtils;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class SyncShopeeOrderCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'shopee:sync-order';

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
            // sync today orders
            $startYesterday = Carbon::yesterday()->timestamp;
            $endYesterday = Carbon::yesterday()->endOfDay()->timestamp;
            $dataOrders = OrderService::getShopeeOrders($startYesterday, $endYesterday);
            $orderNew = data_get($dataOrders, 'data.list') ?? [];

            // get order from blacklist user
            $dataOrders = OrderService::getShopeeOrders($startYesterday, $endYesterday, true);
            $blackListOrderNew = data_get($dataOrders, 'data.list') ?? [];
            $data = array_merge($orderNew, $blackListOrderNew);
            $orderData = OrderService::formatShopeeOrderInfo($data);
            SyncOrderJob::dispatch($orderData)->onQueue(JobUtils::SYNC_ORDER_JOB);
            Log::info("Success auto sync Shopee orders! Time: ".now());
            return self::SUCCESS;
        }
        catch (\Exception $e) {
            Log::error("Failed auto sync Shopee orders!");
            Log::error($e->getMessage().$e->getTraceAsString());
            return self::FAILURE;
        }
    }
}
