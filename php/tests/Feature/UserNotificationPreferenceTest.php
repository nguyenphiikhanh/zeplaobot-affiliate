<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserNotificationPreferenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_disable_order_email_notifications(): void
    {
        $user = User::factory()->create([
            'email_order_notifications' => true,
        ]);
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/user/update', [
            'email_order_notifications' => false,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.email_order_notifications', false);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email_order_notifications' => false,
        ]);
    }
}
