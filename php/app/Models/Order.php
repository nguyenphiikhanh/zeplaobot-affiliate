<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'order_status',
        'order_time',
        'complete_time',
        'click_time',
        'shop_name',
        'product_id',
        'product_name',
        'quantity',
        'currency',
        'purchase_value',
        'actual_commission',
        'sub_id',
        'sub1',
        'user_rank',
        'commission_rate',
        'user_commission',
        'is_paid',
        'sub_order_id'
    ];

    protected $casts = [
        'order_time'        => 'datetime',
        'complete_time'     => 'datetime',
        'click_time'        => 'datetime',
        'quantity'          => 'integer',
        'purchase_value'    => 'integer',
        'actual_commission' => 'integer',
        'commission_rate'   => 'integer',
        'user_commission'   => 'integer',
        'is_paid'           => 'boolean',
    ];

    public function linkGeneration(): BelongsTo
    {
        return $this->belongsTo(LinkGeneration::class, 'sub_id', 'sub_id');
    }
}
