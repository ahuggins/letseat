<?php

namespace App\Http\Controllers;

use App\Actions\GetRecipe;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function create()
    {
        return view('recipe.create');
    }

    public function store(Request $request, GetRecipe $action)
    {

        $recipe = $action->execute($request->input('url'), auth()->user()->id);

    }
}
