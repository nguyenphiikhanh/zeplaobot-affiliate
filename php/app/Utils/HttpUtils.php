<?php

namespace App\Utils;

class HttpUtils
{
    // 2xx: Success
    const HTTP_OK = 200;
    const HTTP_CREATED = 201;
    const HTTP_ACCEPTED = 202;

    // 4xx: Client Errors
    const HTTP_BAD_REQUEST = 400;
    const HTTP_UNAUTHORIZED = 401;
    const HTTP_FORBIDDEN = 403;
    const HTTP_NOT_FOUND = 404;
    const HTTP_METHOD_NOT_ALLOWED = 405;
    const HTTP_UNPROCESSABLE_ENTITY = 422; // Validation errors
    const HTTP_TOO_MANY_REQUESTS = 429;   // Rate limiting / Spam

    // 5xx: Server Errors
    const HTTP_INTERNAL_SERVER_ERROR = 500;
    const HTTP_BAD_GATEWAY = 502;
    const HTTP_SERVICE_UNAVAILABLE = 503;

    // Default Messages Mapping
    public static function getMessage(int $msgCode): string
    {
        $messages = [
            self::HTTP_OK                     => 'The request has succeeded.',
            self::HTTP_CREATED                => 'The resource has been successfully created.',
            self::HTTP_ACCEPTED               => 'The request has been accepted for processing.',

            self::HTTP_BAD_REQUEST            => 'The request could not be understood or was invalid.',
            self::HTTP_UNAUTHORIZED           => 'Authentication is required or token has expired.',
            self::HTTP_FORBIDDEN              => 'You do not have permission to access this resource.',
            self::HTTP_NOT_FOUND              => 'The requested resource could not be found.',
            self::HTTP_METHOD_NOT_ALLOWED     => 'The HTTP method is not supported for this route.',
            self::HTTP_UNPROCESSABLE_ENTITY   => 'The given data failed the validation rules.',
            self::HTTP_TOO_MANY_REQUESTS      => 'Too many requests. Please slow down and try again later.',

            self::HTTP_INTERNAL_SERVER_ERROR  => 'An internal server error occurred.',
            self::HTTP_BAD_GATEWAY            => 'The server received an invalid response from the upstream server.',
            self::HTTP_SERVICE_UNAVAILABLE    => 'The server is temporarily down for maintenance. Please try again later.',
        ];

        // return msg
        return $messages[$msgCode] ?? 'Unknown error occurred.';
    }
}
