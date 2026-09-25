<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SizeController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
// Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->get('/me', function (\Illuminate\Http\Request $request) {
    if (isset($request->user()->is_active) && ! $request->user()->is_active) {
        return response()->json(['message' => 'Account is inactive'], 401);
    }
    return response()->json($request->user());
});

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // Cashier
    Route::prefix('cashier')->group(function () {
        Route::get('count', [CashierController::class, 'count']);
        Route::put('{id}/restore', [CashierController::class, 'restore']);
    });
    Route::apiResource('cashier', CashierController::class);

    // Category
    Route::apiResource('category', CategoryController::class);
    Route::put('category/{id}/restore', [CategoryController::class, 'restore']);

    // Size
    Route::apiResource('size', SizeController::class);
    Route::put('size/{id}/restore', [SizeController::class, 'restore']);

    // Product
    Route::prefix('product')->group(function () {
        Route::get('count', [ProductController::class, 'count']);
        Route::put('{id}/restore', [ProductController::class, 'restore']);
    });
    Route::apiResource('product', ProductController::class);

    // Order
    Route::prefix('order')->group(function () {
        Route::get('export', [OrderController::class, 'exportOrders']);
        Route::put('{id}/pay', [OrderController::class, 'markAsPaid']);
        Route::put('{id}/pending', [OrderController::class, 'markAsPending']);
    });
    Route::apiResource('order', OrderController::class);

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Reports
    Route::prefix('/reports')->group(function () {
        Route::get('/sales', [ReportController::class, 'getSalesReport']);
        Route::get('/sales/export', [ReportController::class, 'exportSalesReport']);
        Route::get('/products', [ReportController::class, 'getProductReport']);
        Route::get('/products/export', [ReportController::class, 'exportProductReport']);
    });

    // Setting & Admin (Superadmin only)
    Route::get('setting/key-value', [SettingController::class, 'getKeyValue']);

    // Allow all admins to fetch the list of admins for report filters
    Route::get('admin', [AdminController::class, 'index']);

    Route::middleware(['role:superadmin'])->group(function () {
        Route::apiResource('setting', SettingController::class)->except(['store', 'destroy']); // disabled add and delete setting
        Route::prefix('admin')->group(function () {
            Route::get('count', [AdminController::class, 'count']);
            Route::put('{id}/restore', [AdminController::class, 'restore']);
        });
        Route::apiResource('admin', AdminController::class)->except(['index']);
    });

    // Payment
    Route::prefix('payment')->group(function () {
        Route::post('generate-khqr', [PaymentController::class, 'generateKHQR']);
        Route::post('check', [PaymentController::class, 'checkPayment']);
    });
});

Route::middleware(['auth:sanctum', 'role:cashier'])->prefix('cashier')->group(function () {
    // Category
    Route::apiResource('category', CategoryController::class)->only('index');

    // Product
    Route::apiResource('product', ProductController::class)->only('index');

    // Cashier can create orders
    Route::get('order/export', [OrderController::class, 'exportCashierOrders']);
    Route::get('order', [OrderController::class, 'cashierOrders']);
    Route::apiResource('order', OrderController::class)->only(['show', 'store']);

    // Setting
    Route::get('setting', [SettingController::class, 'getKeyValue']);

    // Payment
    Route::prefix('payment')->group(function () {
        Route::post('generate-khqr', [PaymentController::class, 'generateKHQR']);
        Route::post('check', [PaymentController::class, 'checkPayment']);
    });
});
