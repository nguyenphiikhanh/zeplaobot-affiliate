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
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('wallet_id');
            $table->bigInteger('amount');
            $table->string('type'); //'commission' | 'withdrawal'
            $table->string('status')->default(\App\Utils\AppUtils::WALLET_TRANSACTION_STATUS['pending']);
            $table->string('reference_id')->nullable();
            $table->text('description')->nullable();
            $table->text('qr_code_url')->nullable();
            $table->text('reject_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
