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
        Schema::table('new_recipes', function (Blueprint $table) {
            $table->text('name')->change();
            $table->text('url')->change();
            $table->text('site_domain')->change();
            $table->text('site_name')->change();
            $table->longText('description')->nullable()->change();

            $table->longText('content')->nullable()->change();
            $table->longText('ingredients')->nullable()->change();
            $table->longText('directions')->nullable()->change();
            $table->longText('nutrition')->nullable()->change();
            $table->longText('raw_data')->nullable()->change();

            $table->longText('image')->nullable()->change();
            $table->text('category')->nullable()->change();
            $table->text('cuisine')->nullable()->change();
            $table->longText('site_link')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('new_recipes', function (Blueprint $table) {
            $table->string('name')->change();
            $table->string('url')->change();
            $table->string('site_domain')->change();
            $table->string('site_name')->change();
            $table->string('description')->nullable()->change();

            $table->text('content')->nullable()->change();
            $table->text('ingredients')->nullable()->change();
            $table->text('directions')->nullable()->change();
            $table->text('nutrition')->nullable()->change();
            $table->text('raw_data')->nullable()->change();

            $table->string('image')->nullable()->change();
            $table->string('category')->nullable()->change();
            $table->string('cuisine')->nullable()->change();
            $table->string('site_link')->nullable()->change();
        });
    }
};
