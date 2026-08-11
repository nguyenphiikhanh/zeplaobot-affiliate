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
            if (!Schema::hasColumn('users', 'spoint_balance')) {
                $table->unsignedBigInteger('spoint_balance')->default(0)->after('email');
            }
            if (!Schema::hasColumn('users', 'spoint_streak')) {
                $table->unsignedInteger('spoint_streak')->default(0)->after('spoint_balance');
            }
            if (!Schema::hasColumn('users', 'last_checkin_at')) {
                $table->timestamp('last_checkin_at')->nullable()->after('spoint_streak');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['spoint_balance', 'spoint_streak', 'last_checkin_at']);
        });
    }
};
