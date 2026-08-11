<?php

namespace App\Services;

use App\Models\LinkGeneration;
use App\Utils\AppUtils;
use App\Utils\ShopeeUtils;
use App\Utils\TiktokUtils;
use App\Services\TelegramService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use stdClass;

class LinkGenerationService
{
    public function generateShopeeLink($originalLink, $userId){
        try {
            $productData = ShopeeUtils::getProductData($originalLink);
            [$shopId, $productId] = ShopeeUtils::parseShopeeUrl($productData['productLink']);
            $subId = $this->generateSubID();
            $isBlackList = DB::table('commission_blacklist_users')->where('user_id', $userId)->exists();
            $linkDataConvert = $this->getShopeeAffiliateLink($shopId, $productId, $subId, $isBlackList);
            try {
                $batchLink = $this->getShopeeBatchLinkConvert($originalLink, $subId, $isBlackList);
                $shopeeAffLink = $batchLink['shortLink'];
            }
            catch (\Exception $exception){
                $shopeeAffLink = $linkDataConvert['affiliateLink'];
            }

            // Save to DB
            LinkGeneration::query()->create([
                'user_id' => $userId,
                'sub_id' => $subId,
                'type' => AppUtils::LINK_TYPE['shopee'],
                'origin_link' => $originalLink,
                'affiliate_link' => $shopeeAffLink,
                'product_info' => $productData,
            ]);
            //
            return [
                'originalLink' => $originalLink,
                'affiliateLink' => $shopeeAffLink,
                'productInfo' => [
                    'productLink' => $productData['productLink'] ?? '',
                    'productName' => $productData['productName'] ?? '',
                    'imageUrl' => $productData['imageUrl'] ?? '',
                    'commission' => $productData['commission'] ?? 0,
                    ...$this->getCommissionRange('shopee'),
                ],
            ];
        }
        catch (\Exception $e) {
            throw new \Exception('Convert Shopee Link error: '.$e->getMessage());
            return null;
        }
    }

    public function generateShopeeFoodLink($originalLink, $userId){
        try {
            $subId = $this->generateSubID();
            $isBlackList = DB::table('commission_blacklist_users')->where('user_id', $userId)->exists();
            $shopeeAffLink = $this->getShopeeBatchLinkConvert($originalLink, $subId, $isBlackList);

            // Save to DB
            LinkGeneration::query()->create([
                'user_id' => $userId,
                'sub_id' => $subId,
                'type' => AppUtils::LINK_TYPE['shopeefood'],
                'origin_link' => $originalLink,
                'affiliate_link' => $shopeeAffLink['shortLink'],
                'product_info' => null,
            ]);
            //
            return [
                'originalLink' => $originalLink,
                'affiliateLink' => $shopeeAffLink['shortLink'],
                'productInfo' => null,
            ];
        }
        catch (\Exception $e) {
            throw new \Exception('Convert Shopee Link error: '.$e->getMessage());
            return null;
        }
    }

    public function generateTiktokLink(string $originalLink, $userId){
        try {
            $linkData = $this->getTiktokAffiliateLink($originalLink);
            $cacheKey = "tiktok:{$linkData['product_id']}";
            $productData = Cache::remember(
                $cacheKey,
                60 * 60 * 3,
                fn() => TiktokUtils::getProductInfo($linkData['product_id'])
            );
            $commissionStr = $productData['commission']['amount'] ?? '0 - 0';
            $parts = explode('-', $commissionStr);
            $maxStr = trim(end($parts));
            $maxCommission = (int) $maxStr;

            // Save to DB
            LinkGeneration::query()->create([
                'user_id' => $userId,
                'sub_id' => $linkData['sub_id'],
                'type' => AppUtils::LINK_TYPE['tiktok'],
                'origin_link' => $originalLink,
                'affiliate_link' => $linkData['affiliateLink'],
                'product_info' => $productData,
            ]);

            return [
                'originalLink' => $originalLink,
                'affiliateLink' => $linkData['affiliateLink'],
                'productInfo' => [
                    'productLink' => $productData['detail_link'] ?? '',
                    'productName' => $productData['title'] ?? '',
                    'imageUrl' => $productData['main_image_url'] ?? '',
                    'commission' => $maxCommission,
                    ...$this->getCommissionRange('tiktok'),
                ],
            ];
        }
        catch (\Exception $e) {
            throw new \Exception('Convert Tiktok Link error: '.$e->getMessage());
            return null;
        }
    }

