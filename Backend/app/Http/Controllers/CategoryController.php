<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::query();

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
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'category_id');
        $sortDirection = $request->get('sort_direction', 'asc');

        $allowedSortColumns = ['category_id', 'name'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('category_id', 'asc');
        }

        if ($request->has('page') || $request->has('per_page')) {
            return $query->paginate($request->per_page ?? 10);
        }

        return $query->get();
    }

    public function restore($id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        return response()->json(['message' => 'Category restored successfully'], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);
        $category = Category::create(
            [
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : true,
            ]
        );

        return [
            'message' => 'Category created successfully',
            'data' => $category,
        ];
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $category = Category::findOrFail($id);

        return $category;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $id . ',category_id',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);
        $category->name = $request->name;
        $category->description = $request->description;
        if ($request->has('is_active')) {
            $category->is_active = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
        }
        $category->update();

        return [
            'message' => 'Category updated successfully',
            'data' => $category,
        ];
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return ['message' => 'Category deleted successfully'];
    }
}
