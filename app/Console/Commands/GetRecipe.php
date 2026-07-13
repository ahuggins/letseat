<?php

namespace App\Console\Commands;

use App\Actions\GetNewRecipe as GetRecipeAction;
use Illuminate\Console\Command;

class GetRecipe extends Command
{
    protected $signature = 'app:get-recipe {url} {userId}';

    protected $description = 'Get Recipe from a given url and save to new_recipes';

    public function handle(GetRecipeAction $action)
    {

        $recipe = $action->execute($this->argument('url'), $this->argument('userId'));

        $this->info("Recipe scraped for: $recipe->url");
    }
}
