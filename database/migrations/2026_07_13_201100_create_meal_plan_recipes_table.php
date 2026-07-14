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
        Schema::create('meal_plan_recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meal_plan_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('recipe_id');
            $table->string('recipe_name');
            $table->string('recipe_category')->nullable();
            $table->string('cook_time')->nullable();
            $table->json('ingredients')->nullable();
            $table->timestamps();

            $table->index(['meal_plan_id', 'recipe_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_plan_recipes');
    }
};
