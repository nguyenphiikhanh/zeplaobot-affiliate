<?php

namespace App\Utils;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ShopeeUtils
{
    public static function getProductInfo(string $productLink)
    {
        try {
            $baseUrl = env('SHOPEE_FETCH_PRODUCT_API');
            $response = Http::withHeaders([
                'Accept' => 'application/json',
            ])->get($baseUrl, [
                'url' => $productLink
            ]);

            if ($response->failed()) {
                throw new \Exception("Fetch product info failed. Status: " . $response->status());
            }
            $resData = $response->json();
            return $resData['productInfo'] ?? null;
        }
        catch (\Exception $e) {
            throw new \Exception('Fetch Shopee Product error: '.$e->getMessage());
            return null;
        }
    }

    public static function parseShopeeUrl(string $url): ?array
    {
        //1 : https://shopee.vn/product/1499299156/50363679438
        if (preg_match('#/product/(\d+)/(\d+)#i', $url, $matches)) {
            return [$matches[1], $matches[2]];
        }

        //2 : https://shopee.vn/Ten-San-Pham-i.1499299156.50363679438
        if (preg_match('#-i\.(\d+)\.(\d+)#i', $url, $matches)) {
            return [$matches[1], $matches[2]];
        }

        return null;
    }

    public static function getProductData(string $productLink){
        try {
            $parsed = self::parseShopeeUrl($productLink);
            if ($parsed) {
                [$shopId, $productId] = $parsed;
                $cacheKey = "shopee:{$shopId}:{$productId}";

                return Cache::remember(
                    $cacheKey,
                    60 * 60 * 3, //cache 3 hours
                    fn () => ShopeeUtils::getProductInfo($productLink)
                );
            }

            $productInfo = ShopeeUtils::getProductInfo($productLink);
            if (!empty($productInfo['productLink'])) {
                $parsed = ShopeeUtils::parseShopeeUrl($productInfo['productLink']);

                if ($parsed) {
                    [$shopId, $productId] = $parsed;
                    $cacheKey = "shopee:{$shopId}:{$productId}";

                    Cache::put($cacheKey, $productInfo, 60 * 60 * 3); //cache 3 hours
                }
            }

            return $productInfo;
        }
        catch (\Exception $e) {
            throw new \Exception('Get Shopee Product Data error: '.$e->getMessage());
            return null;
        }
    }
}
