<?php

namespace App\Exports;

use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OrderExport implements Export, FromCollection, ShouldAutoSize, WithHeadings, WithStyles
{
    protected $orders;

    public function __construct($orders)
    {
        $this->orders = $orders;
    }

    public function collection(): \Illuminate\Support\Collection
    {
        $exportData = [];

        foreach ($this->orders as $order) {
            $exportData[] = [
                'Invoice Code' => $order->invoice_code,
                'Date' => Carbon::parse($order->created_at)->format('d-M-Y H:i A'),
                'Total Price' => '$'.number_format((float) $order->total_price, 2),
                'Discount' => '$'.number_format((float) $order->discount, 2),
                'Tax' => '$'.number_format((float) ($order->tax_amount ?? 0), 2),
                'Final Price' => '$'.number_format((float) $order->final_price, 2),
                'Payment Method' => strtoupper($order->payment_method),
                'Status' => strtoupper($order->status),
            ];
        }

        return collect($exportData);
    }

    public function headings(): array
    {
        return [
            'Invoice Code',
            'Date',
            'Total Price',
            'Discount',
            'Tax',
            'Final Price',
            'Payment Method',
            'Status',
        ];
    }

    public function styles(Worksheet $sheet): ?array
    {
        return [
            // Style the first row as bold text.
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['rgb' => '07564d']],
            ],
        ];
    }
}
