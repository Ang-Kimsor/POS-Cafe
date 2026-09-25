<?php

namespace App\Http\Controllers;

use App\Exports\ProductReportExport;
use App\Exports\SalesReportExport;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Get Sales Report Data (Filtered)
     */
    public function getSalesReport(Request $request)
    {
        $query = Order::with('cashier:user_id,name')->where('status', 'paid');

        // Filter by Search (Invoice ID or Cashier Name)
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_code', 'like', "%{$search}%")
                    ->orWhereHas('cashier', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by Date Range
        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        // Filter by Payment Method
        if ($request->has('payment_method') && $request->payment_method != 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by Cashier
        if ($request->has('cashier_id') && $request->cashier_id != 'all') {
            $query->where('cashier_id', $request->cashier_id);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_direction', 'desc');

        // Map frontend accessors to DB columns if needed
        $sortMap = [
            'id' => 'invoice_code',
            'cashier' => 'cashier_id',
            'date' => 'created_at',
            'amount' => 'final_price',
            'method' => 'payment_method',
        ];
        $dbSortBy = $sortMap[$sortBy] ?? $sortBy;

        // Summary for cards (Calculate on a clone to avoid pagination interference)
        $summaryQuery = clone $query;
        $totalRevenue = $summaryQuery->sum('final_price');
        $avgOrderValue = $summaryQuery->avg('final_price') ?: 0;
        $totalDiscounts = $summaryQuery->sum('discount');

        $paginator = $query->orderBy($dbSortBy, $sortDir)->paginate($request->per_page ?? 10);

        $sales = collect($paginator->items())->map(function ($order) {
            return [
                'order_id' => $order->order_id,
                'id' => $order->invoice_code,
                'cashier' => $order->cashier ? $order->cashier->name : 'Unknown',
                'date' => $order->created_at->format('H:i:s d/M/Y'),
                'amount' => '$'.number_format($order->final_price, 2),
                'method' => $order->payment_method,
            ];
        });

        return response()->json([
            'summary' => [
                ['title' => 'Total Revenue', 'value' => '$'.number_format($totalRevenue, 2), 'change' => '', 'isUp' => true],
                ['title' => 'Avg. Order Value', 'value' => '$'.number_format($avgOrderValue, 2), 'change' => '', 'isUp' => true],
                ['title' => 'Total Discounts', 'value' => '$'.number_format($totalDiscounts, 2), 'change' => '', 'isUp' => true],
            ],
            'transactions' => [
                'data' => $sales,
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Get Product Report Data (Filtered)
     */
    public function getProductReport(Request $request)
    {
        $dateCondition = '';
        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $start = \Carbon\Carbon::parse($request->start_date)->startOfDay()->format('Y-m-d H:i:s');
            $end = \Carbon\Carbon::parse($request->end_date)->endOfDay()->format('Y-m-d H:i:s');
            $dateCondition = " AND orders.created_at BETWEEN '{$start}' AND '{$end}'";
        }

        // 1. Base query for products and their total sales
        $query = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->select(
                'products.product_id',
                'products.name',
                'categories.name as category',
                'categories.deleted_at as category_deleted_at',
                'categories.is_active as category_is_active',
                DB::raw("(SELECT COALESCE(SUM(qty), 0) FROM order_products JOIN orders ON order_products.order_id = orders.order_id WHERE order_products.product_id = products.product_id AND orders.status = 'paid'{$dateCondition}) as sold"),
                DB::raw("(SELECT COALESCE(SUM(subtotal), 0) FROM order_products JOIN orders ON order_products.order_id = orders.order_id WHERE order_products.product_id = products.product_id AND orders.status = 'paid'{$dateCondition}) as revenue")
            );

        // Filter by Search
        if ($request->has('search') && $request->search) {
            $query->where('products.name', 'like', '%'.$request->search.'%');
        }

        // Filter by Product
        if ($request->has('product_id') && $request->product_id != 'all') {
            $query->where('products.product_id', $request->product_id);
        }

        // Filter by Category
        if ($request->has('category_id') && $request->category_id != 'all') {
            $query->where('products.category_id', $request->category_id);
        }

        // Apply Date Filtering indirectly via Subqueries or by joining
        // For performance and dynamic sizes, we'll fetch the main list first

        $sortBy = $request->get('sort_by', 'sold');
        $sortDir = $request->get('sort_direction', 'desc');

        $paginator = $query->orderBy($sortBy, $sortDir)->paginate($request->per_page ?? 10);

        // 2. Fetch Detailed Size Stats for the products in current page
        $productIds = collect($paginator->items())->pluck('product_id')->toArray();

        $sizeStats = DB::table('order_products')
            ->join('orders', 'order_products.order_id', '=', 'orders.order_id')
            ->join('sizes', 'order_products.size_id', '=', 'sizes.size_id')
            ->whereIn('order_products.product_id', $productIds)
            ->where('orders.status', 'paid');

        // Apply Date Range to size stats if present
        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $sizeStats->whereBetween('orders.created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        $sizeStats = $sizeStats->select(
            'order_products.product_id',
            'sizes.size_id',
            'sizes.size as name',
            'sizes.deleted_at as size_deleted_at',
            'sizes.is_active as size_is_active',
            DB::raw('SUM(order_products.qty) as qty'),
            DB::raw('SUM(order_products.subtotal) as subtotal')
        )
            ->groupBy('order_products.product_id', 'sizes.size_id', 'sizes.size', 'sizes.deleted_at', 'sizes.is_active')
            ->get()
            ->groupBy('product_id');

        $sizeStatsGrouped = $sizeStats;

        // 3. Map everything together
        $products = collect($paginator->items())->map(function ($item) use ($sizeStatsGrouped) {
            $item->category = $item->category . ($item->category_deleted_at ? ' (Deleted)' : (!$item->category_is_active ? ' (Inactive)' : ''));
            unset($item->category_deleted_at);
            unset($item->category_is_active);

            return [
                'product_id' => $item->product_id,
                'name' => $item->name,
                'category' => $item->category,
                'sold' => (int) $item->sold,
                'revenue' => '$'.number_format($item->revenue, 2),
                'size_stats' => $sizeStatsGrouped->get($item->product_id, collect())->map(function ($stat) {
                    return [
                        'size_id' => $stat->size_id,
                        'name' => $stat->name . ($stat->size_deleted_at ? ' (Deleted)' : (!$stat->size_is_active ? ' (Inactive)' : '')),
                        'qty' => (int) $stat->qty,
                        'subtotal' => (float) $stat->subtotal,
                    ];
                })->values(),
            ];
        });

        // Stats Summary
        $globalStats = DB::table('orders')
            ->join('order_products', 'orders.order_id', '=', 'order_products.order_id')
            ->join('products', 'order_products.product_id', '=', 'products.product_id')
            ->where('orders.status', 'paid');

        // Filter by Search (for stats)
        if ($request->has('search') && $request->search) {
            $globalStats->where('products.name', 'like', '%'.$request->search.'%');
        }

        // Filter by Product (for stats)
        if ($request->has('product_id') && $request->product_id != 'all') {
            $globalStats->where('products.product_id', $request->product_id);
        }

        // Filter by Category (for stats)
        if ($request->has('category_id') && $request->category_id != 'all') {
            $globalStats->where('products.category_id', $request->category_id);
        }

        // Filter by Date Range (for stats)
        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $globalStats->whereBetween('orders.created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        $totalRevenue = $globalStats->sum('subtotal');

        $bestSellerQuery = DB::table('orders')
            ->join('order_products', 'orders.order_id', '=', 'order_products.order_id')
            ->join('products', 'order_products.product_id', '=', 'products.product_id')
            ->where('orders.status', 'paid');

        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $bestSellerQuery->whereBetween('orders.created_at', [
                \Carbon\Carbon::parse($request->start_date)->startOfDay(),
                \Carbon\Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        if ($request->has('category_id') && $request->category_id != 'all') {
            $bestSellerQuery->where('products.category_id', $request->category_id);
        }

        $bestSeller = $bestSellerQuery
            ->select('products.name', DB::raw('SUM(order_products.qty) as total_sold'))
            ->groupBy('products.product_id', 'products.name')
            ->orderBy('total_sold', 'desc')
            ->first();

        return response()->json([
            'stats' => [
                ['title' => 'Filtered Items', 'value' => $paginator->total(), 'desc' => 'Total products matched'],
                ['title' => 'Top Product', 'value' => $bestSeller ? $bestSeller->name : 'N/A', 'desc' => ($bestSeller ? (int) $bestSeller->total_sold : 0).' units sold'],
                ['title' => 'Total Revenue', 'value' => '$'.number_format($totalRevenue, 2), 'desc' => 'In selected filters'],
            ],
            'performance' => [
                'data' => $products,
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Get Product Report Data for Export (All, grouped by size)
     */
    public function exportProductReport(Request $request)
    {
        return Excel::download(new ProductReportExport($request), 'product_report_'.date('Y-m-d').'.xlsx');
    }

    /**
     * Get Sales Report Data for Export (All)
     */
    public function exportSalesReport(Request $request)
    {
        $query = Order::with(['cashier:user_id,name', 'orderProducts.product', 'orderProducts.size'])->where('status', 'paid');

        // Filter by Search (Invoice ID or Cashier Name)
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_code', 'like', "%{$search}%")
                    ->orWhereHas('cashier', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by Date Range
        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        // Filter by Payment Method
        if ($request->has('payment_method') && $request->payment_method != 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by Cashier
        if ($request->has('cashier_id') && $request->cashier_id != 'all') {
            $query->where('cashier_id', $request->cashier_id);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return Excel::download(new SalesReportExport($request, $orders), 'sales_report_'.date('Y-m-d').'.xlsx');
    }
}
