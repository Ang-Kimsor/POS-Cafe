<?php

namespace App\Exports;

use App\Exports\Sheets\SalesDetailsSheet;
use App\Exports\Sheets\SalesSummarySheet;
use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class SalesReportExport implements Export, WithMultipleSheets
{
    protected $request;

    protected $orders;

    public function __construct($request, $orders)
    {
        $this->request = $request;
        $this->orders = $orders;
    }

    public function sheets(): array
    {
        return [
            new SalesSummarySheet($this->orders),
            new SalesDetailsSheet($this->orders),
        ];
    }
}
