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

        $data = $dataAction->execute();

        $recipe = new Recipe($data);

        $recipe->user_id = $user_id;

        $recipe->slug = $data['name'];

        $recipe->save();

        return $recipe;
    }
}