    public function generateLazadaLink(string $originalLink, $userId)
    {
        try{
            $subid = $this->generateSubID();
            $lazadaService = new LazadaService();
            $linkData = $lazadaService->batchGetLink($originalLink, $subid);
            if(!$linkData || empty($linkData['product_id'])){
                throw new \Exception('No product id found');
            }
            $cacheKey = "lazada:{$linkData['product_id']}";
            $productData = Cache::remember(
                $cacheKey,
                60 * 60 * 3,
                fn() => $lazadaService->getProductInfo($linkData['product_id'])
            );
            // Save to DB
            LinkGeneration::query()->create([
                'user_id' => $userId,
                'sub_id' => $linkData['sub_id'],
                'type' => AppUtils::LINK_TYPE['lazada'],
                'origin_link' => $originalLink,
                'affiliate_link' => $linkData['affiliateLink'],
                'product_info' => $productData,
            ]);

            return [
                'originalLink' => $originalLink,
                'affiliateLink' => $linkData['affiliateLink'],
                'productInfo' => [
                    'productLink' => $linkData['affiliateLink'],
                    'productName' => $productData['productName'] ?? '',
                    'imageUrl' => $productData['pictures'][0] ?? '',
                    'commission' => $productData['totalCommissionAmount'] ?? 0,
                    ...$this->getCommissionRange('lazada'),
                ],
            ];
            return $productData;
        }
        catch (\Exception $e) {
            throw new \Exception('Generate Lazada Affiliate Link error: '.$e->getMessage());
            return null;
        }
    }

    public function getShopeeAffiliateLink(string $shopId, string $productId, string $subId, $isInBlackList = false){
        try {
            if (empty(env('SHOPEE_AFFILIATE_ID'))) {
                throw new \Exception('SHOPEE_AFFILIATE_ID is not defined!');
            }

            $originLink = "https://shopee.vn/opaanlp/{$shopId}/{$productId}";
            $queryParams = http_build_query([
                'origin_link'  => $originLink,
                'affiliate_id' => $isInBlackList ? env('SHOPEE_BLACKLIST_AFFILIATE_ID') : env('SHOPEE_AFFILIATE_ID'),
                'sub_id'       => $subId,
            ]);

            return [
                'sub_id'        => $subId,
                'originLink'    => $originLink,
                'affiliateLink' => "https://s.shopee.vn/an_redir?{$queryParams}"
            ];

        }
        catch (\Exception $e) {
            throw new \Exception('Generate Shopee Affiliate Link error: '.$e->getMessage());
            return null;
        }
    }

    public function getShopeeBatchLinkConvert(string $originalLink, $subId, $isInBlackList = false){
        try{
            $cookieData = !$isInBlackList ? Cache::get("shopee:cookie") : Cache::get("shopee-blacklist:cookie");
            if (!$cookieData || empty($cookieData['cookie'])) {
                $cookieData = Cache::get("shopee:cookie");
            }

            if (!isset($cookieData) || empty($cookieData['cookie'])) {
                app(TelegramService::class)->notifyShopeeCookieExpired('Convert link Shopee');
                throw new \Exception("BatchGetLink Error: Cookie not set.");
            }

            $expiredAt = Carbon::parse($cookieData['updated_at'])->addDays(7);
            $remainingDays = now()->diffInDays($expiredAt, false);
            if (!($remainingDays > 0)) {
                app(TelegramService::class)->notifyShopeeCookieExpired('Convert link Shopee');
                throw new \Exception("BatchGetLink Error: Cookie expired.");
            }

            $shopeeBaseApi = env('SHOPEE_BASE_API'). "/gql?q=batchCustomLink";
            $query = <<<'GRAPHQL'
                query batchGetCustomLink($linkParams: [CustomLinkParam!], $sourceCaller: SourceCaller) {
                    batchCustomLink(linkParams: $linkParams, sourceCaller: $sourceCaller) {
                        shortLink
                        longLink
                        failCode
                    }
                }
                GRAPHQL;
            $data = [
                'cookie' => $cookieData['cookie'] ?? null,
                'payload' => [
                    'operationName' => 'batchGetCustomLink',
                    'query' => $query,
                    'variables' => [
                        'linkParams' => [
                            [
                                'originalLink' => $originalLink,
                                'advancedLinkParams' => [
                                    'subId1' => $subId,
                                ],
                            ],
                        ],
                        'sourceCaller' => 'CUSTOM_LINK_CALLER',
                    ]
                ],
            ];
            $response = Http::withHeaders([
                'accept' => '*/*',
                'user-agent' => AppUtils::USER_AGENT,
                "sec-fetch-dest" => "empty",
                "sec-fetch-site" => "same-origin",
                "sec-ch-ua" =>      '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
                "content-type" =>   "application/json",
                'cookie' => $data['cookie'] ?? null,
            ])->post($shopeeBaseApi, $data['payload']);

            if (!$response->successful()) {
                app(TelegramService::class)->notifyShopeeCookieExpired('Convert link Shopee');
                throw new \Exception('HTTP request batchCustomLink failed.');
            }

            $json = $response->json();
            $item = data_get($json, 'data.batchCustomLink.0');

            if (!$item || data_get($item, 'failCode') !== 0 || empty(data_get($item, 'shortLink'))) {
                app(TelegramService::class)->notifyShopeeCookieExpired('Convert link Shopee');
                throw new \Exception('batchCustomLink convert failed.');
            }

            return [
                'shortLink' => $item['shortLink'],
                'longLink' => $item['longLink'],
                'failCode' => $item['failCode'],
            ];
        }
        catch (\Throwable $error) {
            app(TelegramService::class)->notifyShopeeCookieExpired('Convert link Shopee');
            throw $error;
        }
    }

