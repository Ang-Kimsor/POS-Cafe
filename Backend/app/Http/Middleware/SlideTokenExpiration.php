<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SlideTokenExpiration
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $user = $request->user();
        if ($user && $user->currentAccessToken()) {
            $token = $user->currentAccessToken();

            $expires_hours = match ($user->role) {
                'superadmin' => 12,
                'admin', 'cashier' => 24,
                default => 24,
            };
            $minutes = $expires_hours * 60;

            // Extend token expiration in database
            $token->forceFill([
                'expires_at' => now()->addMinutes($minutes),
            ])->save();

            // Extend cookie expiration if we have the plain token and it's a valid response object
            $plainToken = $request->cookie('token') ?? $request->bearerToken();
            if ($plainToken && method_exists($response, 'cookie')) {
                $response->cookie('token', $plainToken, $minutes, '/', null, false, false);
                $response->cookie('role', $user->role, $minutes, '/', null, false, false);
            }
        }

        return $response;
    }
}
