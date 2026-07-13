<?php

namespace App\Actions;

use App\Models\NewRecipe;
use Spatie\QueueableAction\QueueableAction;

class GetNewRecipe
{
    use QueueableAction;

    public function execute(string $url, int|string $userId): NewRecipe
    {
        $data = (new GetRecipeDataFromURL($url))->execute();

        $content = json_decode($data['content']);
        $ingredients = $this->decodeToArray($data['ingredients']);
        $directions = $this->standardDirectionsToArray(json_decode($data['directions']));
        $nutrition = $this->decodeNutrition($data['nutrition']);

        [$siteDomain, $siteName] = $this->getWebsite($content, $url);
        [$description, $siteLink] = $this->getWebPage($content);
        $image = $this->getThumbnail($content);

        return NewRecipe::firstOrCreate(
            [
                'user_id' => (int) $userId,
                'url' => $data['url'],
            ],
            [
                'name' => $data['name'],
                'site_domain' => $siteDomain,
                'site_name' => $siteName,
                'site_link' => $siteLink,
                'description' => $description,
                'content' => $content,
                'image' => $image,
                'ingredients' => $ingredients,
                'directions' => $directions,
                'nutrition' => $nutrition,
                'slug' => $data['name'],
                'raw_data' => null,
                'category' => null,
                'cuisine' => null,
            ]
        );
    }

    private function decodeToArray(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (! is_string($value) || $value === '') {
            return [];
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function decodeNutrition(mixed $value): array
    {
        if (! is_string($value) || $value === '' || $value === '""') {
            return [];
        }

        $decoded = json_decode($value, true);

        if (! $decoded) {
            return [];
        }

        if (array_is_list($decoded)) {
            return $decoded;
        }

        return [$decoded];
    }

    private function standardDirectionsToArray(mixed $data): array
    {
        if (! is_array($data)) {
            return $data ? [$data] : [];
        }

        $formatted = [];

        foreach ($data as $step) {
            $arr = (array) $step;

            if (($arr['@type'] ?? null) === 'HowToSection') {
                foreach (($arr['itemListElement'] ?? []) as $sectionStep) {
                    if (isset($sectionStep->text)) {
                        $formatted[$arr['name'] ?? 'Steps'][] = $sectionStep->text;
                    }
                }

                continue;
            }

            if (array_key_exists('text', $arr)) {
                $formatted[] = $arr['text'];
            }
        }

        return $formatted;
    }

    private function getWebsite(mixed $data, string $fallbackUrl): array
    {
        $d = (array) $data;
        $domain = null;
        $site = null;

        if (array_key_exists('@graph', $d) && is_array($d['@graph'])) {
            foreach ($d['@graph'] as $node) {
                $arr = (array) $node;
                $nodeType = $arr['@type'] ?? null;

                if ($nodeType === 'WebSite' || (is_array($nodeType) && in_array('WebSite', $nodeType, true))) {
                    $domain = $arr['url'] ?? null;
                    $site = $arr['name'] ?? null;
                    break;
                }
            }
        }

        if (! $site && array_key_exists('author', $d)) {
            $author = $d['author'];
            if (is_array($author) && isset($author[0])) {
                $first = $author[0];
                $site = is_object($first) ? ($first->name ?? null) : ($first['name'] ?? null);
            } elseif (is_object($author)) {
                $site = $author->name ?? null;
            } elseif (is_array($author)) {
                $site = $author['name'] ?? null;
            }
        }

        if (! $domain) {
            $sourceUrl = $d['url'] ?? $fallbackUrl;
            $parsed = parse_url($sourceUrl);
            if (isset($parsed['scheme'], $parsed['host'])) {
                $domain = $parsed['scheme'].'://'.$parsed['host'];
            }
        }

        if (! $site) {
            $parsed = parse_url($fallbackUrl);
            $site = $parsed['host'] ?? 'Unknown';
        }

        return [$domain, $site];
    }

    private function getWebPage(mixed $data): array
    {
        $description = null;
        $siteLink = null;
        $d = (array) $data;

        if (array_key_exists('@graph', $d) && is_array($d['@graph'])) {
            foreach ($d['@graph'] as $node) {
                $arr = (array) $node;
                $nodeType = $arr['@type'] ?? null;
                $isWebPage = $nodeType === 'WebPage' || (is_array($nodeType) && in_array('WebPage', $nodeType, true));

                if ($isWebPage && array_key_exists('description', $arr)) {
                    $description = $arr['description'];
                }

                if ($isWebPage && array_key_exists('url', $arr)) {
                    $siteLink = $arr['url'];
                } elseif (array_key_exists('@id', $arr)) {
                    $siteLink = $arr['@id'];
                }
            }
        } elseif (array_key_exists('description', $d)) {
            $description = $d['description'];
        }

        return [$description, $siteLink];
    }

    private function getThumbnail(mixed $data): ?string
    {
        $d = (array) $data;

        if (array_key_exists('@graph', $d) && is_array($d['@graph'])) {
            foreach ($d['@graph'] as $node) {
                $arr = (array) $node;
                $nodeType = $arr['@type'] ?? null;

                if ($nodeType === 'Article' && array_key_exists('thumbnailUrl', $arr)) {
                    return $arr['thumbnailUrl'];
                }

                if ($nodeType === 'WebPage' && array_key_exists('thumbnailUrl', $arr)) {
                    return $arr['thumbnailUrl'];
                }

                if ($nodeType === 'ImageObject' && array_key_exists('url', $arr)) {
                    return $arr['url'];
                }
            }
        }

        if (! array_key_exists('image', $d)) {
            return null;
        }

        $image = $d['image'];

        if (is_string($image)) {
            return $image;
        }

        if (is_object($image)) {
            return $image->url ?? $image->contentUrl ?? null;
        }

        if (! is_array($image)) {
            return null;
        }

        $firstImage = $image[0] ?? null;

        if (is_string($firstImage)) {
            return $firstImage;
        }

        if (is_object($firstImage)) {
            return $firstImage->url ?? $firstImage->contentUrl ?? null;
        }

        if (is_array($firstImage)) {
            return $firstImage['url'] ?? $firstImage['contentUrl'] ?? null;
        }

        return null;
    }
}
