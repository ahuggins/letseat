<?php

namespace App\Console\Commands;

use App\Models\NewRecipe;
use App\Models\Recipe;
use Illuminate\Console\Command;

class RecipeToData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:recipe-to-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Convert Existing recipes, to more data driven';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $recipesQuery = Recipe::query()
            ->without(['user', 'comments', 'comments.commentator'])
            ->whereNotExists(function ($query) {
                $query->selectRaw('1')
                    ->from('new_recipes')
                    ->whereColumn('new_recipes.user_id', 'recipes.user_id')
                    ->where(function ($match) {
                        $match->where(function ($slugMatch) {
                            $slugMatch->whereNotNull('recipes.slug')
                                ->whereColumn('new_recipes.slug', 'recipes.slug');
                        })->orWhere(function ($urlMatch) {
                            $urlMatch->whereNull('recipes.slug')
                                ->whereColumn('new_recipes.url', 'recipes.url');
                        });
                    });
            });

        $toConvert = (clone $recipesQuery)->count();
        $converted = 0;

        $this->info('Recipes to convert: '.$toConvert);

        $recipesQuery->chunkById(250, function ($recipes) use (&$converted) {
            foreach ($recipes as $recipe) {

                // dd();
                $content = null;
                if (is_string($recipe->content)) {
                    $content = json_decode($recipe->content);
                } else {
                    $content = $recipe->content;
                }

                // dump($recipe);
                // dump($content);
                $website = getWebsite($content, $recipe);
                $webpage = getWebPage($content);
                $thumbnail = getThumbnail($content);

                // $cuisine = getCuisine($content);
                // dd($website);
                // dd($recipe);
                NewRecipe::create([
                    'name' => $recipe->name,
                    'url' => $recipe->url,
                    'site_domain' => $website[0],
                    'site_name' => $website[1],
                    'site_link' => $webpage[1],
                    'user_id' => $recipe->user_id,
                    'description' => $webpage[0],
                    'content' => $recipe->content,
                    'image' => $thumbnail[0],
                    'ingredients' => $recipe->ingredients,
                    'directions' => standardDirectionsToArray($recipe->directions),
                    'nutrition' => (array) $recipe->nutrition,
                    'slug' => $recipe->slug,
                    'raw_data' => null,
                    'category' => null,
                    'cuisine' => null,
                    'created_at' => $recipe->created_at,
                    'updated_at' => $recipe->updated_at,
                ]);

                $converted++;

                // dump($newRecipe);
                // $newRecipe->save();

            }
        });

        $this->info('Converted '.$converted.' recipes.');

        // dd($recipes);
    }
}

function standardDirectionsToArray($data)
{
    $formatted = [];

    if (! is_array($data)) {
        $formatted[] = $data;

        return $formatted;
    }

    foreach ($data as $step) {
        $arr = (array) $step;
        if ($arr['@type'] === 'HowToSection') {

            foreach ($arr['itemListElement'] as $steps) {
                $formatted[$arr['name']][] = $steps->text;
            }
        } else {
            $formatted[] = $arr['text'];
        }
    }

    return $formatted;
}

function getWebsite($data, $recipe)
{
    $d = (array) $data;
    $domain = null;
    $site = null;
    if (array_key_exists('@graph', $d)) {
        foreach ($d['@graph'] as $step) {
            $arr = (array) $step;
            // dump($step);
            if ($arr['@type'] === 'WebSite') {

                $domain = $arr['url'];
                $site = $arr['name'];

            }
        }

    } else {

        $site = is_array($d['author']) ? $d['author'][0]->name : $d['author']->name;
        if (array_key_exists('url', $d)) {
            $url = parse_url($d['url']);

        } else {
            $url = parse_url($recipe->url);
        }
        $domain = $url['scheme'].'//'.$url['host'];
    }

    return [$domain, $site];
}

function getWebpage($data)
{
    $description = null;
    $site_link = null;
    $d = (array) $data;
    if (array_key_exists('@graph', $d)) {
        foreach ($d['@graph'] as $step) {
            $arr = (array) $step;
            // dump($step);
            if ($arr['@type'] === 'WebPage' && array_key_exists('description', $arr)) {

                $description = $arr['description'];

            } elseif ($arr['@type'] === 'WebPage' && array_key_exists('description', $arr)) {
                $description = $arr['description'];
            } elseif (is_array($arr['@type']) && in_array('WebPage', $arr['@type']) && array_key_exists('description', $arr)) {

                $description = $arr['description'];

            }

            if ($arr['@type'] === 'WebPage' && array_key_exists('url', $arr)) {
                $site_link = $arr['url'];
            } elseif (array_key_exists('@id', $arr)) {
                $site_link = $arr['@id'];
            }
            $site_link ? dump($site_link) : dump($data);
        }

    } elseif (array_key_exists('description', $d)) {
        $description = $d['description'];
    }

    return [$description, $site_link];
}

function getThumbnail($data)
{
    $thumbnail = null;
    $d = (array) $data;
    if (array_key_exists('@graph', $d)) {
        foreach ($d['@graph'] as $step) {
            $arr = (array) $step;
            // dump($step);
            if ($arr['@type'] === 'Article' && array_key_exists('thumbnailUrl', $arr)) {

                $thumbnail = $arr['thumbnailUrl'];

            }

            if ($arr['@type'] === 'WebPage' && array_key_exists('thumbnailUrl', $arr)) {

                $thumbnail = $arr['thumbnailUrl'];

            }

            if ($arr['@type'] === 'ImageObject' && array_key_exists('url', $arr)) {

                $thumbnail = $arr['url'];

            }

        }

    } elseif (array_key_exists('image', $d)) {
        $image = $d['image'];

        if (is_string($image)) {
            $thumbnail = $image;
        } elseif (is_array($image)) {
            $firstImage = $image[0] ?? null;
            if (is_string($firstImage)) {
                $thumbnail = $firstImage;
            } elseif (is_object($firstImage) && isset($firstImage->url)) {
                $thumbnail = $firstImage->url;
            } elseif (is_array($firstImage) && array_key_exists('url', $firstImage)) {
                $thumbnail = $firstImage['url'];
            }
        } elseif (is_object($image) && isset($image->url)) {
            $thumbnail = $image->url;
        }
    }

    return [$thumbnail];
}

function getCuisine($data)
{
    $cuisine = null;
    $d = (array) $data;
    if (array_key_exists('@graph', $d)) {
        foreach ($d['@graph'] as $step) {
            $arr = (array) $step;
            // dump($step);
            if ($arr['@type'] === 'recipeCuisine') {

                $cuisine = $arr[0];

            }

        }

    }

    return $cuisine;
}
