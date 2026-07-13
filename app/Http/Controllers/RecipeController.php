<?php

namespace App\Http\Controllers;

use App\Actions\GetNewRecipe;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function create()
    {
        return view('recipe.create');
    }

    public function store(Request $request, GetNewRecipe $action)
    {

        $recipe = $action->execute($request->input('url'), $request->user()->id);

        return redirect('/recipes');

    }
}
