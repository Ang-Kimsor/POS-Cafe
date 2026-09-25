<?php

namespace App\Http\Controllers;

use App\Helpers\ReceiptHelper;
use App\Models\Order;
use App\Models\Setting;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;

class PaymentController extends Controller
{
    public function generateKHQR(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'invoice_code' => 'required|string',
        ]);

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
            return response()->json([
                'qr' => $qrResponse->data['qr'],
                'md5' => $qrResponse->data['md5'],
            ]);
        }

        return response()->json(['message' => 'Failed to generate KHQR'], 500);
    }

    public function checkPayment(Request $request, TelegramService $telegramService)
    {
        $request->validate([
            'md5' => 'required|string',
            'order_id' => 'required|integer',
        ]);

        $token = env('BAKONG_TOKEN');
        $bakongKHQR = new BakongKHQR($token);

        try {
            $response = $bakongKHQR->checkTransactionByMD5($request->md5);

            // responseCode 0 means success in Bakong API
            if (isset($response['responseCode']) && $response['responseCode'] === 0) {
                $order = Order::find($request->order_id);
                if ($order && $order->status !== 'paid') {
                    $order->status = 'paid';
                    $order->save();

                    // Send Telegram notification on successful payment verification
                    try {
                        $settings = Setting::pluck('value', 'key_name');
                        $order->load([
                            'cashier:user_id,name',
                            'orderProducts.product:product_id,name',
                            'orderProducts.size:size_id,size',
                        ]);

                        $imagePath = ReceiptHelper::generate($order, $settings);

                        $caption = "🔖 <b>Invoice Code:</b> <code>{$order->invoice_code}</code>\n";
                        $caption .= '⏱️ <b>Date:</b> '.$order->created_at->format('H:i:s d/M/Y')."\n";
                        $caption .= '📊 <b>Status:</b> PAID'."\n";
                        $caption .= '💰 <b>Tax:</b> +$'.number_format($order->tax_amount, 2)."\n";
                        $caption .= '🏷️ <b>Discount:</b> -$'.number_format($order->discount, 2)."\n";
                        $caption .= '💵 <b>Total Price:</b> <b>$'.number_format($order->final_price, 2).' ('.$order->payment_method.")</b>\n";
                        $caption .= '👨‍💼 <b>Cashier:</b> '.($order->cashier->name ?? 'N/A');

                        $telegramService->sendPhoto($imagePath, $caption);

                        // Delete temp image
                        if (file_exists($imagePath)) {
                            unlink($imagePath);
                        }
                    } catch (\Exception $te) {
                        Log::error('Telegram Receipt Error in checkPayment: '.$te->getMessage());
                        // Fallback to text if image fails
                        $caption = "🔖 <b>Invoice Code:</b> <code>{$order->invoice_code}</code>\n";
                        $caption .= '⏱️ <b>Date:</b> '.$order->created_at->format('H:i:s d/M/Y')."\n";
                        $caption .= '📊 <b>Status:</b> PAID'."\n";
                        $caption .= ' <b>Tax:</b> +$'.number_format($order->tax_amount, 2)."\n";
                        $caption .= '🏷️ <b>Discount:</b> -$'.number_format($order->discount, 2)."\n";
                        $caption .= '💵 <b>Total Price:</b> <b>$'.number_format($order->final_price, 2).' ('.$order->payment_method.")</b>\n";
                        $caption .= '👨‍💼 <b>Cashier:</b> '.($order->cashier->name ?? 'N/A');

                        $telegramService->send($caption);
                    }
                }

                return response()->json(['paid' => true, 'data' => $response]);
            }

            return response()->json(['paid' => false, 'data' => $response]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error checking payment', 'error' => $e->getMessage()], 500);
        }
    }
}
