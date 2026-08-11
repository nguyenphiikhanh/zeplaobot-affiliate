<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'spoint_total')) {
                $table->unsignedBigInteger('spoint_total')->default(0)->after('spoint_balance');
            }
        });

        // Initialize spoint_total for existing users
        DB::statement("UPDATE users SET spoint_total = spoint_balance WHERE spoint_total = 0");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'spoint_total')) {
                $table->dropColumn('spoint_total');
            }
        });
    }
};
