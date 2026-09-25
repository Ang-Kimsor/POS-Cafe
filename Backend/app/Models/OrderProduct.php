<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderProduct extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'order_product_id';

    protected $fillable = ['order_id', 'product_id', 'qty', 'size_id', 'subtotal'];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id')->withTrashed();
    }

    public function productsize()
    {
        // ProductSize is uniquely identified by (product_id + size_id).
        // We use hasOne on product_id and additionally constrain by size_id
        // so we get the exact ProductSize for this order line item.
        return $this->hasOne(ProductSize::class, 'product_id', 'product_id')
            ->where('size_id', $this->size_id);
    }

    public function size()
    {
        return $this->belongsTo(Size::class, 'size_id', 'size_id')->withTrashed();
    }
}
