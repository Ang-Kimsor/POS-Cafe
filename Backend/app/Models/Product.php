<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'product_id';

    protected $fillable = ['name', 'description', 'category_id', 'image_url', 'image_id', 'is_active'];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id')->withTrashed();
    }

    public function sizes()
    {
        return $this->belongsToMany(Size::class, 'product_sizes', 'product_id', 'size_id')
            ->withPivot('price', 'deleted_at')
            ->wherePivotNull('deleted_at');
    }
}
