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
            $table->id();
            $table->string('order_id');
            $table->string('order_status')->nullable();

            $table->timestamp('order_time')->nullable();
            $table->timestamp('complete_time')->nullable();
            $table->timestamp('click_time')->nullable();

            $table->string('shop_name')->nullable();

            $table->unsignedBigInteger('product_id')->nullable();
            $table->text('product_name')->nullable();

            $table->integer('quantity')->default(0);
            $table->string('currency')->nullable()->default("VND");

            $table->bigInteger('purchase_value')->nullable();

            $table->bigInteger('actual_commission')->nullable(); // Actual commission

            $table->string('sub_id')->nullable();
            $table->string('sub1')->nullable();
            $table->string('user_rank')->nullable(); // User rank in buy present, may be used for calculating commission
            $table->integer('commission_rate')->nullable()->default(0); // Rate Commission for User (Ví dụ: 700 = 70%)
            $table->bigInteger('user_commission')->nullable()->default(0); // User commission for this order

            $table->boolean('is_paid')->default(false);
            $table->timestamps();
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
