<?php

namespace App\Http\Controllers;

use App\Actions\GetNewRecipe;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

class RecipeController extends Controller
{
    public function create()
    {
        return view('recipe.create');
    }

    public function store(Request $request, GetNewRecipe $action)
    {
        $validated = $request->validate([
            'url' => ['required', 'url', 'max:2000'],
        ]);

        try {
            $recipe = $action->execute((string) $validated['url'], $request->user()->id);
        } catch (Throwable $exception) {
            throw ValidationException::withMessages([
                'url' => $exception->getMessage() ?: 'Unable to import this recipe URL right now.',
            ]);
        }

        return redirect()->route('add-recipe', [
            'imported_recipe_id' => $recipe->id,
        ]);

    }

    public function preview(Request $request)
    {
        $validated = $request->validate([
            'url' => ['required', 'url', 'max:2000'],
        ]);

        try {
            $preview = (new GetNewRecipe)->preview((string) $validated['url']);

            return response()->json([
                'preview' => $preview,
            ]);
        } catch (Throwable $exception) {
            $message = $exception->getMessage() ?: 'We could not preview that URL right now.';

            return response()->json([
                'message' => $message,
            ], 422);
        }
    }
}
