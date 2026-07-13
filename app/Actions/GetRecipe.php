<?php

namespace App\Actions;

use Spatie\QueueableAction\QueueableAction;

class GetRecipe
{
    use QueueableAction;

    public function execute($url, $user_id)
    {
        return (new GetNewRecipe)->execute($url, $user_id);
    }
}
