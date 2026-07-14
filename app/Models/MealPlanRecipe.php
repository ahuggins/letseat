<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MealPlanRecipe extends Model
{
    protected $guarded = [];

    protected $casts = [
        'ingredients' => 'array',
    ];

    public function mealPlan()
    {
        return $this->belongsTo(MealPlan::class);
    }
}
