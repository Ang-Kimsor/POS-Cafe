<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->where('role', 'admin');

        // Optional: Include superadmin if requested
        if ($request->boolean('include_superadmin')) {
            $query = User::query()->whereIn('role', ['admin', 'superadmin']);
        }

        if ($request->has('status')) {
            if ($request->status == 'deleted') {
                $query->onlyTrashed();
            } elseif ($request->status == 'all') {
                $query->withTrashed();
            } elseif ($request->status == 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status == 'active') {
                $query->where('is_active', true);
            }
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'user_id');
        $sortDirection = $request->get('sort_direction', 'asc');

        // Ensure the sort column exists to prevent SQL errors
        $allowedSortColumns = ['user_id', 'name', 'email', 'role', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('user_id', 'desc');
        }

        if ($request->has('page') || $request->has('per_page')) {
            return $query->paginate($request->per_page ?? 10);
        }

        return $query->get();
    }

    public function restore($id)
    {
        $user = User::withTrashed()->where('role', 'admin')->findOrFail($id);
        $user->restore();

        return response()->json(['message' => 'Admin restored successfully'], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'string', Password::min(8)->mixedCase()->numbers()],
            'is_active' => 'nullable|boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'admin',
            'is_active' => $request->has('is_active') ? $request->is_active : true,
        ]);

        return [
            'message' => 'Admin created successfully',
            'data' => $user,
        ];
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'superadmin') {
            return response()->json(['message' => 'Superadmin accounts can only be managed via CLI command.'], 403);
        }
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Not an admin account.'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id.',user_id',
            'password' => ['nullable', 'string', Password::min(8)->mixedCase()->numbers()],
            'is_active' => 'nullable|boolean',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->filled('password')) {
            $user->password = bcrypt($request->password);
        }
        if ($request->has('is_active')) {
            $user->is_active = $request->is_active;
        }

        $user->save();

        return [
            'message' => 'Admin updated successfully',
            'data' => $user,
        ];
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        if ($user->role === 'superadmin') {
            return response()->json(['message' => 'Superadmin accounts can only be managed via CLI command.'], 403);
        }
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Not an admin account.'], 404);
        }

        return $user;
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        if ($user->role === 'superadmin') {
            return response()->json(['message' => 'Superadmin accounts can only be managed via CLI command.'], 403);
        }
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Not an admin account.'], 404);
        }

        $user->delete();

        return ['message' => 'Admin deleted successfully'];
    }

    public function count()
    {
        return ['count' => User::query()->where('role', 'admin')->count()];
    }
}
