<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Utils\AppUtils;
use App\Utils\HttpUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TransactionController extends AppBaseController
{
    //
    public function getAllTransactionHistory(Request $request){
        try {
            $limit = $request->get('limit', AppUtils::DEFAULT_LIMIT);
            $query = WalletTransaction::query()
                ->with('wallet')
                ->with('wallet.user');
            $data = $query->orderByDesc('wallet_transactions.created_at')->paginate($limit);
            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    public function getUserTransactionHistory(Request $request, $userId){
        try {
            $limit = $request->get('limit', AppUtils::DEFAULT_LIMIT);
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $status = $request->get('status');
            $type = $request->get('type');
            $query = WalletTransaction::query()
                ->select('wallet_transactions.*')
                ->leftJoin('wallets', 'wallet_transactions.wallet_id', '=', 'wallets.id')
                ->where('wallets.user_id', $userId);
            if (!empty($type)) {
                $query->where('wallet_transactions.type', $type);
            }
            if (!empty($status)) {
                $query->where('wallet_transactions.status', $status);
            }
            if (!empty($startDate)) {
                $query->whereDate('wallet_transactions.created_at', '>=', $startDate);
            }
            if (!empty($endDate)) {
                $query->whereDate('wallet_transactions.created_at', '<=', $endDate);
            }
            $data = $query->orderByDesc('wallet_transactions.created_at')->paginate($limit);

            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getUserOverviewTransactionHistory(Request $request, $userId){
        try {
            $data = User::query()->with('wallet')->find($userId);
            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
