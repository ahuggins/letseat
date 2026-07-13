<?php

namespace App\Console\Commands;

use App\Actions\GetNewRecipe as GetNewRecipeAction;
use Illuminate\Console\Command;

class GetNewRecipe extends Command
{
    protected $signature = 'app:get-new-recipe {url} {userId}';

    protected $description = 'Get Recipe from a given url and save to new_recipes';

    public function handle(GetNewRecipeAction $action): void
    {
        $recipe = $action->execute($this->argument('url'), $this->argument('userId'));

        $this->info("NewRecipe scraped for: $recipe->url");
    }
}
