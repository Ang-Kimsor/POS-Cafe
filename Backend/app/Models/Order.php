<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'order_id';

    protected $fillable = [
        'invoice_code',
        'total_price',
        'discount',
        'tax_amount',
        'final_price',
        'payment_method',
        'status',
        'remark',
        'cashier_id',
        'khqr_md5',
        'queue_number',
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id', 'user_id')->withTrashed();
    }

    public function orderProducts()
    {
        return $this->hasMany(OrderProduct::class, 'order_id', 'order_id');
    }
}
