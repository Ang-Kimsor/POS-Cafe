<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (isset($user->is_active) && ! $user->is_active) {
            return response()->json(['message' => 'Account is inactive'], 401);
        }

        // Superadmin has access to all routes
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Admin has access if route accepts admin or cashier
        if ($user->isAdmin() && (in_array('admin', $roles) || in_array('cashier', $roles))) {
            return $next($request);
        }

        // Exact match check
        if ($user->isCashier() && in_array('cashier', $roles)) {
            return $next($request);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }
}
