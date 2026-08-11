<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Jobs\SyncLazadaOrder;
use App\Jobs\SyncOrderJob;
use App\Jobs\SyncTiktokOrder;
use App\Utils\AppUtils;
use App\Utils\HttpUtils;
use App\Utils\JobUtils;
use App\Utils\RoleUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends AppBaseController
{
    //
    public function getOrders(Request $request)
    {
        try {
            $limit = $request->limit ?? AppUtils::DEFAULT_LIMIT;
            $status = $request->status;
            $userId = $request->userId;
            $type = $request->type;
            $orderId = $request->order_id;
            $user = $request->user();
            $role = $user->role;
            if($role === RoleUtils::ROLE_ADMIN){
                $query = DB::table('orders')
                    ->select([
                        'orders.*',
                        'users.id as user_id',
                        'users.name as user_name',
                        'users.email as user_email',
                        'link_generations.type as type'
                    ])
                    ->leftJoin('link_generations', 'orders.sub_id', '=', 'link_generations.sub_id')
                    ->leftJoin('users', 'link_generations.user_id', '=', 'users.id');

                if (!empty($status)) {
                    $query->where('orders.order_status', $status);
                }
                if (!empty($userId)) {
                    $query->where('link_generations.user_id', $userId);
                }
                if (!empty($type)) {
                    $query->where('link_generations.type', $type);
                }
                if (!empty($orderId)) {
                    $query->where('orders.order_id', $orderId);
                }

                $orders = $query->orderByDesc('orders.order_time')->paginate($limit);
                return $this->sendResponse($orders, HttpUtils::getMessage(HttpUtils::HTTP_OK));
            }
            else{
                $query = DB::table('orders')
                    ->select('orders.*', 'link_generations.type as type')
                    ->join('link_generations', 'orders.sub_id', '=', 'link_generations.sub_id')
                    ->where('link_generations.user_id', $user->id);
                if (!empty($status)) {
                    $query->where('orders.order_status', $status);
                }
                $orders = $query->orderByDesc('orders.order_time')->paginate($limit);
                return $this->sendResponse($orders, HttpUtils::getMessage(HttpUtils::HTTP_OK));
            }
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function importOrders(Request $request)
    {
        try {
            $dataImport = $request->input('data', []);
            $uniqueData = [];
            foreach ($dataImport as $item) {
                $orderId = $item['orderId'];
                $commission = $item['totalOrderCommission'];

                if (!isset($uniqueData[$orderId]) || $commission > 0) {
                    $uniqueData[$orderId] = $item;
                }
            }
            $filteredData = array_values($uniqueData);
            SyncOrderJob::dispatch($filteredData)->onQueue(JobUtils::SYNC_ORDER_JOB);

            return $this->sendResponse(null, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function syncOrderFromTiktok(Request $request)
    {
        try{
            $data = $request->all();
            SyncTiktokOrder::dispatch($data)->onQueue(JobUtils::SYNC_ORDER_JOB);
            return $this->sendResponse(null, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function syncOrderFromLazada(Request $request)
    {
        try{
            $data = $request->all();
            SyncLazadaOrder::dispatch($data)->onQueue(JobUtils::SYNC_ORDER_JOB);
            return $this->sendResponse(null, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
