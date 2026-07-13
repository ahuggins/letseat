<?php

namespace App\Actions;

use Spatie\QueueableAction\QueueableAction;
use Spekulatius\PHPScraper\PHPScraper as Scraper;
use Symfony\Component\DomCrawler\Crawler;

class GetRecipeDataFromURL
{
    use QueueableAction;

    private $url;

    public function __construct($url)
    {

        $this->url = $url;
    }

    public function execute()
    {
        $scraper = new Scraper;

        $scraper->go($this->url);

        // dd($scraper->go($this->url));

        $what = $scraper->filter("//*[@type='application/ld+json']")->reduce(function (Crawler $node, $i): bool {

            $content = json_decode($node->text());

            $content = property_exists($content, '@graph') ? $content->{'@graph'} : $content;

            if (is_array($content)) {
                return count(array_filter($content, fn ($node) => $node->{'@type'} === 'Recipe')) > 0;
            } else {
                return $content->{'@type'} === 'Recipe';
            }

        });

        // dd($what->text(), 'the recipe');

        $json = $what->text();

        // dd($json);

        $data = $scraper->parseJson($json);

        // dd($data);

        if (array_key_exists('@graph', $data)) {

            $recipeMeta = array_filter($data['@graph'], fn ($node) => $node['@type'] === 'Recipe');
            $recipeMeta = array_pop($recipeMeta);
            // dump($recipeMeta);
            // dd(json_encode($recipeMeta));

            return [
                'url' => $this->url,
                'name' => $recipeMeta['name'],
                'ingredients' => json_encode($recipeMeta['recipeIngredient']),
                'directions' => json_encode($recipeMeta['recipeInstructions']),
                'content' => json_encode($data),
                'nutrition' => array_key_exists('nutrition', $recipeMeta) ? json_encode($recipeMeta['nutrition']) : json_encode(''),
            ];
        }

        // dd($data, 'PASSED @graph');

        // $graph = collect($data['@graph']);

        // $recipe = $graph->first(function ($node) {
        //     return $node['@type'] === 'Recipe';
        // });

        return [
            'url' => $this->url,
            'name' => $data['name'],
            'ingredients' => json_encode($data['recipeIngredient']),
            'directions' => json_encode($data['recipeInstructions']),
            'content' => json_encode($data),
            'nutrition' => array_key_exists('nutrition', $data) ? json_encode($data['nutrition']) : json_encode(''),
        ];
    }
}
