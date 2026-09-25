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
        Schema::create('product_sizes', function (Blueprint $table) {
            $table->increments('product_size_id');
            $table->unsignedSmallInteger('product_id');
            $table->foreign('product_id')->references('product_id')->on('products')
                ->cascadeOnUpdate()->restrictOnDelete();
            $table->unsignedTinyInteger('size_id');
            $table->foreign('size_id')->references('size_id')->on('sizes')
                ->cascadeOnUpdate()->restrictOnDelete();
            $table->decimal('price', 10, 2);
            $table->timestamps();
            $table->unique(['product_id', 'size_id']);
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_sizes');
    }
};
