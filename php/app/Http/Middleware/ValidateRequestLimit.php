<?php

namespace App\Http\Middleware;

use App\Utils\AppUtils;
use App\Utils\HttpUtils;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateRequestLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $limit = $request->query('limit');

        if ($limit !== null) {
            $limitRules = AppUtils::LIMIT_RULES;
            if (!in_array((int)$limit, $limitRules, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The allowed limit values are [' . implode(', ', $limitRules) . '].'
                ], HttpUtils::HTTP_UNPROCESSABLE_ENTITY);
            }
        }
        return $next($request);
    }
}
