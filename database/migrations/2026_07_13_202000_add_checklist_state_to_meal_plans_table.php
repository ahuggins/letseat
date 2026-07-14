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
        Schema::table('meal_plans', function (Blueprint $table) {
            $table->json('checked_item_ids')->nullable()->after('week_end');
            $table->json('pantry_item_ids')->nullable()->after('checked_item_ids');
            $table->string('checklist_view_mode', 20)->default('combined')->after('pantry_item_ids');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meal_plans', function (Blueprint $table) {
            $table->dropColumn(['checked_item_ids', 'pantry_item_ids', 'checklist_view_mode']);
        });
    }
};
