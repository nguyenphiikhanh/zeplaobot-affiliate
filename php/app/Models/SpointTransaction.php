<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpointTransaction extends Model
{
    use HasFactory;

    /**
     * Constant định nghĩa các loại giao dịch/biến động S-Point
     */
    const TYPE_CHECKIN = 'checkin';                         // Thưởng điểm danh hàng ngày
    const TYPE_EARLY_BIRD = 'early_bird';                   // Thưởng người điểm danh sớm nhất
    const TYPE_REFERRAL_FIRST_ORDER = 'referral_first_order'; // Thưởng 5 S-Point đơn đầu tiên cho cả người giới thiệu & được giới thiệu
    const TYPE_EXCHANGE = 'exchange';                       // Đổi S-Point lấy tiền mặt vào ví

    protected $fillable = [
        'user_id',
        'type',
        'points',
        'amount_vnd',
        'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
