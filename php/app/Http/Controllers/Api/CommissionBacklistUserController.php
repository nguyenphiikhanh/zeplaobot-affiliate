<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Utils\AppUtils;
use App\Utils\HttpUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommissionBacklistUserController extends AppBaseController
{
    //
    public function index(Request $request){
        try {
            $limit = $request->limit;
            $backlistUsers = DB::table('commission_blacklist_users')
                ->select(
                    'commission_blacklist_users.id',
                    'commission_blacklist_users.created_at as blacklisted_at',
                    'users.id as user_id',
                    'users.email',
                    'users.name',
                    'users.image',
                    'users.role',
                    'users.rank',
                    'users.created_at'
                )
                ->leftJoin('users', 'commission_blacklist_users.user_id', '=', 'users.id')
                ->paginate($limit ?? AppUtils::DEFAULT_LIMIT);
            return $this->sendResponse($backlistUsers, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function create(Request $request){
        try {
            $user_id = $request->user_id;
            DB::table('commission_blacklist_users')->updateOrInsert(['user_id' => $user_id]);
            return $this->sendResponse(null, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function delete($id){
        try {
            DB::table('commission_blacklist_users')->where('id', $id)->delete();
            return $this->sendResponse(null, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Exception $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
