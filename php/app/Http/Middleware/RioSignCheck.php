<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RioSignCheck
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('services.riohub.signing_secret');
        $rawBody = $request->getContent();
        $signatureHeader = $request->header('X-Riohub-Signature', '');
        if (!$signatureHeader) {
            return response()->json([
                'success' => false,
                'message' => 'Missing signature'
            ], 403);
        }
        parse_str(str_replace(',', '&', $signatureHeader), $parts);
        $timestamp = $parts['t'] ?? null;
        $signature = $parts['v1'] ?? null;
        $expectedSignature = hash_hmac(
            'sha256',
            $timestamp . '.' . $rawBody,
            $secret
        );

        if (!hash_equals($expectedSignature, $signature)) {
            Log::warning('Rio Postback failed signature verification');
            return response()->json([
                'success' => false,
                'message' => 'Invalid signature.',
            ], 403);
        }
        Log::info('Rio Postback verified!');
        return $next($request);
    }
}
