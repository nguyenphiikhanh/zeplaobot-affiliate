<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Carbon\Carbon;

class ResetSpointData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'spoint:reset {--seed=0 : Seed fake checkins (only the first checkin receives the early-bird reward)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset all S-Point checkin and transaction test data, optionally seed fake early bird checkins';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Resetting S-Point checkin data...');

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        DB::table('daily_checkins')->delete();
        DB::table('daily_checkin_counters')->delete();
        DB::table('spoint_transactions')->whereIn('type', ['checkin', 'early_bird'])->delete();
        DB::table('users')->update([
            'spoint_balance' => 0,
            'spoint_streak' => 0,
            'last_checkin_at' => null,
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $seed = (int) $this->option('seed');
        if ($seed > 0) {
            $today = Carbon::today()->toDateString();
            $firstCheckinPoints = app(\App\Services\CheckinGiftConfigService::class)
                ->get()['first_checkin_points'];
            $this->info("Seeding {$seed} fake checkin(s) for today ({$today})...");

            for ($i = 1; $i <= $seed; $i++) {
                $dummyUser = User::firstOrCreate(
                    ['email' => "earlybird{$i}@saffi.vn"],
                    [
                        'name' => "EarlyBird #{$i}",
                        'password' => bcrypt('password123'),
                        'spoint_balance' => 0,
                        'spoint_streak' => 0,
                    ]
                );

                $earlyBirdRank = ($i === 1) ? 1 : null;
                $earlyBirdPoints = ($i === 1) ? $firstCheckinPoints : 0;
                $totalPoints = 1 + $earlyBirdPoints;

                DB::table('daily_checkins')->insert([
                    'user_id' => $dummyUser->id,
                    'checkin_date' => $today,
                    'streak_count' => 1,
                    'base_points' => 1,
                    'early_bird_rank' => $earlyBirdRank,
                    'early_bird_points' => $earlyBirdPoints,
                    'total_points' => $totalPoints,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $dummyUser->update([
                    'spoint_balance' => $totalPoints,
                    'spoint_streak' => 1,
                    'last_checkin_at' => now(),
                ]);

                DB::table('daily_checkin_counters')->updateOrInsert(
                    ['checkin_date' => $today],
                    ['checkin_count' => $i, 'created_at' => now(), 'updated_at' => now()]
                );

                $rankText = $earlyBirdRank ? "Top {$earlyBirdRank}" : "Regular";
                $this->info(" -> Seeded {$rankText} checkin by {$dummyUser->name}");
            }
        }

        $this->info('✅ Successfully reset S-Point test data!');
        return Command::SUCCESS;
    }
}
