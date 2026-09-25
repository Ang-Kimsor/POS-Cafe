<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
        if (isset($user->is_active) && ! $user->is_active) {
            return response()->json(['message' => 'Account is inactive'], 403);
        }
        $expires_hours = match ($user->role) {
            'superadmin' => 12,
            'admin', 'cashier' => 24,
            default => 24,
        };
        $minutes = $expires_hours * 60;

        $expiresAt = now()->addMinutes($minutes);
        $tokenName = $user->role . '_token_auth';
        $token = $user->createToken($tokenName, ['*'], $expiresAt)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'expires_hours' => $expires_hours,
        ])->cookie('token', $token, $minutes, '/', null, false, false)
            ->cookie('role', $user->role, $minutes, '/', null, false, false);
    }
}
