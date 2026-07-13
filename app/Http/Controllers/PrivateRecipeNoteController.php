<?php

namespace App\Http\Controllers;

use App\Models\NewRecipe;
use App\Models\PrivateRecipeNote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PrivateRecipeNoteController extends Controller
{
    public function store(Request $request, NewRecipe $recipe): RedirectResponse
    {
        $validated = $request->validate([
            'note' => ['required', 'string', 'max:10000'],
        ]);

        $recipe->privateNotes()->create([
            'user_id' => $request->user()->id,
            'note' => $validated['note'],
        ]);

        return back(303);
    }

    public function update(Request $request, NewRecipe $recipe, PrivateRecipeNote $note): RedirectResponse
    {
        $this->ensureAuthorized($request, $recipe, $note);

        $validated = $request->validate([
            'note' => ['required', 'string', 'max:10000'],
        ]);

        $note->update([
            'note' => $validated['note'],
        ]);

        return back(303);
    }

    public function destroy(Request $request, NewRecipe $recipe, PrivateRecipeNote $note): RedirectResponse
    {
        $this->ensureAuthorized($request, $recipe, $note);

        $note->delete();

        return back(303);
    }

    private function ensureAuthorized(Request $request, NewRecipe $recipe, PrivateRecipeNote $note): void
    {
        if ((int) $note->new_recipe_id !== (int) $recipe->id || (int) $note->user_id !== (int) $request->user()->id) {
            abort(403);
        }
    }
}
