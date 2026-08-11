<?php

namespace App\Models;

use App\Utils\RoleUtils;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;

/**
 * Class User
 *
 * @property string $role
 * @property int $id
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'email_order_notifications',
        'image',
        'role',
        'rank',
        'completed_orders_count',
        'orders_to_next_rank',
        'tmp_id',
        'spoint_balance',
        'spoint_total',
        'spoint_streak',
        'last_checkin_at',
        'referral_code',
        'referred_by',
        'referred_at',
        'created_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */

    public function referrer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by', 'referral_code');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(User::class, 'referred_by', 'referral_code');
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'email_verified_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'email_order_notifications' => 'boolean',
    ];

    protected $appends = [
        'has_password',
    ];

    public function getHasPasswordAttribute(): bool
    {
        return !empty($this->attributes['password']);
    }

    public function bankAccount(): HasOne{
        return $this->hasOne(BankAccount::class);
    }

    public function linkGenerations(): HasMany{
        return $this->hasMany(LinkGeneration::class);
    }
    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === RoleUtils::ROLE_ADMIN;
    }

    public function isInBlacklist(): bool
    {
        return DB::table('commission_blacklist_users')->where('user_id', $this->id)->exists();
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->referral_code)) {
                $user->referral_code = self::generateReferralCode();
            }
        });

        static::created(function ($user) {
            $user->wallet()->create([
                'available_balance' => 0,
                'pending_balance' => 0,
                'total_paid' => 0,
            ]);
        });
    }

    private static function generateReferralCode(int $length = 6): string
    {
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $code = '';
        do {
            for ($i = 0; $i < $length; $i++) {
                $code .= $characters[random_int(0, strlen($characters) - 1)];
            }
        } while (self::query()->where('referral_code', $code)->exists());

        return $code;
    }
}
