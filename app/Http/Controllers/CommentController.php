<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, $model, $id)
    {
        $lookup = ['new-recipe' => 'NewRecipe'];
        $mapped = $lookup[$model] ?? null;
        if (! $mapped) {
            return 'model not found';
        }

        $model = "App\Models\\$mapped";
        $entity = $model::find((int) $id);

        $entity->commentAsUser(auth()->user(), $request->comment);

        return redirect($request->headers->get('referer'));
    }
}
