<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_products', function (Blueprint $table) {
            $table->bigIncrements('order_product_id');
            $table->unsignedBigInteger('order_id');
            $table->foreign('order_id')->references('order_id')->on('orders')
                ->cascadeOnDelete()->cascadeOnUpdate();
            $table->unsignedSmallInteger('product_id');
            $table->foreign('product_id')->references('product_id')->on('products')
                ->restrictOnDelete()->cascadeOnUpdate();
            $table->unsignedTinyInteger('size_id');
            $table->foreign('size_id')->references('size_id')->on('sizes')
                ->restrictOnDelete()->cascadeOnUpdate();
            $table->unsignedSmallInteger('qty')->default(1);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_products');
    }
};
