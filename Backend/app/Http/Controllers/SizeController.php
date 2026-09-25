<?php

namespace App\Http\Controllers;

use App\Models\Size;
use Illuminate\Http\Request;

class SizeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Size::query();

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
                $q->where('size', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'size_id');
        $sortDirection = $request->get('sort_direction', 'asc');

        $allowedSortColumns = ['size_id', 'size'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('size_id', 'asc');
        }

        if ($request->has('page') || $request->has('per_page')) {
            return $query->paginate($request->per_page ?? 10);
        }

        return $query->get();
    }

    public function restore($id)
    {
        $size = Size::withTrashed()->findOrFail($id);
        $size->restore();

        return response()->json(['message' => 'Size restored successfully'], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'size' => 'required|string|max:50|unique:sizes,size',
            'is_active' => 'nullable|boolean',
        ]);

        $size = Size::create([
            'size' => $request->size,
            'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : true,
        ]);

        return response()->json([
            'message' => 'Size created successfully',
            'data' => $size,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $size = Size::findOrFail($id);

        return $size;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $size = Size::findOrFail($id);

        $request->validate([
            'size' => 'required|string|max:50|unique:sizes,size,'.$id.',size_id',
            'is_active' => 'nullable|boolean',
        ]);

        $updateData = [
            'size' => $request->size,
        ];
        
        if ($request->has('is_active')) {
            $updateData['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
        }

        $size->update($updateData);

        return response()->json([
            'message' => 'Size updated successfully',
            'data' => $size,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $size = Size::findOrFail($id);
        $size->delete();

        return response()->json(['message' => 'Size deleted successfully']);
    }
}
