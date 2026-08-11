<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ShopeeService
{
    private $handlerBaseUrl;
    private const PRODUCT_OFFER_API_TYPE = 'productOfferV2';
    private const PRODUCT_OFFER_LIST_TYPE = [
        'ALL' => 0,
        'HIGHEST_COMMISSION' => 1,
        'TOP_PERFORMING' => 2,
        'LANDING_CATEGORY' => 3,
        'DETAIL_CATEGORY' => 4,
        'DETAIL_SHOP' => 5,
        'DETAIL_COLLECTION' => 6,
    ];

    private const PRODUCT_OFFER_SORT_TYPE = [
        'RELEVANCE_DESC' => 1,
        'ITEM_SOLD_DESC' => 2,
        'PRICE_DESC' => 3,
        'PRICE_ASC' => 4,
        'COMMISSION_DESC' => 5,
    ];

    public function __construct()
    {
        $this->handlerBaseUrl = config('services.shopee.api_handle_url');
    }

    public function getOfferProducts(Request $request)
    {
        try {
            $page = $request->page ?? 1;
            $limit = 20;
            $keyword = $request->keyword ?? null;
            $params = [
                'page' => $page,
                'limit' => $limit,
                'keyword' => $keyword,
                'sortType' => self::PRODUCT_OFFER_SORT_TYPE['COMMISSION_DESC'],
                'listType' => self::PRODUCT_OFFER_LIST_TYPE['HIGHEST_COMMISSION'] ,
            ];

            $response = Http::withHeaders([
                'Accept' => 'application/json',
            ])->post($this->handlerBaseUrl, [
                'api_type' => self::PRODUCT_OFFER_API_TYPE,
                'params' => $params,
            ]);
            if($response->successful()){
                $resData = $response->json();
                $data = data_get($resData, "data.data.".self::PRODUCT_OFFER_API_TYPE);
                return $data;
            }
            return null;
        } catch (\Exception $exception) {
            throw new \Exception("get shopee Order Error: {$exception->getMessage()}");
            return null;
        }
    }
}
