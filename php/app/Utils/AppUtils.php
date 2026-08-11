<?php

namespace App\Utils;

use App\Services\CommissionConfigService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class AppUtils
{
    const DEFAULT_LIMIT = 10;
    const LIMIT_RULES = [10, 20, 50, 100];
    const USER_RANK = [
        'silver' => 'silver',
        'gold' => 'gold',
        'obsidian' => 'obsidian',
    ];

    const DEFAULT_USER_RANK = self::USER_RANK['silver'];
    const DEFAULT_ORDER_TO_NEXT_RANK = 10;
    const MAX_ORDER_RANK = 50;

    const LINK_TYPE = [
        'shopee' => 1,
        'tiktok' => 2,
        'lazada' => 3,
        'shopeefood' => 4,
    ];

    const WALLET_TRANSACTION_TYPE = [
        'commission' => 'commission',
        'withdrawal' => 'withdrawal',
        'point' => 'point',
        'referral_commission' => 'referral_commission',
    ];

    /**
     * Các loại biến động/giao dịch S-Point (SpointTransaction Type)
     * - checkin: Thưởng điểm danh hàng ngày
     * - early_bird: Thưởng người điểm danh sớm nhất trong ngày
     * - referral_first_order: Thưởng 5 S-Point cho cả 2 người khi đơn hàng đầu tiên của ref hoàn thành
     * - exchange: Đổi S-Point sang tiền mặt cộng vào số dư ví
     */
    const SPOINT_TRANSACTION_TYPE = [
        'checkin' => 'checkin',
        'early_bird' => 'early_bird',
        'referral_first_order' => 'referral_first_order',
        'exchange' => 'exchange',
    ];

    const REFERRAL_COMMISSION_RATE = 5; // 5%
    const REFERRAL_VALID_DAYS = 365;
    const REFERRAL_FIRST_ORDER_SPOINT = 5; // 5 S-Point cho cả 2 người khi đơn hàng đầu hoàn thành

    const WALLET_TRANSACTION_STATUS = [
        'pending' => 'pending',
        'success' => 'success',
        'rejected' => 'rejected',
    ];

    const ORDER_STATUS = [
        'pending' => 'Pending',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
        'unpaid' => 'Unpaid',
    ];

    const BEGIN_MONTH = 1;
    const MID_MONTH = 2;
    const END_MONTH = 3;
    const DOUBLE_DAY = 4;
    const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

    public static function checkSaleDay(string $dateString): bool{
        try {
            if(empty($dateString)) return false;
            $value = preg_replace('/\s+/', ' ', trim($dateString));
            $date = Carbon::parse($value);

            $day = $date->day;     // get date (1 - 31)
            $month = $date->month; // get month (1 - 12)

            // check double day
            $isDoubleDay = ($day === $month);

            // check sale day
            $isSpecialDayOfMonth = in_array($day, [1, 15, 25], true);

            return $isDoubleDay || $isSpecialDayOfMonth;

        } catch (\Throwable $e) {
            return false;
        }
    }

    public static function getCommissionRates(?string $rank, string $platform, bool $isSaleDay = false): array
    {
        return app(CommissionConfigService::class)->getRates($rank, $platform, $isSaleDay);
    }

    public static function getOrderRemainByRank(?string $rank, int $completed_order): int
    {
        $rank = $rank ?? self::DEFAULT_USER_RANK;
        if ($rank === self::USER_RANK['obsidian']){
            return 0;
        }
        elseif ($rank === self::USER_RANK['gold']){
            return self::MAX_ORDER_RANK - $completed_order;
        }
        else {
            return self::DEFAULT_ORDER_TO_NEXT_RANK - $completed_order;
        }
    }

    public static function checkRankIsUpgrade(int $completed_order): bool{
        return $completed_order === self::DEFAULT_ORDER_TO_NEXT_RANK || $completed_order === self::MAX_ORDER_RANK;
    }

    public static function getNextRank(string $rank): string{
        if($rank === self::USER_RANK['obsidian']){ //max rank
            return self::USER_RANK['obsidian'];
        }
        return $rank === self::USER_RANK['silver'] ? self::USER_RANK['gold'] : self::USER_RANK['obsidian'];
    }

    public static function dateParseDB(?string $dateString): ?string{
        try {
            if (empty($dateString) || $dateString == '--') {
                return null;
            }
            $value = preg_replace('/\s+/', ' ', trim($dateString));
            return Carbon::parse($value)->format('Y-m-d H:i:s');
        } catch (\Throwable $e) {
            Log::error($e->getMessage(). $e->getTraceAsString());
            return null;
        }
    }

    public static function getTomorrowCampaignType(): ?int
    {
        $tomorrow = now()->addDay();

        $day = $tomorrow->day;
        $month = $tomorrow->month;

        if ($day === $month) {
            return self::DOUBLE_DAY;
        }

        if ($day === 1) { // day 1
            return self::BEGIN_MONTH;
        }

        if ($day === 15) { // day 15
            return self::MID_MONTH;
        }

        if ($day === 25) { // day 25
            return self::END_MONTH;
        }

        return null;
    }
}