    public function getShopeeBatchMultiLinkConvert(array $originalLink = []){
        try{
            $cookieData = Cache::get("shopee-blacklist:cookie") ?? Cache::get("shopee:cookie");
            if (!isset($cookieData) || empty($cookieData['cookie'])) {
                app(TelegramService::class)->notifyShopeeCookieExpired('Batch replace link Shopee');
                throw new \Exception("BatchGetLink Multi Error: Cookie not set.");
            }

            $expiredAt = Carbon::parse($cookieData['updated_at'])->addDays(7);
            $remainingDays = now()->diffInDays($expiredAt, false);
            if (!($remainingDays > 0)) {
                app(TelegramService::class)->notifyShopeeCookieExpired('Batch replace link Shopee');
                throw new \Exception("BatchGetLink Multi Error: Cookie expired.");
            }

            $shopeeBaseApi = env('SHOPEE_BASE_API'). "/gql?q=batchCustomLink";
            $query = <<<'GRAPHQL'
                query batchGetCustomLink($linkParams: [CustomLinkParam!], $sourceCaller: SourceCaller) {
                    batchCustomLink(linkParams: $linkParams, sourceCaller: $sourceCaller) {
                        shortLink
                        longLink
                        failCode
                    }
                }
                GRAPHQL;
            $linkParams = [];
            foreach ($originalLink as $link) {
                $linkParams[] = [
                    'originalLink' => $link,
                    'advancedLinkParams' => new StdClass(),
                ];
            }
            $data = [
                'cookie' => $cookieData['cookie'] ?? null,
                'payload' => [
                    'operationName' => 'batchGetCustomLink',
                    'query' => $query,
                    'variables' => [
                        'linkParams' => $linkParams,
                        'sourceCaller' => 'CUSTOM_LINK_CALLER',
                    ]
                ],
            ];
            $response = Http::withHeaders([
                'accept' => '*/*',
                'user-agent' => AppUtils::USER_AGENT,
                "sec-fetch-dest" => "empty",
                "sec-fetch-site" => "same-origin",
                "sec-ch-ua" =>      '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
                "content-type" =>   "application/json",
                'cookie' => $data['cookie'] ?? null,
            ])->post($shopeeBaseApi, $data['payload']);

            if (!$response->successful()) {
                app(TelegramService::class)->notifyShopeeCookieExpired('Batch replace link Shopee');
                throw new \Exception('BatchGetLink Multi HTTP Request failed.');
            }

            $json = $response->json();
            $linkItems = data_get($json, 'data.batchCustomLink');

            if (!$linkItems || !is_array($linkItems)) {
                app(TelegramService::class)->notifyShopeeCookieExpired('Batch replace link Shopee');
                throw new \Exception('BatchGetLink Multi convert failed.');
            }

            foreach ($linkItems as $item) {
                if (!is_array($item) || data_get($item, 'failCode') !== 0 || empty(data_get($item, 'shortLink'))) {
                    app(TelegramService::class)->notifyShopeeCookieExpired('Batch replace link Shopee');
                    throw new \Exception('BatchGetLink Multi convert failed: failCode non-zero or empty shortLink.');
                }
            }

            return $linkItems;
        }
        catch (\Throwable $error) {
            app(TelegramService::class)->notifyShopeeCookieExpired('Batch replace link Shopee');
            throw $error;
        }
    }

    public function getTiktokAffiliateLink(string $productLink){
        try {
            $baseUrlTiktokAPI = env('TIKTOK_BASE_API');
            $subid = $this->generateSubID();
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'X-Riohub-Api-Key' => env('TIKTOK_BASE_API_KEY'),
            ])->post($baseUrlTiktokAPI. "/links", [
                'product_url' => $productLink,
                'creator_username' => env('TIKTOK_BASE_API_CREATOR'),
                'sub_id' => $subid,
            ]);
            $data = $response->json();
            return [
                'sub_id' => $subid,
                'product_id' => $data['product_id'],
                'originLink' => $productLink,
                'affiliateLink' => $data['affiliate_link'],
            ];
        }
        catch (\Exception $e) {
            throw new \Exception('Generate Tiktok Affiliate Link error: '.$e->getMessage());
            return null;
        }
    }

    private function generateSubID(int $length = 8): string
    {
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        $maxIndex = strlen($characters) - 1;
        do {
            $code = '';
            for ($i = 0; $i < $length; $i++) {
                $code .= $characters[random_int(0, $maxIndex)];
            }
        } while (LinkGeneration::query()->where('sub_id', $code)->exists());

        return $code;
    }

    private function getCommissionRange(string $platform): array
    {
        $config = app(CommissionConfigService::class)->getPlatform($platform);

        return [
            'commission_min_rate' => $config['rank_rates']['silver'],
            'commission_max_rate' => $config['rank_rates']['obsidian'] + $config['sale_day_bonus'],
        ];
    }
}
