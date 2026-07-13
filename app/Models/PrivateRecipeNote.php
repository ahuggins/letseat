<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrivateRecipeNote extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recipe()
    {
        return $this->belongsTo(NewRecipe::class, 'new_recipe_id');
    }
}
