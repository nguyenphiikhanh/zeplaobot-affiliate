<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\UpdateBankAccountRequest;
use App\Models\BankAccount;
use App\Utils\HttpUtils;
use Illuminate\Support\Facades\Log;

class BankAccountController extends AppBaseController
{
    /**
     * Display the specified resource.
     */
    public function getBankByUser(string $user_id)
    {
        //
        try {
            $bankAccount = BankAccount::query()->where('user_id', $user_id)->first() ?? null;
            return $this->sendResponse($bankAccount, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage().$e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateBankAccount(UpdateBankAccountRequest $request, string $user_id)
    {
        //
        try {
            BankAccount::query()->updateOrCreate(
                ['user_id' => $user_id],
                [
                    'bank_id' => $request->input('bank_id'),
                    'bank_name' => $request->input('bank_name'),
                    'account_no' => $request->input('account_no'),
                    'account_name' => $request->input('account_name')
                ]
            );
            return $this->sendResponse(null, HttpUtils::getMessage(HttpUtils::HTTP_OK));
        }
        catch (\Throwable $e) {
            Log::error($e->getMessage().$e->getTraceAsString());
            return $this->sendError(HttpUtils::getMessage(HttpUtils::HTTP_INTERNAL_SERVER_ERROR), HttpUtils::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
