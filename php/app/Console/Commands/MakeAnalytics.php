<?php

namespace App\Console\Commands;

use App\Utils\AnalyticUtils;
use App\Utils\AppUtils;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MakeAnalytics extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collect-analytic';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Collect analytic data from the application and store it in the database for further analysis.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        try {
            // collect user data
            $statData = [
                'total_users' => 0,
                'total_paid_commission' => 0,
                'total_completed_order' => 0
            ];
            DB::transaction(function () use (&$statData) {
                $userCountData = DB::table('users')
                    ->selectRaw("
                        COUNT(users.id) as total_users,
                        SUM(YEAR(users.created_at) = YEAR(CURDATE()) AND MONTH(users.created_at) = MONTH(CURDATE())) as new_users,
                        SUM(users.completed_orders_count > 0) as users_with_orders
                    ")
                    ->first();
                $userGenerateLinkCountData = DB::table('link_generations')->distinct('user_id')->count('user_id');
                $data = [
                    'total_users' => $userCountData->total_users,
                    'new_users' => $userCountData->new_users,
                    'users_with_orders' => $userCountData->users_with_orders,
                    'users_generate_link' => $userGenerateLinkCountData
                ];
                $statData['total_users'] = $userCountData->total_users;
                DB::table('analytics')->updateOrInsert(
                    ['key' => AnalyticUtils::USER_ANALYTIC],
                    [
                        'value' => json_encode($data),
                        'updated_at' => now(),
                    ],
                );
            });

            // collect commission data
            DB::transaction(function () use (&$statData) {
                $commissionData = DB::table('orders')
                    ->selectRaw("
                        SUM(actual_commission) as total_commission,
                        SUM(user_commission) as total_user_commission
                    ")
                    ->where('order_status', AppUtils::ORDER_STATUS['completed'])
                    ->first();
                $fee = round($commissionData->total_commission * 1 / 100);
                $profit = round($commissionData->total_commission - $commissionData->total_user_commission - $fee);
                $data = [
                    'total_commission' => $commissionData->total_commission,
                    'total_user_commission' => $commissionData->total_user_commission,
                    'total_fee' => $fee,
                    'total_profit' => $profit
                ];
                $statData['total_paid_commission'] = $commissionData->total_commission;
                DB::table('analytics')->updateOrInsert(
                    ['key' => AnalyticUtils::COMMISSION_ANALYTIC],
                    [
                        'value' => json_encode($data),
                        'updated_at' => now(),
                    ],
                );
            });

            // collect order data
            DB::transaction(function () use (&$statData) {
                $orderData = DB::table('orders')
                    ->selectRaw("
                        COUNT(id) as total_orders,
                        SUM(order_status = 'Completed') as completed_orders,
                        SUM(order_status = 'Pending') as pending_orders,
                        SUM(order_status = 'Cancelled') as cancelled_orders
                    ")
                    ->first();
                $data = [
                    'total_orders' => $orderData->total_orders,
                    'completed_orders' => $orderData->completed_orders,
                    'pending_orders' => $orderData->pending_orders,
                    'cancelled_orders' => $orderData->cancelled_orders
                ];
                $statData['total_completed_order'] = $orderData->completed_orders;
                DB::table('analytics')->updateOrInsert(
                    ['key' => AnalyticUtils::ORDER_ANALYTIC],
                    [
                        'value' => json_encode($data),
                        'updated_at' => now(),
                    ],
                );
            });

            //wallet data
            DB::transaction(function () {
                $walletData = DB::table('wallets')
                    ->selectRaw("
                        SUM(available_balance) as available_balance,
                        SUM(pending_balance) as pending_balance,
                        SUM(total_paid) as total_paid,
                        (
                            SELECT COALESCE(SUM(amount), 0)
                            FROM wallet_transactions
                            WHERE status = ?
                              AND type = ?
                        ) as rejected_withdraw_total
                    ", [AppUtils::WALLET_TRANSACTION_STATUS['rejected'], AppUtils::WALLET_TRANSACTION_TYPE['withdrawal']])
                    ->first();
                $data = [
                    'available_balance' => $walletData->available_balance ?? 0,
                    'pending_balance' => $walletData->pending_balance ?? 0,
                    'rejected_balance' => $walletData->rejected_withdraw_total ?? 0,
                    'total_paid' => $walletData->total_paid ?? 0,
                ];
                DB::table('analytics')->updateOrInsert(
                    ['key' => AnalyticUtils::WALLET_ANALYTIC],
                    [
                        'value' => json_encode($data),
                        'updated_at' => now(),
                    ],
                );
            });

            //affiliate link data
            DB::transaction(function () {
                $affiliateData = DB::table('link_generations')
                    ->selectRaw("
                        COUNT(id) as total_links,
                        SUM(type = 1) as shopee_links,
                        SUM(type = 2) as tiktok_links,
                        SUM(type = 3) as lazada_links,

                        (
                            SELECT COUNT(*)
                            FROM orders
                        ) as total_orders,

                        (
                        SELECT COUNT(*)
                        FROM orders o
                        JOIN link_generations lg
                            ON lg.sub_id = o.sub_id
                        WHERE lg.type = 1
                        ) as shopee_orders,

                        (
                            SELECT COUNT(*)
                            FROM orders o
                            JOIN link_generations lg
                                ON lg.sub_id = o.sub_id
                            WHERE lg.type = 2
                        ) as tiktok_orders,

                        (
                            SELECT COUNT(*)
                            FROM orders o
                            JOIN link_generations lg
                                ON lg.sub_id = o.sub_id
                            WHERE lg.type = 3
                        ) as lazada_orders
                    ")
                    ->first();

                $data = [
                    'total_links' => $affiliateData->total_links ?? 0,
                    'shopee_links' => $affiliateData->shopee_links ?? 0,
                    'tiktok_links' => $affiliateData->tiktok_links ?? 0,
                    'lazada_links' => $affiliateData->lazada_links ?? 0,
                    'total_orders' => $affiliateData->total_orders ?? 0,
                    'shopee_orders' => $affiliateData->shopee_orders ?? 0,
                    'tiktok_orders' => $affiliateData->tiktok_orders ?? 0,
                    'lazada_orders' => $affiliateData->lazada_orders ?? 0,
                ];
                DB::table('analytics')->updateOrInsert(
                    ['key' => AnalyticUtils::AFFILIATE_ANALYTIC],
                    [
                        'value' => json_encode($data),
                        'updated_at' => now(),
                    ],
                );
            });


            // stat data
            DB::transaction(function () use ($statData) {
                DB::table('analytics')->updateOrInsert(
                    ['key' => AnalyticUtils::STAT_ANALYTIC],
                    [
                        'value' => json_encode($statData),
                        'updated_at' => now(),
                    ],
                );
            });

            Log::info('Successfully collected analytic data.');
        } catch (\Exception $e) {
            Log::error("Failed to make Analytic!");
            Log::error($e->getMessage() . $e->getTraceAsString());
            return self::FAILURE;
        }
    }
}
