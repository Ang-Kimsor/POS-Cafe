<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SalesSummarySheet implements FromCollection, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    protected $orders;

    public function __construct($orders)
    {
        $this->orders = $orders;
    }

    public function collection(): \Illuminate\Support\Collection
    {
        $exportData = [];
        $totalSubtotal = 0;
        $totalDiscount = 0;
        $totalTax = 0;
        $totalFinal = 0;

        foreach ($this->orders as $order) {
            $exportData[] = [
                'Invoice Code' => $order->invoice_code,
                'Cashier' => $order->cashier ? $order->cashier->name : 'Unknown',
                'Date' => $order->created_at->format('H:i:s d/M/Y'),
                'Subtotal' => '$'.number_format($order->total_price, 2),
                'Discount' => '-$'.number_format($order->discount, 2),
                'Tax' => '+$'.number_format($order->tax_amount, 2),
                'Final Amount' => '$'.number_format($order->final_price, 2),
                'Payment Method' => strtoupper($order->payment_method),
                'Status' => strtoupper($order->status),
            ];

            $totalSubtotal += $order->total_price;
            $totalDiscount += $order->discount;
            $totalTax += $order->tax_amount;
            $totalFinal += $order->final_price;
        }

        // Summary row
        $exportData[] = [
            'Invoice Code' => 'SUMMARY TOTAL',
            'Cashier' => '',
            'Date' => '',
            'Subtotal' => '$'.number_format($totalSubtotal, 2),
            'Discount' => '-$'.number_format($totalDiscount, 2),
            'Tax' => '+$'.number_format($totalTax, 2),
            'Final Amount' => '$'.number_format($totalFinal, 2),
            'Payment Method' => '',
            'Status' => '',
        ];

        return collect($exportData);
    }

    public function headings(): array
    {
        return [
            'Invoice Code',
            'Cashier',
            'Date',
            'Subtotal',
            'Discount',
            'Tax',
            'Final Amount',
            'Payment Method',
            'Status',
        ];
    }

    public function styles(Worksheet $sheet): ?array
    {
        $lastRow = $sheet->getHighestRow();

        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['rgb' => '07564d']],
            ],
            $lastRow => [
                'font' => ['bold' => true],
                'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['rgb' => 'dcfce7']],
            ],
        ];
    }

    public function title(): string
    {
        return 'Sales Summary';
    }
}
