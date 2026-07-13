<?php

namespace App\Console\Commands;

use App\Actions\GetNewRecipe as GetNewRecipeAction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class GetNewRecipe extends Command
{
    protected $signature = 'app:get-new-recipe
                            {url? : Recipe URL to scrape}
                            {userId? : User ID for ownership}
                            {--refresh : Re-fetch and update existing row for url+user}
                            {--all : Re-fetch and update every existing NewRecipe row}';

    protected $description = 'Get Recipe from a given url and save to new_recipes';

    public function handle(GetNewRecipeAction $action): int
    {
        if ((bool) $this->option('all')) {
            return $this->refreshAllRecipes($action);
        }

        $url = $this->argument('url');
        $userId = $this->argument('userId');

        if (! $url || ! $userId) {
            $this->error('The url and userId arguments are required unless using --all.');

            return self::FAILURE;
        }

        $refresh = (bool) $this->option('refresh');
        $recipe = $action->execute($url, $userId, $refresh);

        if ($refresh) {
            $this->info("NewRecipe refreshed for: $recipe->url");
        } else {
            $this->info("NewRecipe scraped for: $recipe->url");
        }

        return self::SUCCESS;
    }

    private function refreshAllRecipes(GetNewRecipeAction $action): int
    {
        $total = DB::table('new_recipes')->count();
        $updated = 0;
        $failed = 0;

        $this->info('Refreshing '.$total.' recipe URLs...');

        DB::table('new_recipes')
            ->select(['id', 'url', 'user_id'])
            ->orderBy('id')
            ->chunkById(100, function ($recipes) use ($action, &$updated, &$failed) {
                foreach ($recipes as $recipe) {
                    try {
                        $action->execute($recipe->url, $recipe->user_id, true);
                        $updated++;
                    } catch (Throwable $e) {
                        $failed++;
                        $this->error('Failed to refresh '.$recipe->url.': '.$e->getMessage());
                    }
                }
            });

        $this->info('Refresh complete. Updated: '.$updated.'. Failed: '.$failed.'.');

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
