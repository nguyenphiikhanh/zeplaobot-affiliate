<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\AppBaseRequest;

class UpdateEmailTemplateRequest extends AppBaseRequest
{
    public function rules(): array
    {
        return [
            'subject' => 'sometimes|required|string|max:255',
            'body_html' => 'sometimes|required|string',
            'is_active' => 'sometimes|required|boolean',
        ];
    }
}
