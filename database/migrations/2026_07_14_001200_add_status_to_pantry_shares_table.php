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
        Schema::table('pantry_shares', function (Blueprint $table) {
            $table->string('status')->default('accepted')->after('viewer_user_id');
            $table->timestamp('accepted_at')->nullable()->after('status');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pantry_shares', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn(['status', 'accepted_at']);
        });
    }
};
