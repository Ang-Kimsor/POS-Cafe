<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Display a listing of the settings.
     */
    public function index(Request $request)
    {
        $query = Setting::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('key_name', 'like', "%{$search}%")
                    ->orWhere('value', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'setting_id');
        $sortDirection = $request->get('sort_direction', 'asc');

        $allowedSortColumns = ['setting_id', 'key_name', 'value'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('setting_id', 'asc');
        }

        if ($request->has('page') || $request->has('per_page')) {
            return $query->paginate($request->per_page ?? 10);
        }

        return response()->json($query->get());
    }

    /**
     * Fetch settings as key-value pairs (for logic use)
     */
    public function getKeyValue()
    {
        return response()->json(Setting::pluck('value', 'key_name'));
    }

    /**
     * Display the specified setting.
     */
    public function show($id)
    {
        return response()->json(Setting::findOrFail($id));
    }

    /**
     * Store a new setting.
     */
    /*
    public function store(Request $request)
    {
        $request->validate([
            'key_name' => 'required|unique:settings,key_name',
            'value' => 'required'
        ]);

        $setting = Setting::create([
            'key_name' => strtolower(str_replace(' ', '_', $request->key_name)),
            'value' => $request->value
        ]);

        return response()->json([
            'message' => 'Setting created successfully',
            'data' => $setting
        ], 201);
    }
    */

    /**
     * Update a specific setting.
     */
    public function update(Request $request, $id)
    {
        $setting = Setting::findOrFail($id);

        $request->validate([
            'value' => 'required',
        ]);

        $setting->update([
            'value' => $request->value,
        ]);

        return response()->json([
            'message' => 'Setting updated successfully',
            'data' => $setting,
        ]);
    }

    public function destory($id) {}
}
