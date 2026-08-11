<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Utils\HttpUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaderBoardController extends AppBaseController
{
    //
    public function getLeaderBoard(Request $request){
        try {
            $targetMonth = $request->query('month');
            if ($targetMonth) {
                $startOfMonth = Carbon::createFromFormat('Y-m', $targetMonth)->startOfMonth();
                $endOfMonth = $startOfMonth->copy()->endOfMonth();
            } else {
                $startOfMonth = Carbon::now()->startOfMonth();
                $endOfMonth = Carbon::now()->endOfMonth();
            }
            $selectColumns = [
                'wallets.user_id as userId',
                'users.name',
                'users.image',
                DB::raw('SUM(wallet_transactions.amount) as totalCommission'),
                DB::raw('COUNT(wallet_transactions.id) as totalOrders')
            ];

            $allTimeQuery = DB::table('wallet_transactions')
                ->select($selectColumns)
                ->join('wallets', 'wallet_transactions.wallet_id', '=', 'wallets.id')
                ->join('users', 'wallets.user_id', '=', 'users.id')
                ->where('wallet_transactions.type', 'commission')
                ->where('wallet_transactions.status', 'success')
                ->groupBy('wallets.user_id', 'users.name', 'users.image')
                ->orderByDesc(DB::raw('SUM(wallet_transactions.amount)'))
                ->limit(10);

            $monthlyQuery = (clone $allTimeQuery)
                ->where('wallet_transactions.created_at', '>=', $startOfMonth)
                ->where('wallet_transactions.created_at', '<=', $endOfMonth);

            $allTime = $allTimeQuery->get()->toArray();
            $monthly = $monthlyQuery->get()->toArray();
            $data = [
                'allTime'     => $allTime,
                'monthly'     => $monthly,
                'targetMonth' => $targetMonth ?? $startOfMonth->format('Y-m')
            ];
            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
