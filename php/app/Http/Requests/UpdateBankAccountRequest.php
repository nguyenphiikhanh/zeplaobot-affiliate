<?php

namespace App\Http\Requests;

class UpdateBankAccountRequest extends AppBaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
            'bank_id' => 'required|string',
            'bank_name' => 'required|string',
            'account_no' => 'required|string',
            'account_name' => 'required|string',
        ];
    }
}
