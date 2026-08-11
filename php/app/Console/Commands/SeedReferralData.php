<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Order;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\SpointTransaction;
use App\Services\OrderService;
use App\Utils\AppUtils;
use Carbon\Carbon;
use Illuminate\Support\Str;

class SeedReferralData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ref:seed {referral_code? : Mã giới thiệu của user (ví dụ: FBH7GA)} {--count=10 : Số lượng người dùng được giới thiệu cần sinh} {--rollback : Xóa và hoàn tác toàn bộ dữ liệu test đã seeding} {--append : Giữ lại dữ liệu test cũ và tạo nối tiếp}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sinh hoặc rollback dữ liệu test cho hệ thống Giới thiệu (Referral)';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        if ($this->option('rollback')) {
            return $this->handleRollback();
        }

        return $this->handleSeed();
    }

    /**
     * Execute seeding test referral data.
     */
    private function handleSeed(): int
    {
        $refCode = $this->argument('referral_code');
        $count = (int) $this->option('count');

        if ($refCode) {
            $referrer = User::where('referral_code', $refCode)->first();
            if (!$referrer) {
                $this->error("❌ Không tìm thấy user nào có referral_code = '{$refCode}'.");
                return 1;
            }
        } else {
            $referrer = User::first();
            if (!$referrer) {
                $this->error("❌ Cơ sở dữ liệu chưa có user nào. Vui lòng đăng ký tài khoản trước!");
                return 1;
            }
            $refCode = $referrer->referral_code;
        }

        // Auto rollback previous test data unless --append is explicitly passed
        if (!$this->option('append')) {
            $existingTestUsersCount = User::query()
                ->where('email', 'LIKE', 'test_ref_%@example.com')
                ->orWhere('email', 'LIKE', 'user_ref_%@example.com')
                ->count();

            if ($existingTestUsersCount > 0) {
                $this->warn("🧹 Tự động dọn dẹp {$existingTestUsersCount} bản ghi test cũ trước khi sinh dữ liệu mới...");
                $this->handleRollback(true);
            }
        }

        // Ensure referrer wallet exists
        if (!$referrer->wallet) {
            $referrer->wallet()->create([
                'available_balance' => 0,
                'pending_balance' => 0,
                'total_paid' => 0,
            ]);
        }

        $this->info("🚀 Đang khởi tạo {$count} người dùng test được giới thiệu bởi {$referrer->name} (Mã ref: {$refCode})...");

        for ($i = 1; $i <= $count; $i++) {
            // Random days ago between 2 and 390 days (test active <365 and expired >365)
            $daysAgo = ($i % 3 === 0) ? rand(366, 400) : rand(2, 300);
            $referredAt = Carbon::now()->subDays($daysAgo);

            $referredUser = User::create([
                'name' => "Bạn Giới Thiệu {$i}",
                'email' => "test_ref_{$i}_" . Str::random(4) . "@example.com",
                'email_verified_at' => now(),
                'password' => bcrypt('password'),
                'rank' => 'silver',
                'referral_code' => strtoupper(Str::random(6)),
                'referred_by' => $refCode,
                'referred_at' => $referredAt,
                'created_at' => $referredAt,
                'updated_at' => $referredAt,
            ]);

            // For 75% of referred users, generate 1-2 completed orders
            if ($i % 4 !== 0) {
                $orderCount = ($i % 2 === 0) ? 2 : 1;
                for ($j = 1; $j <= $orderCount; $j++) {
                    $orderCommission = rand(50000, 250000); // 50k - 250k VND
                    $order = Order::create([
                        'order_id' => 'TEST_ORD_' . strtoupper(Str::random(8)),
                        'product_name' => "Sản phẩm test #{$j} cho bạn {$i}",
                        'user_commission' => $orderCommission,
                        'order_status' => 'completed',
                        'order_time' => $referredAt->copy()->addDays(rand(1, 3)),
                    ]);

                    try {
                        OrderService::processOrderCompleted($order, $referredUser);
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::error("Seeder OrderService error: " . $e->getMessage());
                    }
                }
            }

            $statusText = $daysAgo <= 365 ? "Còn " . (365 - $daysAgo) . " ngày" : "Đã hết hạn ({$daysAgo} ngày)";
            $this->line("  ✓ Tạo thành công: {$referredUser->name} ({$referredUser->email}) - Trạng thái: {$statusText}");
        }

        $this->info("🎉 Hoàn tất Seeding! Đã nạp thành công {$count} người dùng cấp dưới cho mã ref '{$refCode}'.");
        $this->warn("💡 Mẹo:");
        $this->warn(" 👉 Để XÓA SẠCH toàn bộ dữ liệu test: php artisan ref:seed --rollback");
        $this->warn(" 👉 Để TẠO THÊM mà KHÔNG xóa dữ liệu test cũ: php artisan ref:seed {$refCode} --count=10 --append\n");
        return 0;
    }

    /**
     * Execute rollback & cleanup of all seeded test referral data.
     */
    private function handleRollback(bool $quiet = false): int
    {
        if (!$quiet) {
            $this->warn("🧹 Đang khởi chạy quy trình Rollback & Dọn dẹp dữ liệu test...");
        }

        // 1. Find all test users created by seeder
        $testUsers = User::query()
            ->where('email', 'LIKE', 'test_ref_%@example.com')
            ->orWhere('email', 'LIKE', 'user_ref_%@example.com')
            ->get();

        if ($testUsers->isEmpty()) {
            if (!$quiet) {
                $this->info("✨ Không tìm thấy dữ liệu test nào cần rollback.");
            }
            return 0;
        }

        $testUserIds = $testUsers->pluck('id')->toArray();
        $testUserCount = count($testUserIds);

        // 2. Find test order IDs
        $testOrderIds = Order::query()
            ->where('order_id', 'LIKE', 'TEST_ORD_%')
            ->pluck('order_id')
            ->toArray();

        // 3. Rollback Referrers' Wallet Balances & Wallet Transactions generated by test orders
        $referralWalletTxes = WalletTransaction::query()
            ->where('type', AppUtils::WALLET_TRANSACTION_TYPE['referral_commission'])
            ->whereIn('reference_id', $testOrderIds)
            ->get();

        foreach ($referralWalletTxes as $tx) {
            $wallet = Wallet::find($tx->wallet_id);
            if ($wallet) {
                $wallet->decrement('available_balance', max(0, $tx->amount));
            }
            $tx->delete();
        }

        // 4. Rollback Referrers' & Test Users' Spoint Balance & SpointTransactions
        $referralSpointTxes = SpointTransaction::query()
            ->where('type', SpointTransaction::TYPE_REFERRAL_FIRST_ORDER)
            ->get();

        foreach ($referralSpointTxes as $spointTx) {
            $user = User::find($spointTx->user_id);
            if ($user) {
                $user->decrement('spoint_balance', min($user->spoint_balance, $spointTx->points));
                $user->decrement('spoint_total', min($user->spoint_total, $spointTx->points));
            }
            $spointTx->delete();
        }

        // 5. Delete test users' Wallet & WalletTransactions
        $testWallets = Wallet::query()->whereIn('user_id', $testUserIds)->get();
        foreach ($testWallets as $w) {
            WalletTransaction::query()->where('wallet_id', $w->id)->delete();
            $w->delete();
        }

        // 6. Delete test Order records
        $deletedOrdersCount = Order::query()->where('order_id', 'LIKE', 'TEST_ORD_%')->delete();

        // 7. Delete test User records
        User::query()->whereIn('id', $testUserIds)->delete();

        if (!$quiet) {
            $this->info("  ✓ Đã xóa thành công {$testUserCount} tài khoản người dùng test.");
            $this->info("  ✓ Đã xóa thành công {$deletedOrdersCount} đơn hàng test.");
            $this->info("  ✓ Đã hoàn tác & khấu trừ toàn bộ số dư hoa hồng Ví và S-Point đã nạp.");
            $this->info("🎉 Rollback hoàn tất! Cơ sở dữ liệu đã sạch sẽ.");
        }

        return 0;
    }
}
