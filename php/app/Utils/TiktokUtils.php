<?php

namespace App\Utils;

use Illuminate\Support\Facades\Http;

class TiktokUtils
{
    const TIKTOK_ORDER_STATUS = [
        1 => 'Pending',
        2 => 'Completed',
        3 => 'Cancelled',
    ];

    public static function getProductInfo(string $productId)
    {
        try {
            $baseUrl = env('TIKTOK_BASE_API');
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'X-Riohub-Api-Key' => env('TIKTOK_BASE_API_KEY'),
            ])->get($baseUrl."/products", [
                'product_id' => $productId,
                'creator_username' => env('TIKTOK_BASE_API_CREATOR'),
            ]);

            if ($response->failed()) {
                throw new \Exception("Fetch product info failed. Status: " . $response->status());
            }
            $resData = $response->json();
            return $resData['products'][0];
        }
        catch (\Exception $e) {
            throw new \Exception('Fetch Shopee Product error: '.$e->getMessage());
            return null;
        }
    }
}
