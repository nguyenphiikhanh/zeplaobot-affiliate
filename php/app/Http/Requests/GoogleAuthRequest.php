<?php

namespace App\Http\Requests;

class GoogleAuthRequest extends AppBaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
//            'platform' => [
//                'required',
//                'string',
//                'in:web,mobile',
//            ],
            'code' => [
                'nullable',
                'string',
                'required_without:id_token',
            ],

            'id_token' => [
                'nullable',
                'string',
                'required_without:code',
            ],

            'ref' => [
                'nullable',
                'string',
            ],

            'ref_code' => [
                'nullable',
                'string',
            ],
        ];
    }
}
