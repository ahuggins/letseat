<?php

namespace App\Console\Commands;

use App\Models\Recipe;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class BatchRecipeSlug extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:batch-recipe-slug';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create Slugs for any/all recipes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $recipes = Recipe::where('slug', null)->get();

        $recipes->each(function ($recipe, int $key) {
            $recipe->slug = Str::slug($recipe->name);
            $recipe->save();
        });

    }
}
