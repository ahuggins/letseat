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

        $what = $scraper->filter("//*[@type='application/ld+json']")->reduce(function (Crawler $node): bool {
            $raw = trim($node->text(''));

            if ($raw === '') {
                return false;
            }

            $content = json_decode($raw);

            if (! $content) {
                return false;
            }

            $content = is_object($content) && property_exists($content, '@graph')
                ? $content->{'@graph'}
                : $content;

            if (is_array($content)) {
                foreach ($content as $entry) {
                    if ($this->isRecipeNode($entry)) {
                        return true;
                    }
                }

                return false;
            }

            return $this->isRecipeNode($content);
        });

        if ($what->count() === 0) {
            $pageTitle = '';
            $pageBodyText = '';

            try {
                $pageTitle = trim($scraper->filter('title')->text(''));
            } catch (\Throwable) {
                // Ignore title extraction errors.
            }

            try {
                $pageBodyText = strtolower($scraper->filter('body')->text(''));
            } catch (\Throwable) {
                // Ignore body extraction errors.
            }

            if (
                str_contains(strtolower($pageTitle), 'just a moment')
                || str_contains($pageBodyText, 'enable javascript and cookies to continue')
                || str_contains($pageBodyText, 'cloudflare')
            ) {
                throw new \RuntimeException('This site blocks automated recipe scraping (Cloudflare challenge).');
            }

            throw new \RuntimeException('Could not find recipe schema on this page. The site may block automated access.');
        }

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

    private function isRecipeNode(mixed $node): bool
    {
        if (! is_object($node)) {
            return false;
        }

        if (! property_exists($node, '@type')) {
            return false;
        }

        $type = $node->{'@type'};

        if (is_string($type)) {
            return $type === 'Recipe';
        }

        if (is_array($type)) {
            return in_array('Recipe', $type, true);
        }

        return false;
    }
}
