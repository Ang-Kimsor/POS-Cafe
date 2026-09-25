<?php

namespace App\Exports;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProductReportExport implements FromCollection, ShouldAutoSize, WithHeadings, WithStrictNullComparison, WithStyles
{
    protected $request;

    public function __construct($request)
    {
        $this->request = $request;
    }

    public function collection(): \Illuminate\Support\Collection
    {
        $request = $this->request;

        // 1. Get all products matching the filters
        $productsQuery = DB::table('products')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.category_id')
            ->select(
                'products.product_id',
                'products.name as product_name',
                'categories.name as category',
                'categories.deleted_at as category_deleted_at',
                'categories.is_active as category_is_active'
            );

        if ($request->has('search') && $request->search) {
            $productsQuery->where('products.name', 'like', '%'.$request->search.'%');
        }

        if ($request->has('product_id') && $request->product_id != 'all') {
            $productsQuery->where('products.product_id', $request->product_id);
        }

        if ($request->has('category_id') && $request->category_id != 'all') {
            $productsQuery->where('products.category_id', $request->category_id);
        }

        $products = $productsQuery->orderBy('products.name')->get();

        // Fetch available sizes for all products
        $productSizes = DB::table('product_sizes')
            ->join('sizes', 'product_sizes.size_id', '=', 'sizes.size_id')
            ->select(
                'product_sizes.product_id',
                'sizes.size as size_name',
                'sizes.deleted_at as size_deleted_at',
                'sizes.is_active as size_is_active'
            )
            ->get()
            ->groupBy('product_id');

        // 2. Get sales data for the products
        $salesQuery = DB::table('order_products')
            ->join('orders', 'order_products.order_id', '=', 'orders.order_id')
            ->join('sizes', 'order_products.size_id', '=', 'sizes.size_id')
            ->where('orders.status', 'paid')
            ->select(
                'order_products.product_id',
                'sizes.size as size',
                'sizes.deleted_at as size_deleted_at',
                'sizes.is_active as size_is_active',
                DB::raw('SUM(order_products.qty) as qty_sold'),
                DB::raw('SUM(order_products.subtotal) as revenue')
            )
            ->groupBy('order_products.product_id', 'sizes.size_id', 'sizes.size');

        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $salesQuery->whereBetween('orders.created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        $salesData = $salesQuery->get()->groupBy('product_id');

        $exportData = [];
        $totalQty = 0;
        $totalRevenue = 0;

        foreach ($products as $product) {
            $productSales = $salesData->get($product->product_id, collect());
            $sizes = $productSizes->get($product->product_id, collect());

            if ($sizes->count() > 0) {
                foreach ($sizes as $size) {
                    $sale = $productSales->firstWhere('size', $size->size_name);

                    $qty = $sale ? (int) $sale->qty_sold : 0;
                    $rev = $sale ? (float) $sale->revenue : 0.0;

                    $categoryLabel = $product->category . ($product->category_deleted_at ? ' (Deleted)' : (!$product->category_is_active ? ' (Inactive)' : ''));
                    $sizeLabel = $size->size_name . ($size->size_deleted_at ? ' (Deleted)' : (!$size->size_is_active ? ' (Inactive)' : ''));

                    $exportData[] = [
                        'Product Name' => $product->product_name,
                        'Category' => $categoryLabel,
                        'Size' => $sizeLabel,
                        'Qty Sold' => $qty,
                        'Total Revenue' => '$'.number_format($rev, 2),
                    ];

                    $totalQty += $qty;
                    $totalRevenue += $rev;
                }
            } else {
                $qty = $productSales->sum('qty_sold');
                $rev = (float) $productSales->sum('revenue');

                $exportData[] = [
                    'Product Name' => $product->product_name,
                    'Category' => $product->category,
                    'Size' => 'N/A',
                    'Qty Sold' => $qty,
                    'Total Revenue' => '$'.number_format($rev, 2),
                ];

                $totalQty += $qty;
                $totalRevenue += $rev;
            }
        }

        // Add summary row
        $exportData[] = [
            'Product Name' => 'SUMMARY TOTAL',
            'Category' => '',
            'Size' => '',
            'Qty Sold' => $totalQty,
            'Total Revenue' => '$'.number_format($totalRevenue, 2),
        ];

        return collect($exportData);
    }

    public function headings(): array
    {
        return [
            'Product Name',
            'Category',
            'Size',
            'Qty Sold',
            'Total Revenue',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        return [
            // Style the first row as bold text.
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['rgb' => '07564d']],
            ],
            // Style the last row (Summary) as bold
            $lastRow => [
                'font' => ['bold' => true],
                'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['rgb' => 'dcfce7']], // emerald-100
            ],
        ];
    }
}
