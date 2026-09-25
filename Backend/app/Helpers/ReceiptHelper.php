<?php

namespace App\Helpers;

class ReceiptHelper
{
    public static function generate($order, $settings)
    {
        $width = 400;
        $padding = 30;

        $items = $order->orderProducts;
        $itemCount = count($items);
        $height = 850 + ($itemCount * 60);

        $img = imagecreatetruecolor($width, $height);
        $white = imagecolorallocate($img, 255, 255, 255);
        $black = imagecolorallocate($img, 0, 0, 0);
        $gray = imagecolorallocate($img, 150, 150, 150);
        $lightGray = imagecolorallocate($img, 242, 242, 242);
        $emerald = imagecolorallocate($img, 8, 116, 103);

        imagefill($img, 0, 0, $white);

        $y = 40;

        // Header & Logo
        $logoPath = public_path('logo.jpg');
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logo = imagecreatefromstring($logoData);
            if ($logo) {
                $logoW = imagesx($logo);
                $logoH = imagesy($logo);
                $targetW = 80;
                $targetH = ($logoH / $logoW) * $targetW;
                imagecopyresampled($img, $logo, ($width - $targetW) / 2, $y, 0, 0, $targetW, $targetH, $logoW, $logoH);
                $y += $targetH + 15;
                imagedestroy($logo);
            }
        }

        $shopName = $settings->get('shop_name') ?? 'Cafe Name';
        $font = 5;
        $textWidth = strlen($shopName) * imagefontwidth($font);
        imagestring($img, $font, ($width - $textWidth) / 2, $y, strtoupper($shopName), $black);
        imagestring($img, $font, (($width - $textWidth) / 2) + 1, $y, strtoupper($shopName), $black); // Bold effect
        $y += 60;

        // Queue Number
        imagefilledrectangle($img, $padding, $y, $width - $padding, $y + 110, $lightGray);
        $y += 35;

        $font = 2;
        $label = 'WAITING NUMBER';
        $textWidth = strlen($label) * imagefontwidth($font);
        imagestring($img, $font, ($width - $textWidth) / 2, $y - 10, $label, $gray);

        $font = 5;
        $qNum = $order->queue_number ?? '000';
        $textWidth = strlen($qNum) * imagefontwidth($font);
        imagestring($img, $font, ($width - $textWidth) / 2, $y + 15, $qNum, $black);

        $font = 3;
        $status = strtoupper($order->status);
        $textWidth = strlen($status) * imagefontwidth($font);
        imagestring($img, $font, ($width - $textWidth) / 2, $y + 45, $status, $emerald);
        $y += 110;

        // Receipt Info
        $font = 2;
        imagestring($img, $font, $padding, $y, 'RECEIPT ID', $gray);
        $label = 'DATE';
        imagestring($img, $font, $width - $padding - (strlen($label) * imagefontwidth($font)), $y, $label, $gray);
        $y += 18;

        $font = 3;
        imagestring($img, $font, $padding, $y, $order->invoice_code, $black);
        $dateStr = $order->created_at->format('H:i:s d/M/Y');
        imagestring($img, $font, $width - $padding - (strlen($dateStr) * imagefontwidth($font)), $y, $dateStr, $black);
        $y += 35;

        $font = 2;
        imagestring($img, $font, $padding, $y, 'CASHIER', $gray);
        $y += 18;
        $font = 3;
        imagestring($img, $font, $padding, $y, strtoupper($order->cashier->name ?? 'N/A'), $black);
        $y += 50;

        // Table Header
        imageline($img, $padding, $y, $width - $padding, $y, $black);
        $y += 15;
        imagestring($img, 3, $padding, $y, 'DESCRIPTION', $black);
        $label = 'TOTAL';
        imagestring($img, $font, $width - $padding - (strlen($label) * imagefontwidth($font)), $y, $label, $black);
        $y += 20;
        imageline($img, $padding, $y, $width - $padding, $y, $black);
        $y += 25;

