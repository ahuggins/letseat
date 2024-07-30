<?php

namespace App\Actions;

use App\Models\Recipe;
use Spatie\QueueableAction\QueueableAction;

class GetRecipe
{
    use QueueableAction;

    public function execute($url, $user_id)
    {
        $dataAction = new GetRecipeDataFromURL($url);

        $recipe = new Recipe($dataAction->execute());

        $recipe->user_id = $user_id;

        $recipe->save();

        return $recipe;
    }
}
