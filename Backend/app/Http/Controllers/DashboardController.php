<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. KPIs
        $totalSales = Order::where('status', 'paid')->sum('final_price');
        $ordersCount = Order::where('status', 'paid')->count();
        $todayRevenue = Order::where('status', 'paid')->whereDate('created_at', now()->toDateString())->sum('final_price');
        $todayOrdersCount = Order::where('status', 'paid')->whereDate('created_at', now()->toDateString())->count();
        $cashierCount = User::where('role', 'cashier')->count();
        $adminCount = User::where('role', 'admin')->count();
        $superAdminCount = User::where('role', 'superadmin')->count();
        $totalUsersCount = User::count();
        $productsCount = Product::count();

        // 2. Monthly Sales (Last 6 Months)
        $monthlySales = Order::select(
            DB::raw('SUM(final_price) as total'),
            DB::raw("DATE_FORMAT(created_at, '%b') as month"),
            DB::raw('MONTH(created_at) as month_num')
        )
            ->where('status', 'paid')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy(DB::raw("DATE_FORMAT(created_at, '%b')"), DB::raw('MONTH(created_at)'))
            ->orderBy('month_num')
            ->get();

        // 3. Categories Distribution (Products count per category)
        $categoriesStats = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->whereNull('products.deleted_at')
            ->whereNull('categories.deleted_at')
            ->select(DB::raw('categories.name as name'), DB::raw('COUNT(products.product_id) as count'))
            ->groupBy('categories.name')
            ->get();

        // 4. Weekly Revenue (Last 7 Days)
        $dailyRevenue = Order::select(
            DB::raw('SUM(final_price) as total'),
            DB::raw("DATE_FORMAT(created_at, '%d %b') as date"),
            DB::raw('DATE(created_at) as full_date')
        )
            ->where('status', 'paid')
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy(DB::raw("DATE_FORMAT(created_at, '%d %b')"), DB::raw('DATE(created_at)'))
            ->orderBy('full_date')
            ->get();

        // 5. Top Products (Most Sold)
        $topProducts = DB::table('order_products')
            ->join('products', 'order_products.product_id', '=', 'products.product_id')
            ->join('orders', 'order_products.order_id', '=', 'orders.order_id')
            ->where('orders.status', 'paid')
            ->select(DB::raw('products.name as name'), DB::raw('SUM(order_products.qty) as total_sold'))
            ->groupBy('products.name')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'kpis' => [
                [
                    'title' => 'Total Revenue',
                    'value' => '$'.number_format($totalSales, 2),
                    'today' => $todayRevenue > 0 ? '$'.number_format($todayRevenue, 2) : null,
                ],
                [
                    'title' => 'Orders',
                    'value' => $ordersCount,
                    'today' => $todayOrdersCount > 0 ? $todayOrdersCount : null,
                ],
                [
                    'title' => 'Users',
                    'value' => $totalUsersCount,
                    'desc' => "{$cashierCount} Cashiers, {$adminCount} Admins, {$superAdminCount} Superadmins",
                    'breakdown' => [
                        'cashier' => $cashierCount,
                        'admin' => $adminCount,
                        'superadmin' => $superAdminCount,
                    ],
                ],
                ['title' => 'Products', 'value' => $productsCount],
            ],
            'charts' => [
                'line' => [
                    'labels' => $monthlySales->pluck('month'),
                    'data' => $monthlySales->pluck('total'),
                ],
                'pie' => [
                    'labels' => $categoriesStats->pluck('name'),
                    'data' => $categoriesStats->pluck('count'),
                ],
                'bar' => [
                    'labels' => $dailyRevenue->pluck('date'),
                    'data' => $dailyRevenue->pluck('total'),
                ],
                'topProducts' => [
                    'labels' => $topProducts->pluck('name'),
                    'data' => $topProducts->pluck('total_sold'),
                ],
            ],
        ]);
    }
}
