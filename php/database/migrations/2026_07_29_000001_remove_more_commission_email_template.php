<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('email_templates')
            ->where('key', 'more_commission')
            ->delete();
    }

    public function down(): void
    {
        // The retired template is intentionally not recreated on rollback.
    }
};
