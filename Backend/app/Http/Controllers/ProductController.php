<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductSize;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $isPos = ! $request->has('page') && ! $request->has('per_page') && ! $request->has('status') && ! $request->has('category_id');

        $query = Product::with(['sizes' => function ($q) use ($isPos) {
            if ($isPos) {
                $q->where('sizes.is_active', true);
            }
        }]);

        if ($request->has('category_id') && $request->category_id != 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status')) {
            if ($request->status == 'deleted') {
                $query->onlyTrashed()->with(['category' => function ($q) {
                    $q->withTrashed();
                }]);
            } elseif ($request->status == 'all') {
                $query->withTrashed()->with(['category' => function ($q) {
                    $q->withTrashed();
                }]);
            } elseif ($request->status == 'inactive') {
                $query->where('is_active', false)->with(['category' => function ($q) {
                    $q->withTrashed();
                }]);
            } elseif ($request->status == 'active') {
                $query->where('is_active', true)->with(['category' => function ($q) {
                    $q->withTrashed();
                }]);
            } else {
                // Default fallback if unknown status is provided
                $query->with(['category' => function ($q) {
                    $q->withTrashed();
                }]);
            }
        } else {
            // If no pagination is provided either, it's the POS screen
            if ($isPos) {
                $query->where('is_active', true)
                ->whereHas('category', function ($q) {
                    $q->whereNull('categories.deleted_at')
                      ->where('categories.is_active', true);
                })
                ->with('category');
            } else {
                $query->with(['category' => function ($q) {
                    $q->withTrashed();
                }]);
            }
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'product_id');
        $sortDirection = $request->get('sort_direction', 'asc');

        $allowedSortColumns = ['product_id', 'name', 'category_id', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('product_id', 'desc');
        }

        if ($request->has('page') || $request->has('per_page')) {
            return $query->paginate($request->per_page ?? 10);
        }

        return $query->get();
    }

    public function restore($id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->restore();

        return response()->json(['message' => 'Product restored successfully'], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        // Decode sizes JSON string if sent as form-data string
        if (is_string($request->sizes)) {
            $request->merge(['sizes' => json_decode($request->sizes, true)]);
        }

        // VALIDATION
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|integer|exists:categories,category_id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'nullable|boolean',
            'sizes' => 'nullable|array',
            'sizes.*.size_id' => 'required|integer|exists:sizes,size_id',
            'sizes.*.price' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            // UPLOAD IMAGE TO CLOUDINARY
            $imageUrl = null;
            $imageId = null;

            if ($request->hasFile('image')) {
                $cloudinary = new Cloudinary;

                $upload = $cloudinary->uploadApi()->upload($request->file('image')->getRealPath(), [
                    'folder' => 'Cafe',
                ]);

                $imageUrl = $upload['secure_url'];
                $imageId = $upload['public_id'];
            }

            // CREATE PRODUCT
            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'image_url' => $imageUrl,
                'image_id' => $imageId,
                'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : true,
            ]);

            // CREATE PRODUCT SIZES
        if ($request->has('sizes') && is_array($request->sizes)) {
            foreach ($request->sizes as $size) {
                if (isset($size['price']) && $size['price'] > 0) {
                    ProductSize::create([
                        'product_id' => $product->product_id,
                        'size_id' => $size['size_id'],
                        'price' => $size['price'],
                    ]);
                }
            }
        }

            DB::commit();

            return response()->json([
                'message' => 'Product created successfully',
                'data' => $product->load('sizes'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $product = Product::with(['category' => function ($q) {
            $q->withTrashed();
        }, 'sizes' => function ($q) {
            $q->withTrashed();
        }])->findOrFail($id);

        return $product;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Decode sizes JSON string if sent as form-data string
        if (is_string($request->sizes)) {
            $request->merge(['sizes' => json_decode($request->sizes, true)]);
        }

        $product = Product::findOrFail($id);

        // VALIDATION
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|integer|exists:categories,category_id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'nullable|boolean',
            'sizes' => 'nullable|array',
            'sizes.*.size_id' => 'required|integer|exists:sizes,size_id',
            'sizes.*.price' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $imageUrl = $product->image_url; // keep old image by default
            $imageId = $product->image_id;   // keep old image by default

            // UPLOAD NEW IMAGE IF PROVIDED
            if ($request->hasFile('image')) {
                $cloudinary = new Cloudinary;

                $upload = $cloudinary->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    ['folder' => 'Cafe']
                );

                // DELETE OLD IMAGE FROM CLOUDINARY
                if ($product->image_id) {
                    $cloudinary->uploadApi()->destroy($product->image_id);
                }

                $imageUrl = $upload['secure_url'];
                $imageId = $upload['public_id'];
            } elseif ($request->boolean('remove_image')) {
                // EXPLICITLY DELETE OLD IMAGE
                if ($product->image_id) {
                    $cloudinary = new Cloudinary;
                    $cloudinary->uploadApi()->destroy($product->image_id);
                }

                $imageUrl = null;
                $imageId = null;
            }

            // UPDATE PRODUCT
            $updateData = [
                'name' => $request->name,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'image_url' => $imageUrl,
                'image_id' => $imageId,
            ];
            
            if ($request->has('is_active')) {
                $updateData['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            }

            $product->update($updateData);

            // UPDATE OR CREATE PRODUCT SIZES
            if ($request->has('sizes') && is_array($request->sizes)) {
                $providedSizeIds = [];
                foreach ($request->sizes as $size) {
                    if (isset($size['price']) && $size['price'] > 0) {
                        $productSize = ProductSize::withTrashed()->updateOrCreate(
                            [
                                'product_id' => $product->product_id,
                                'size_id' => $size['size_id'],
                            ],
                            [
                                'price' => $size['price'],
                            ]
                        );

                        if ($productSize->trashed()) {
                            $productSize->restore();
                        }

                        $providedSizeIds[] = $size['size_id'];
                    }
                }

                // Remove any sizes that were deleted from the UI or had their price set to 0
                ProductSize::where('product_id', $product->product_id)
                    ->whereNotIn('size_id', $providedSizeIds)
                    ->delete();
            }

            DB::commit();

            return response()->json([
                'message' => 'Product updated successfully',
                'data' => $product->load('sizes'),
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        Product::destroy($id);

        return ['message' => 'Product deleted successfully'];
    }

    public function count()
    {
        return ['count' => Product::query()->count()];
    }
}
