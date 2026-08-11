<?php

namespace App\Http\Middleware;

use App\Utils\HttpUtils;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckOwnerOrAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $userIdFromRoute = $request->route('user_id') ?? $request->route('id');
        $user = auth()->user();
        if($userIdFromRoute && $user->id !== (int)$userIdFromRoute && !$user->isAdmin()) {
            // not permitted
            return response()->json([
                'success' => false,
                'message' => HttpUtils::getMessage(HttpUtils::HTTP_FORBIDDEN)
            ], HttpUtils::HTTP_FORBIDDEN);
        }
        return $next($request);
    }
}
