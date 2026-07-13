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
        Schema::create('new_recipes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->string('site_domain');
            $table->string('site_name');
            $table->unsignedInteger('user_id');
            $table->string('description')->nullable()->default(null);
            $table->text('content')->nullable()->default(null);
            $table->string('image')->nullable()->default(null);
            $table->text('ingredients')->nullable()->default(null);
            $table->text('directions')->nullable()->default(null);
            $table->text('nutrition')->nullable()->default(null);
            $table->string('slug')->nullable()->unique();
            $table->text('raw_data')->nullable()->default(null);
            $table->string('category')->nullable()->default(null);
            $table->string('cuisine')->nullable()->default(null);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('new_recipes');
    }
};
