<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();
        $schedule->command('data:backup')->everySixHours()->timezone('Asia/Ho_Chi_Minh');

        // push offer commission
        $schedule->command('more-commission-push')->at('20:30')->timezone('Asia/Ho_Chi_Minh');

        //make analytic data
        $schedule->command('collect-analytic')->everySixHours()->timezone('Asia/Ho_Chi_Minh');

        //sync shopee orders
        $schedule->command('shopee:sync-order')->dailyAt('09:00')->timezone('Asia/Ho_Chi_Minh');
        $schedule->command('shopee:sync-order')->dailyAt('12:30')->timezone('Asia/Ho_Chi_Minh');

        //sync shopee old orders
        $schedule->command('shopee:sync-order-old')->dailyAt('09:01')->timezone('Asia/Ho_Chi_Minh');
        $schedule->command('shopee:sync-order-old')->dailyAt('15:01')->timezone('Asia/Ho_Chi_Minh');
        $schedule->command('shopee:sync-order-old')->dailyAt('20:01')->timezone('Asia/Ho_Chi_Minh');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
