<?php

namespace App\Actions;

use Spatie\QueueableAction\QueueableAction;
use Spekulatius\PHPScraper\PHPScraper as Scraper;

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

        $json = $scraper->filter("//*[@type='application/ld+json']")->text();

        $data = $scraper->parseJson($json);

        return [
            'url' => $this->url,
            'name' => $data['@graph'][0]['headline'],
            'ingredients' => json_encode($data['@graph'][6]['recipeIngredient']),
            'directions' => json_encode($data['@graph'][6]['recipeInstructions']),
            'content' => json_encode($data),
            'nutrition' => json_encode($data['@graph'][6]['nutrition']),
        ];
    }
}
