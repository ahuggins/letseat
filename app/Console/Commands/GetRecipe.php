<?php

namespace App\Console\Commands;

use App\Actions\GetRecipe as GetRecipeAction;
use Illuminate\Console\Command;

class GetRecipe extends Command
{
    protected $signature = 'app:get-recipe {url} {userId}';

    protected $description = 'Get Recipe from a given url';

    public function handle(GetRecipeAction $action)
    {

        $recipe = $action->execute($this->argument('url'), $this->argument('userId'));

        $this->info("Recipe scraped for: $recipe->url");
    }
}
