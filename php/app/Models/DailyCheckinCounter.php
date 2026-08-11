<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyCheckinCounter extends Model
{
    use HasFactory;

    protected $fillable = [
        'checkin_date',
        'checkin_count',
    ];

    protected $casts = [
        'checkin_date' => 'date',
    ];
}
