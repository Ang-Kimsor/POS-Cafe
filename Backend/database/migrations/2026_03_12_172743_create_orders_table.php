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
        Schema::create('orders', function (Blueprint $table) {
            $table->bigIncrements('order_id');
            $table->string('invoice_code', 50);
            $table->string('queue_number')->nullable();
            $table->decimal('total_price', 10, 2);
            $table->decimal('discount', 5, 2)->default(0)->nullable();
            $table->decimal('final_price', 10, 2);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->enum('payment_method', ['cash', 'qr']);
            $table->string('khqr_md5')->nullable();
            $table->enum('status', ['pending', 'paid', 'cancelled']);
            $table->text('remark')->nullable();
            $table->unsignedSmallInteger('cashier_id');
            $table->foreign('cashier_id')->references('user_id')->on('users')
                ->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
