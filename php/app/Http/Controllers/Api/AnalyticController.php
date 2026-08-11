<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Utils\HttpUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Utils\AnalyticUtils;

class AnalyticController extends AppBaseController
{
    //
    public function getAnalytics(Request $request)
    {
        try {
            $key = $request->key;
            $value = DB::table('analytics')
                ->where('key', $key)
                ->value('value');
            if (!$value) {
                \Illuminate\Support\Facades\Artisan::call('collect-analytic');
                $value = DB::table('analytics')
                    ->where('key', $key)
                    ->value('value');
            }
            $data = $value ? json_decode($value, true) : null;
            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getStatAnalytics(){
        try{
            $value = DB::table('analytics')
                ->where('key', AnalyticUtils::STAT_ANALYTIC)
                ->value('value');
            if (!$value) {
                \Illuminate\Support\Facades\Artisan::call('collect-analytic');
                $value = DB::table('analytics')
                    ->where('key', AnalyticUtils::STAT_ANALYTIC)
                    ->value('value');
            }
            $data = $value ? json_decode($value, true) : null;
            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch(\Exception $e){
            Log::error($e->getMessage().$e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
