<?php

namespace App\Utils;

class LazadaUtils
{
    const ORDER_STATUS = [
        'Fulfilled' => 'Pending',
        'Delivered' => 'Completed',
        'Returned' => 'Cancelled',
    ];
}
