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
        Schema::create('products', function (Blueprint $table) {
            $table->smallIncrements('product_id');
            $table->string('name', 100);
            $table->boolean('is_active')->default(true);
            $table->string('image_url')->nullable();
            $table->string('image_id')->nullable();
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('category_id');
            $table->foreign('category_id')->references('category_id')
                ->on('categories')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
