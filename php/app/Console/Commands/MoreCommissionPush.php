<?php

namespace App\Console\Commands;

use App\Utils\AppUtils;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Resend\Laravel\Facades\Resend;

class MoreCommissionPush extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'more-commission-push';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'More commission push email';

    private const EMAIL_TEMPLATE = 'emails.more-commission';
    private const BEGIN_MONTH_TITLE = [ // 1
        'ĐẦU THÁNG MUA THẢ GA, HOÀN TIỀN CỰC ĐÃ',
        'ĐẦU THÁNG MUA SẮM, NHẬN HOÀN TIỀN ĐẬM'
    ];

    private const MID_MONTH_TITLE = [ // 15
        'GIỮA THÁNG LƯƠNG VỀ, CHỐT ĐƠN CỰC MÊ',
        'SĂN SALE GIỮA THÁNG, HOÀN TIỀN NGẬP TRÀN'
    ];

    private const END_MONTH_TITLE = [ // 25
        'HẾT THÁNG TIÊU TIỀN, HOÀN TIỀN LẠI LIỀN',
        'SALE CUỐI THÁNG, TIỀN VỀ NHẸ NHÀNG'
    ];
    private const DOUBLE_DAY_TITLE = [ // 1/1 2/2 3/3 ...
        'SĂN SALE NGÀY ĐÔI,NHẬN HOÀN TIỀN VỘI',
        'SALE NGÀY ĐÔI, DÁN LINK SAFFI THÔI',
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        try {
            $users = DB::table('users')->select('email')->where('completed_orders_count' ,'>', 0)->get();
            $type = AppUtils::getTomorrowCampaignType();
            if(!$type) return;
            switch ($type) {
                case AppUtils::BEGIN_MONTH:
                    $title = Arr::random(self::BEGIN_MONTH_TITLE);
                    $html = View::make(self::EMAIL_TEMPLATE.'.begin-month', ['month' => Carbon::tomorrow()->format('n')])->render();
                    break;
                case AppUtils::MID_MONTH:
                    $title = Arr::random(self::MID_MONTH_TITLE);
                    $html = View::make(self::EMAIL_TEMPLATE.'.mid-month', ['month' => Carbon::tomorrow()->format('n')])->render();
                    break;
                case AppUtils::END_MONTH:
                    $title = Arr::random(self::END_MONTH_TITLE);
                    $html = View::make(self::EMAIL_TEMPLATE.'.end-month', ['month' => Carbon::tomorrow()->format('n')])->render();
                    break;
                case AppUtils::DOUBLE_DAY:
                    $title = Arr::random(self::DOUBLE_DAY_TITLE);
                    $html = View::make(self::EMAIL_TEMPLATE.'.double-day', ['month' => Carbon::tomorrow()->format('n')])->render();
                    break;
            }
            $batchEmails = [];
            foreach ($users as $user) {
                $batchEmails[] = [
                    'from' => env('RESEND_COMMISSION_EMAIL'),
                    'to' => [$user->email],
                    'subject' => $title,
                    'html' => $html,
                ];
            }
            Resend::batch()->send($batchEmails);
            $count = count($users);
            Log::info("Success commission push email to {$count} users!");
            return self::SUCCESS;
        }
        catch (\Exception $e) {
            Log::error("Failed commission push email!");
            Log::error($e->getMessage().$e->getTraceAsString());
            return self::FAILURE;
        }
    }
}
