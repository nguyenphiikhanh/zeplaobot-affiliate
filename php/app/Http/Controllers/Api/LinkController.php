<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\LinkConvertRequest;
use App\Models\LinkGeneration;
use App\Services\LinkGenerationService;
use App\Services\ShopeeService;
use App\Utils\AppUtils;
use App\Utils\HttpUtils;
use App\Utils\ShopeeUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class LinkController extends AppBaseController
{
    private $linkGeneratorService;
    private $shopeeService;
    public function __construct(LinkGenerationService $linkGeneratorService, ShopeeService $shopeeService)
    {
        $this->linkGeneratorService = $linkGeneratorService;
        $this->shopeeService = $shopeeService;
    }
    //
    public function convert(LinkConvertRequest $request){
        try {
            $type = $request->get('type') ?? AppUtils::LINK_TYPE['shopee'];
                $originalLink = $request->get('originalLink');
            $user = auth()->user();
            if($type == AppUtils::LINK_TYPE['shopee']){
                $data = $this->linkGeneratorService->generateShopeeLink($originalLink, $user->id);
            }
            // tiktok link
            else if($type == AppUtils::LINK_TYPE['tiktok']){
                $data = $this->linkGeneratorService->generateTiktokLink($originalLink, $user->id);
            }
            //lazada link
            else if($type == AppUtils::LINK_TYPE['lazada']){
                $data = $this->linkGeneratorService->generateLazadaLink($originalLink, $user->id);
            }

            //shopeefood
            else if($type == AppUtils::LINK_TYPE['shopeefood']){
                $data = $this->linkGeneratorService->generateShopeeFoodLink($originalLink, $user->id);
            }
            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getLinkHistory(Request $request)
    {
        try {
            $limit = $request->get('limit', AppUtils::DEFAULT_LIMIT);
            $startDate = $request->get('startDate');
            $endDate = $request->get('endDate');
            $userId = $request->get('userId');
            $subId = $request->get('subId');
            $type = $request->get('type');
            $query = LinkGeneration::with('user');
            if (!empty($startDate)) {
                $query->whereDate('created_at', '>=', $startDate);
            }
            if (!empty($endDate)) {
                $query->whereDate('created_at', '<=', $endDate);
            }
            if(!empty($userId)){
                $query->where('user_id', $userId);
            }
            if(!empty($subId)){
                $query->where('sub_id', $subId);
            }
            if(!empty($type)){
                $query->where('type', $type);
            }
            $data = $query->orderBy('created_at', 'desc')->paginate($limit);
            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function accessFromShortLink($subId)
    {
        try {
            $url = Cache::get($subId);
            if(!$url){
                return "Saffi Info: Liên kết bạn truy cập không tồn tại.";
            }
            return redirect()->away($url);
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return "Saffi Info: Liên kết bạn truy cập không tồn tại.";
        }
    }

    public function replaceLink(Request $request){
        try{
            $text = $request->get('text');
            $pattern = '/https:\/\/s\.shopee\.vn\/[a-zA-Z0-9]+/';
            preg_match_all($pattern, $text, $matches);
            $shopeeLinks = $matches[0];
            $chunkedLinks = array_chunk($shopeeLinks, 5);
            $allConvertedLinks = [];
            foreach ($chunkedLinks as $chunk) {
                $linkItems = $this->linkGeneratorService->getShopeeBatchMultiLinkConvert($chunk);
                if (is_array($linkItems)) {
                    $shortLinks = array_column($linkItems, 'shortLink');
                    $allConvertedLinks = array_merge($allConvertedLinks, $shortLinks);
                }
            }
            $index = 0;
            $newText = preg_replace_callback(
                '/https:\/\/s\.shopee\.vn\/[a-zA-Z0-9]+/',
                function ($matches) use ($allConvertedLinks, &$index) {
                    $replacement = (!empty($allConvertedLinks[$index])) ? $allConvertedLinks[$index] : $matches[0];
                    $index++;
                    return $replacement;
                },
                $text
            );

            return $this->sendResponse(['text' => $newText], HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getShopeeOfferProductList(Request $request)
    {
        try{
            $data = $this->shopeeService->getOfferProducts($request);
            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
