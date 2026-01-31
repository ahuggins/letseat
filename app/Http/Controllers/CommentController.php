<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, $model, $id)
    {
        $model = ucfirst($model);
        $model = "App\Models\\$model";
        $entity = $model::find((int) $id);

        // dd($request);

        $entity->commentAsUser(auth()->user(), $request->comment);
        // dd($entity, $request);

        return redirect($request->headers->get('referer'));
    }
}
