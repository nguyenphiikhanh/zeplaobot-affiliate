<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\AppBaseRequest;

class TestSendEmailRequest extends AppBaseRequest
{
    public function rules(): array
    {
        return [
            'to_email' => 'required|email',
            'subject' => 'sometimes|required|string|max:255',
            'body_html' => 'sometimes|required|string',
        ];
    }
}
