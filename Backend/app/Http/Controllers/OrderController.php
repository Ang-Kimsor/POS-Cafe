<?php

namespace App\Http\Controllers;

use App\Helpers\ReceiptHelper;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Setting;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::with(['cashier:user_id,name']);

        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_code', 'like', "%{$search}%")
                    ->orWhereHas('cashier', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'order_id');
        $sortDir = $request->get('sort_direction', 'desc');

        $dbSortBy = $this->getOrderSortColumn($sortBy);

        return $query->orderBy($dbSortBy, $sortDir)->paginate($request->per_page ?? 10);
    }

    public function cashierOrders(Request $request)
    {
        $query = Order::with(['cashier:user_id,name'])
            ->where('cashier_id', Auth::id());

        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_method') && $request->payment_method != 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_code', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort_by', 'order_id');
        $sortDir = $request->get('sort_direction', 'desc');

        $dbSortBy = $this->getOrderSortColumn($sortBy);

        return $query->orderBy($dbSortBy, $sortDir)
            ->paginate($request->per_page ?? 10);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, TelegramService $telegramService)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,product_id',
            'items.*.size_id' => 'required|integer|exists:sizes,size_id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string',
            'remark' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Generate invoice code and looping queue number
            $datePrefix = now()->format('Ymd');
            $dailyTotalCount = Order::whereDate('created_at', now())->count() + 1;

            // Loop logic: reset every 100 for the customer queue
            $loopNum = (($dailyTotalCount - 1) % 100) + 1;
            $queueNum = str_pad($loopNum, 3, '0', STR_PAD_LEFT);

            // invoice_code keeps global daily count to stay unique (INV-YYYYMMDD-###)
            $invoiceCode = 'INV-' . $datePrefix . '-' . str_pad($dailyTotalCount, 3, '0', STR_PAD_LEFT);

            // Fetch settings for discount & tax
            $settings = Setting::pluck('value', 'key_name');
            $subtotal = collect($request->items)->sum(fn($i) => $i['price'] * $i['qty']);

            $discount = 0;
            if ($settings->get('enable_discount') == '1') {
                $threshold = (float) ($settings->get('discount_at') ?? 10);
                if ($subtotal >= $threshold) {
                    $discountRate = (float) ($settings->get('discount_percent') ?? 0) / 100;
                    $discount = round($subtotal * $discountRate, 2);
                }
            }

            $taxRate = (float) ($settings->get('tax_percent') ?? 0) / 100;
            $tax = round(($subtotal - $discount) * $taxRate, 2);
            $total = round(($subtotal - $discount) + $tax, 2);
            $status = $request->payment_method === 'qr' ? 'pending' : 'paid';
            $order = Order::create([
                'invoice_code' => $invoiceCode,
                'total_price' => $subtotal,
                'discount' => $discount,
                'tax_amount' => $tax,
                'final_price' => $total,
                'payment_method' => $request->payment_method ?? 'cash',
                'status' => $status,
                'remark' => $request->remark,
                'cashier_id' => Auth::id(),
                'queue_number' => $queueNum,
            ]);

            $khqrData = null;
            if ($request->payment_method === 'qr') {
                $bakongAccountId = env('BAKONG_ACCOUNT_ID');

                $merchant = new IndividualInfo(
                    bakongAccountID: $bakongAccountId,
                    merchantName: 'Ang Kimsor',
                    merchantCity: 'Phnom Penh',
                    currency: KHQRData::CURRENCY_USD,
                    amount: 0.0
                );

                $qrResponse = BakongKHQR::generateIndividual($merchant);

                if ($qrResponse->status['code'] === 0) {
                    $khqrData = [
                        'qr' => $qrResponse->data['qr'],
                        'md5' => $qrResponse->data['md5'],
                    ];
                    $order->khqr_md5 = $qrResponse->data['md5'];
                    $order->save();
                }
            }

            foreach ($request->items as $item) {
                OrderProduct::create([
                    'order_id' => $order->order_id,
                    'product_id' => $item['product_id'],
                    'size_id' => $item['size_id'],
                    'qty' => $item['qty'],
                    'subtotal' => round($item['price'] * $item['qty'], 2),
                ]);
            }

            DB::commit();

            // Return order with all relations for the invoice
            $order->load([
                'cashier:user_id,name',
                'orderProducts.product:product_id,name,image_url',
                'orderProducts.size:size_id,size',
            ]);
            try {
                $imagePath = ReceiptHelper::generate($order, $settings);

                $telegramService->sendPhoto($imagePath, $this->buildTelegramCaption($order));

                // Delete temp image
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            } catch (\Exception $e) {
                Log::error('Telegram Receipt Error: ' . $e->getMessage());
                // Fallback to text if image fails
                $telegramService->send($this->buildTelegramCaption($order));
            }

            return response()->json([
                'message' => 'Order created successfully',
                'data' => $order,
                'khqr' => $khqrData,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => 'Order creation failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $order = Order::with([
            'cashier:user_id,name',
            'orderProducts.product',
            'orderProducts.size',
        ])->findOrFail($id);

        return $order;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);

        if ($order->status === 'paid') {
            return response()->json([
                'message' => 'Paid orders cannot be cancelled.',
            ], 400);
        }

        $order->status = 'cancelled';
        $order->update();

        return [
            'message' => 'Order cancelled successfully',
            'data' => $order,
        ];
    }

    /**
     * Mark the order as paid.
     */
    public function markAsPaid($id, TelegramService $telegramService)
    {
        $order = Order::findOrFail($id);
        $order->status = 'paid';
        $order->update();

        // Load settings and relations for the receipt image
        $settings = Setting::pluck('value', 'key_name');
        $order->load([
            'cashier:user_id,name',
            'orderProducts.product:product_id,name',
            'orderProducts.size:size_id,size',
        ]);

        try {
            $imagePath = ReceiptHelper::generate($order, $settings);

            $telegramService->sendPhoto($imagePath, $this->buildTelegramCaption($order));

            // Delete temp image
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        } catch (\Exception $e) {
            Log::error('Telegram Receipt Error: ' . $e->getMessage());
            // Fallback to text if image fails
            $telegramService->send($this->buildTelegramCaption($order));
        }

        return [
            'message' => 'Order marked as paid successfully',
            'data' => $order,
        ];
    }

    /**
     * Mark the order as pending.
     */
    public function markAsPending($id)
    {
        $order = Order::findOrFail($id);

        if ($order->status === 'paid') {
            return response()->json([
                'message' => 'Paid orders cannot be changed back to pending.',
            ], 400);
        }

        $order->status = 'pending';
        $order->update();

        return [
            'message' => 'Order marked as pending successfully',
            'data' => $order,
        ];
    }

    public function exportOrders(Request $request)
    {
        $query = Order::with(['cashier:user_id,name']);

        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_code', 'like', "%{$search}%")
                    ->orWhereHas('cashier', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $sortBy = $request->get('sort_by', 'order_id');
        $sortDir = $request->get('sort_direction', 'desc');
        $dbSortBy = $this->getOrderSortColumn($sortBy);

        $orders = $query->orderBy($dbSortBy, $sortDir)->get();

        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\OrderExport($orders), 'Orders_Export.xlsx');
    }

    public function exportCashierOrders(Request $request)
    {
        $query = Order::with(['cashier:user_id,name'])
            ->where('cashier_id', Auth::id());

        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_method') && $request->payment_method != 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('start_date') && $request->has('end_date') && $request->start_date && $request->end_date) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_code', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort_by', 'order_id');
        $sortDir = $request->get('sort_direction', 'desc');
        $dbSortBy = $this->getOrderSortColumn($sortBy);

        $orders = $query->orderBy($dbSortBy, $sortDir)->get();

        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\OrderExport($orders), 'Cashier_Orders_Export.xlsx');
    }

    /**
     * Build the Telegram caption for an order receipt.
     */
    private function buildTelegramCaption(Order $order): string
    {
        $caption  = "🔖 <b>Invoice Code:</b> <code>{$order->invoice_code}</code>\n";
        $caption .= '⏱️ <b>Date:</b> ' . $order->created_at->format('H:i:s d/M/Y') . "\n";
        $caption .= '📊 <b>Status:</b> ' . strtoupper($order->status) . "\n";
        $caption .= '💰 <b>Tax:</b> +$' . number_format($order->tax_amount, 2) . "\n";
        $caption .= '🏷️ <b>Discount:</b> -$' . number_format($order->discount, 2) . "\n";
        $caption .= '💵 <b>Total Price:</b> <b>$' . number_format($order->final_price, 2) . ' (' . $order->payment_method . ")</b>\n";
        $caption .= '👨‍💼 <b>Cashier:</b> ' . ($order->cashier->name ?? 'N/A');

        return $caption;
    }

    /**
     * Map a frontend sort key to the actual DB column name.
     */
    private function getOrderSortColumn(string $sortBy): string
    {
        $sortMap = [
            'invoice_code'   => 'invoice_code',
            'created_at'     => 'created_at',
            'total_price'    => 'total_price',
            'discount'       => 'discount',
            'tax_amount'     => 'tax_amount',
            'final_price'    => 'final_price',
            'payment_method' => 'payment_method',
            'status'         => 'status',
        ];

        return $sortMap[$sortBy] ?? $sortBy;
    }
}
