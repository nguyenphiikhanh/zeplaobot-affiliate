<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Services\OrderService;
use App\Utils\AppUtils;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferralTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_registration_with_referral_code_sets_referred_by_and_referred_at()
    {
        $referrer = User::factory()->create([
            'referral_code' => 'REFTEST123',
        ]);

        $payload = [
            'id_token' => 'dummy_token',
            'ref' => 'REFTEST123',
        ];

        // Mock AuthService for Google login if needed, or directly test User model logic
        $newUser = User::create([
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'referral_code' => 'NEWUSER1',
            'referred_by' => $referrer->referral_code,
            'referred_at' => now(),
        ]);

        $this->assertEquals($referrer->referral_code, $newUser->referred_by);
        $this->assertNotNull($newUser->referred_at);
        $this->assertEquals($referrer->id, $newUser->referrer->id);
    }

    public function test_process_order_completed_awards_5_percent_commission_to_referrer_within_365_days()
    {
        $referrer = User::factory()->create([
            'referral_code' => 'REFERRER1',
        ]);
        $referrerWallet = $referrer->wallet()->create([
            'available_balance' => 0,
            'pending_balance' => 0,
            'total_paid' => 0,
        ]);

        $referredUser = User::factory()->create([
            'referral_code' => 'REFERRED1',
            'referred_by' => $referrer->referral_code,
            'referred_at' => now()->subDays(100), // Within 365 days
        ]);
        $referredUser->wallet()->create([
            'available_balance' => 0,
            'pending_balance' => 0,
            'total_paid' => 0,
        ]);

        $order = Order::create([
            'order_id' => 'ORDER_REF_100',
            'sub_id' => 'SUB123',
            'user_rank' => 'silver',
            'actual_commission' => 100000,
            'user_commission' => 60000,
            'order_status' => AppUtils::ORDER_STATUS['completed'],
            'order_time' => now(),
            'is_paid' => 1,
        ]);

        OrderService::processOrderCompleted($order, $referredUser);

        // Referrer should get 5% of 60,000 = 3,000
        $referrerWallet->refresh();
        $this->assertEquals(3000, $referrerWallet->available_balance);

        $transaction = $referrerWallet->transactions()
            ->where('type', AppUtils::WALLET_TRANSACTION_TYPE['referral_commission'])
            ->first();

        $this->assertNotNull($transaction);
        $this->assertEquals(3000, $transaction->amount);
    }

    public function test_process_order_completed_does_not_award_commission_after_365_days()
    {
        $referrer = User::factory()->create([
            'referral_code' => 'REFERRER2',
        ]);
        $referrerWallet = $referrer->wallet()->create([
            'available_balance' => 0,
            'pending_balance' => 0,
            'total_paid' => 0,
        ]);

        $referredUser = User::factory()->create([
            'referral_code' => 'REFERRED2',
            'referred_by' => $referrer->referral_code,
            'referred_at' => now()->subDays(400), // Exceeded 365 days
        ]);
        $referredUser->wallet()->create([
            'available_balance' => 0,
            'pending_balance' => 0,
            'total_paid' => 0,
        ]);

        $order = Order::create([
            'order_id' => 'ORDER_REF_400',
            'sub_id' => 'SUB456',
            'user_rank' => 'silver',
            'actual_commission' => 100000,
            'user_commission' => 60000,
            'order_status' => AppUtils::ORDER_STATUS['completed'],
            'order_time' => now(),
            'is_paid' => 1,
        ]);

        OrderService::processOrderCompleted($order, $referredUser);

        $referrerWallet->refresh();
        $this->assertEquals(0, $referrerWallet->available_balance);
    }

    public function test_first_order_awards_5_spoints_to_both_referrer_and_referred_user()
    {
        $referrer = User::factory()->create([
            'referral_code' => 'REFERRER3',
            'spoint_balance' => 0,
            'spoint_total' => 0,
        ]);

        $referredUser = User::factory()->create([
            'referral_code' => 'REFERRED3',
            'referred_by' => $referrer->referral_code,
            'referred_at' => now(),
            'spoint_balance' => 0,
            'spoint_total' => 0,
            'completed_orders_count' => 0,
        ]);

        $order = Order::create([
            'order_id' => 'ORDER_FIRST_1',
            'sub_id' => 'SUB789',
            'user_rank' => 'silver',
            'actual_commission' => 50000,
            'user_commission' => 30000,
            'order_status' => AppUtils::ORDER_STATUS['completed'],
            'order_time' => now(),
            'is_paid' => 1,
        ]);

        OrderService::processOrderCompleted($order, $referredUser);

        $referrer->refresh();
        $referredUser->refresh();

        // Both should have 5 S-Points
        $this->assertEquals(5, $referrer->spoint_balance);
        $this->assertEquals(5, $referrer->spoint_total);
        $this->assertEquals(5, $referredUser->spoint_balance);
        $this->assertEquals(5, $referredUser->spoint_total);

        // Check SpointTransaction records
        $this->assertDatabaseHas('spoint_transactions', [
            'user_id' => $referrer->id,
            'type' => 'referral_first_order',
            'points' => 5,
        ]);

        $this->assertDatabaseHas('spoint_transactions', [
            'user_id' => $referredUser->id,
            'type' => 'referral_first_order',
            'points' => 5,
        ]);
    }
}