        // Order Items
        foreach ($items as $item) {
            $name = $item->product->name;
            if (strlen($name) > 25) {
                $name = substr($name, 0, 22).'...';
            }

            $font = 4;
            imagestring($img, $font, $padding, $y, strtoupper($name), $black);
            $totalPrice = '$'.number_format($item->subtotal, 2);
            imagestring($img, $font, $width - $padding - (strlen($totalPrice) * imagefontwidth($font)), $y, $totalPrice, $black);
            $y += 18;

            $font = 2;
            $detail = ($item->size->size ?? 'N/A').' SIZE | '.$item->qty.' x $'.number_format($item->subtotal / $item->qty, 2);
            imagestring($img, $font, $padding, $y, strtoupper($detail), $gray);
            $y += 35;
        }

        // Remark Section
        if ($order->remark) {
            imagefilledrectangle($img, $padding, $y, $width - $padding, $y + 45, $lightGray);
            imagestring($img, 2, $padding + 10, $y + 5, 'REMARK', $gray);
            $remark = $order->remark;
            if (strlen($remark) > 40) {
                $remark = substr($remark, 0, 37).'...';
            }
            imagestring($img, 3, $padding + 10, $y + 22, strtoupper($remark), $black);
            $y += 65;
        }

        // Totals Section
        imageline($img, $padding, $y, $width - $padding, $y, $gray);
        $y += 20;

        $subtotal = $order->total_price;
        $discount = $order->discount ?? 0;
        $tax = $order->tax_amount ?? 0;
        $taxPercent = $settings->get('tax_percent') ?? 10;
        $total = $order->final_price;

        $font = 3;
        imagestring($img, $font, $padding, $y, 'Subtotal', $gray);
        $val = '$'.number_format($subtotal, 2);
        imagestring($img, $font, $width - $padding - (strlen($val) * imagefontwidth($font)), $y, $val, $black);
        $y += 25;

        if ($tax > 0) {
            imagestring($img, $font, $padding, $y, "Tax ({$taxPercent}%)", $gray);
            $val = '$'.number_format($tax, 2);
            imagestring($img, $font, $width - $padding - (strlen($val) * imagefontwidth($font)), $y, $val, $gray);
            $y += 25;
        }

        if ($discount > 0) {
            imagestring($img, $font, $padding, $y, 'Discount', $gray);
            $val = '-$'.number_format($discount, 2);
            imagestring($img, $font, $width - $padding - (strlen($val) * imagefontwidth($font)), $y, $val, $gray);
            $y += 25;
        }

        $y += 15;
        imageline($img, $padding, $y, $width - $padding, $y, $black);
        $y += 25;

        // Amount Paid
        $font = 5;
        imagestring($img, $font, $padding, $y, 'AMOUNT PAID', $black);
        $val = '$'.number_format($total, 2);
        imagestring($img, $font, $width - $padding - (strlen($val) * imagefontwidth($font)), $y, $val, $black);

        $rielVal = number_format(round(($total * 4000) / 100) * 100).' KHR';
        $y += 20;
        imagestring($img, 5, $width - $padding - (strlen($rielVal) * imagefontwidth(5)), $y, $rielVal, $gray);

        if ($order->payment_method) {
            $font = 2;
            $method = 'VIA '.strtoupper($order->payment_method);
            imagestring($img, $font, $padding, $y, $method, $gray);
        }
        $y += 80;

        // Footer
        $font = 3;
        $footer1 = 'THANK YOU';
        $textWidth = strlen($footer1) * imagefontwidth($font);
        imagestring($img, $font, ($width - $textWidth) / 2, $y, $footer1, $black);
        $y += 20;

        $footer2 = 'ORDER #'.substr($order->invoice_code, -3);
        $textWidth = strlen($footer2) * imagefontwidth(2);
        imagestring($img, 2, ($width - $textWidth) / 2, $y, $footer2, $gray);
        $y += 20;

        $footer3 = 'WIFI: '.$settings->get('wifi_name', 'N/A');
        $textWidth = strlen($footer3) * imagefontwidth(2);
        imagestring($img, 2, ($width - $textWidth) / 2, $y, $footer3, $gray);
        $y += 20;

        $footer4 = 'PASSWORD: '.$settings->get('wifi_password', 'N/A');
        $textWidth = strlen($footer4) * imagefontwidth(2);
        imagestring($img, 2, ($width - $textWidth) / 2, $y, $footer4, $gray);

        $path = storage_path('app/temp_receipt_'.$order->order_id.'.png');
        imagepng($img, $path);
        imagedestroy($img);

        return $path;
    }
}
