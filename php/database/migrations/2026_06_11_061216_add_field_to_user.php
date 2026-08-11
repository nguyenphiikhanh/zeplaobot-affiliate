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
        Schema::table('users', function (Blueprint $table) {
            //
            $table->string('image')->nullable()->after('email');
            $table->string('role')->default(\App\Utils\RoleUtils::ROLE_USER);
            $table->string('rank')->default(\App\Utils\AppUtils::DEFAULT_USER_RANK);
            $table->unsignedInteger('completed_orders_count')->default(0);
            $table->unsignedInteger('orders_to_next_rank')->default(\App\Utils\AppUtils::DEFAULT_ORDER_TO_NEXT_RANK);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
            $table->dropColumn([
                'image',
                'role',
                'rank',
                'completed_orders_count',
                'orders_to_next_rank'
            ]);
        });
    }
};
