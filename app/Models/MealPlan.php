<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MealPlan extends Model
{
    protected $guarded = [];

    protected $casts = [
        'week_start' => 'date',
        'week_end' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recipes()
    {
        return $this->hasMany(MealPlanRecipe::class);
    }
}
