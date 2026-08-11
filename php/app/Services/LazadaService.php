<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class LazadaService
{
    private $lazopClient;
    public function __construct()
    {
        $this->lazopClient = new \LazopClient(
            config('services.lazada.api_url'),
            config('services.lazada.app_key'),
            config('services.lazada.app_secret')
        );
    }

    public function batchGetLink(string $link,string $subid){
        try {
            $request = new \LazopRequest("/marketing/getlink");
            $request->addApiParam("userToken", config('services.lazada.user_token'));
            $request->addApiParam("inputType", "url");
            $request->addApiParam("inputValue", $link);
            $request->addApiParam("subAffId", $subid);
            $response = $this->lazopClient->execute($request);

            $responseData = json_decode($response, true);
            $linkListInfo = $responseData['result']['data']['urlBatchGetLinkInfoList'] ?? [];
            $data = null;
            if (count($linkListInfo)) {
                $linkInfo = $linkListInfo[0];
                $productId = !empty($linkInfo['productId']) ? $linkInfo['productId'] : $this->getLazadaProductId($link);
                $data = [
                    'sub_id' => $subid,
                    'product_id' => $productId,
                    'originLink' => $linkInfo['originalUrl'],
                    'affiliateLink' => $linkInfo['regularPromotionLink'] ?? $linkInfo['offerPromotionLink'],
                ];
            }
            return $data;
        }
        catch (\Exception $e){
            throw $e;
        }
    }

    public function getProductInfo(string $productId){
        try {
            $request = new \LazopRequest("/marketing/product/feed","GET");
            $request->addApiParam("userToken", config('services.lazada.user_token'));
            $request->addApiParam("offerType", 1);
            $request->addApiParam("productIds", json_encode([$productId]));
            $request->addApiParam("page", 1);
            $request->addApiParam("limit", 10);
            $response = $this->lazopClient->execute($request);

            $responseData = json_decode($response, true);
            $productList = $responseData['result']['data'] ?? [];
            $productData = null;
            if (count($productList)) {
                $productData = $productList[0];
            }
            return $productData;
        }
        catch (\Exception $e){
            throw $e;
        }
    }

    public function getLazadaProductId(string $url): ?string
    {
        if (preg_match('/i(\d+)-s(\d+)\.html/', $url, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public function getConversionInfo(string $date, $subOrderId){
        try {
            $dateStart = Carbon::parse($date)->format('Y-m-d');
            $dateEnd = $dateStart; // get in one date
            $request = new \LazopRequest("/marketing/conversion/report","GET");
            $request->addApiParam("userToken", config('services.lazada.user_token'));
            $request->addApiParam("dateStart", $dateStart);
            $request->addApiParam("dateEnd", $dateEnd);
            $request->addApiParam("page", 1);
            $request->addApiParam("limit", 100);
            $response = $this->lazopClient->execute($request);

            $responseData = json_decode($response, true);
            $orderList = $responseData['result']['data'] ?? [];
            $orderInfo = null;
            if (count($orderList)) {
                $orderInfo = collect($orderList)->firstWhere('subOrderId', $subOrderId);
            }
            return $orderInfo;
        }
        catch (\Exception $e){
            throw $e;
        }
    }
}
