<?php

use App\Models\PrivateNoteShare;
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
        Schema::table('private_note_shares', function (Blueprint $table) {
            $table->string('status', 20)
                ->default(PrivateNoteShare::STATUS_PENDING)
                ->after('viewer_user_id');
            $table->timestamp('accepted_at')->nullable()->after('status');
        });

        DB::table('private_note_shares')->update([
            'status' => PrivateNoteShare::STATUS_ACCEPTED,
            'accepted_at' => DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('private_note_shares', function (Blueprint $table) {
            $table->dropColumn(['status', 'accepted_at']);
        });
    }
};
