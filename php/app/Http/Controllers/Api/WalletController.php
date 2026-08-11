<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateWalletWithdrawalRequest;
use App\Http\Requests\UpdateTransactionStatusRequest;
use App\Models\WalletTransaction;
use App\Services\ResendService;
use App\Utils\AppUtils;
use App\Utils\HttpUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletController extends AppBaseController
{
    public function getSelfUserWallet()
    {
        try {
            $user = auth()->user();
            return $this->sendResponse($user->wallet, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getUserWithdrawals(Request $request)
    {
        try {
            $limit = $request->query('limit', AppUtils::DEFAULT_LIMIT);
            $search = $request->query('search');
            $status = $request->query('status');
            $user = auth()->user();

            if($user->isAdmin()) {
                $query = WalletTransaction::with('wallet.user')->where('type', AppUtils::WALLET_TRANSACTION_TYPE['withdrawal']);
                if(!empty($search)){
                    $query->where('reference_id', 'like', "%{$search}%");
                }
                if(!empty($status)){
                    $query->where('wallet_transactions.status', $status);
                }
            }
            else{
                $query = $user->wallet?->transactions()
                    ->where('type', AppUtils::WALLET_TRANSACTION_TYPE['withdrawal']);
            }
            $data = $query->orderBy('wallet_transactions.created_at', 'desc')->paginate($limit);
            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getUserTransactions(Request $request)
    {
        try {
            $limit = $request->query('limit', AppUtils::DEFAULT_LIMIT);
            $type = $request->query('type');
            $user = auth()->user();

            $wallet = $user->wallet ?: Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['available_balance' => 0, 'pending_balance' => 0, 'total_paid' => 0]
            );

            $query = $wallet->transactions();

            if (!empty($type) && $type !== 'all') {
                $query->where('type', $type);
            }

            $data = $query->orderBy('created_at', 'desc')->paginate($limit);
            return $this->sendResponse($data, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        } catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function createWalletWithdrawal(CreateWalletWithdrawalRequest $request)
    {
        try {
            $user = auth()->user();
            $amount = (int) $request->input('amount');
            $wallet = $user->wallet;
            if(!$wallet) {
                return $this->sendError('Wallet is not exist!', HttpUtils::HTTP_UNPROCESSABLE_ENTITY);
            }
            if($wallet->available_balance < $amount) {
                return $this->sendError('Insufficient balance!', HttpUtils::HTTP_UNPROCESSABLE_ENTITY);
            }

            $bankAccount = $user->bankAccount;
            if(!$bankAccount) {
                return $this->sendError('Bank account is not exist!', HttpUtils::HTTP_UNPROCESSABLE_ENTITY);
            }

            $shortCode = strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
            $referenceId = "WD{$shortCode}";
            $description = "cashback SAFFI {$referenceId}";

            $qrCodeUrl = "https://img.vietqr.io/image/{$bankAccount->bank_id}-{$bankAccount->account_no}-compact.png?amount={$amount}&addInfo=" . rawurlencode($description) . "&accountName=" . rawurlencode($bankAccount->account_name);

            DB::transaction(function () use ($wallet, $referenceId, $amount, $qrCodeUrl, $description, $user) {
                $wallet->available_balance -= $amount;
                $wallet->pending_balance += $amount;
                $wallet->updated_at = now();
                $wallet->save();

                WalletTransaction::query()->create([
                    'wallet_id' => $wallet->id,
                    'type' => AppUtils::WALLET_TRANSACTION_TYPE['withdrawal'],
                    'amount' => -$amount,
                    'status' => AppUtils::WALLET_TRANSACTION_STATUS['pending'],
                    'reference_id' => $referenceId,
                    'description' => $description,
                    'qr_code_url' => $qrCodeUrl,
                    'created_at' => now(),
                ]);

                $resendService = new ResendService();
                $resendService->newWidrawalResendEmail($user);
            });
            return $this->sendResponse(null, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function updateTransactionStatus(UpdateTransactionStatusRequest $request, $transactionId)
    {
        try {
            $walletTransaction = WalletTransaction::query()->find($transactionId);
            if(!$walletTransaction) {
                return $this->sendError('Transaction not found!', HttpUtils::HTTP_UNPROCESSABLE_ENTITY);
            }
            $status = $request->input('status');
            $rejectReason = $request->input('rejectReason');
            DB::transaction(function () use ($walletTransaction, $status, $rejectReason) {
                $amount = abs($walletTransaction->amount);
                $walletTransaction->status = $status;
                $wallet = $walletTransaction->wallet;
                if($status === AppUtils::WALLET_TRANSACTION_STATUS['rejected']) {
                    $walletTransaction->reject_reason = $rejectReason;
                    $wallet->increment('available_balance', (int) $amount);
                    $wallet->decrement('pending_balance', (int) $amount);
                }
                elseif($status === AppUtils::WALLET_TRANSACTION_STATUS['success']) {
                    $wallet->increment('total_paid', (int) $amount);
                    $wallet->decrement('pending_balance', (int) $amount);
                }

                $walletTransaction->updated_at = now();
                $walletTransaction->save();
            });

            return $this->sendResponse(null, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage() . $e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
