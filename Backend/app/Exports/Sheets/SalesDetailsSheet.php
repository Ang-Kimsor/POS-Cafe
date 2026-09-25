<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SalesDetailsSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    protected $orders;

    public function __construct($orders)
    {
        $this->orders = $orders;
    }

    public function collection(): \Illuminate\Support\Collection
    {
        $exportData = [];
        $totalQty = 0;
        $totalSubtotal = 0;

        foreach ($this->orders as $order) {
            foreach ($order->orderProducts as $item) {
                $exportData[] = [
                    'Invoice Code' => $order->invoice_code,
                    'Date' => $order->created_at->format('H:i:s d/M/Y'),
                    'Product Name' => $item->product ? $item->product->name . ($item->product->trashed() ? ' (Deleted)' : (!$item->product->is_active ? ' (Inactive)' : '')) : 'Deleted Product',
                    'Size' => $item->size ? $item->size->size . ($item->size->trashed() ? ' (Deleted)' : (!$item->size->is_active ? ' (Inactive)' : '')) : 'N/A',
                    'Qty' => (int) $item->qty,
                    'Unit Price' => '$'.number_format($item->subtotal / $item->qty, 2),
                    'Subtotal' => '$'.number_format($item->subtotal, 2),
                    'Cashier' => $order->cashier ? $order->cashier->name : 'Unknown',
                ];

                $totalQty += $item->qty;
                $totalSubtotal += $item->subtotal;
            }
        }

        // Summary row
        $exportData[] = [
            'Invoice Code' => 'SUMMARY TOTAL',
            'Date' => '',
            'Product Name' => '',
            'Size' => '',
            'Qty' => $totalQty,
            'Unit Price' => '',
            'Subtotal' => '$'.number_format($totalSubtotal, 2),
            'Cashier' => '',
        ];

        return collect($exportData);
    }

    public function headings(): array
    {
        return [
            'Invoice Code',
            'Date',
            'Product Name',
            'Size',
            'Qty',
            'Unit Price',
            'Subtotal',
            'Cashier',
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
        return 'Sales Details';
    }
}
