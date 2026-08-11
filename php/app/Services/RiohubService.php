<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RiohubService
{

    public function getOrderByOrderId(string $orderID): ?array{
        try {
            $baseUrlTiktokAPI = env('TIKTOK_BASE_API');
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'X-Riohub-Api-Key' => env('TIKTOK_BASE_API_KEY'),
            ])->get($baseUrlTiktokAPI. "/orders", [
                'creator_username' => env('TIKTOK_BASE_API_CREATOR'),
                'order_id' => $orderID,
            ]);
            $data = $response->json();
            return $data['orders'][0];
        }
        catch (\Throwable $e) {
            throw new \Exception('Get order Failed: '.$e->getMessage());
            return null;
        }
    }
}
