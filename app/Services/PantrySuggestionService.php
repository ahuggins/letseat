<?php

namespace App\Services;

use App\Models\NewRecipe;
use Illuminate\Support\Collection;

class PantrySuggestionService
{
    public function buildSuggestions(
        string $selectedCategory,
        string $selectedCuisine,
        Collection $normalizedPantryItems,
        Collection $normalizedManualPantryItems,
        Collection $currentMealPlanRecipeIds,
        callable $normalizeTerm
    ): Collection {
        if ($normalizedPantryItems->isEmpty()) {
            return collect();
        }

        $hasManualPantryInput = $normalizedManualPantryItems->isNotEmpty();

        $recipeQuery = NewRecipe::query();

        if ($hasManualPantryInput) {
            $recipeQuery->where(function ($builder) use ($normalizedManualPantryItems) {
                foreach ($normalizedManualPantryItems as $manualItem) {
                    $builder->orWhereRaw('lower(ingredients) like ?', ['%'.$manualItem.'%']);
                }
            });
        }

        if ($selectedCategory !== '') {
            $recipeQuery->where('category', $selectedCategory);
        }

        if ($selectedCuisine !== '') {
            $recipeQuery->where('cuisine', $selectedCuisine);
        }

        return $recipeQuery
            ->orderByDesc('created_at')
            ->limit(350)
            ->get()
            ->map(function (NewRecipe $recipe) use (
                $normalizeTerm,
                $normalizedPantryItems,
                $normalizedManualPantryItems,
                $currentMealPlanRecipeIds
            ) {
                $ingredients = collect(is_array($recipe->ingredients) ? $recipe->ingredients : [])
                    ->map(fn ($item) => trim(html_entity_decode((string) $item, ENT_QUOTES | ENT_HTML5, 'UTF-8')))
                    ->filter()
                    ->values();

                $normalizedIngredients = $ingredients
                    ->map(fn ($item) => $normalizeTerm($item))
                    ->filter()
                    ->values();

                $ingredientMatchMetadata = $normalizedIngredients
                    ->map(function ($normalizedIngredient) use ($normalizedManualPantryItems, $normalizedPantryItems) {
                        if ($normalizedIngredient === '') {
                            return [
                                'matches_any' => false,
                                'matches_manual' => false,
                            ];
                        }

                        $matchesAny = false;
                        foreach ($normalizedPantryItems as $pantryItem) {
                            if (
                                str_contains($normalizedIngredient, $pantryItem)
                                || str_contains((string) $pantryItem, $normalizedIngredient)
                            ) {
                                $matchesAny = true;
                                break;
                            }
                        }

                        $matchesManual = false;
                        foreach ($normalizedManualPantryItems as $manualItem) {
                            if (
                                str_contains($normalizedIngredient, $manualItem)
                                || str_contains((string) $manualItem, $normalizedIngredient)
                            ) {
                                $matchesManual = true;
                                break;
                            }
                        }

                        return [
                            'matches_any' => $matchesAny,
                            'matches_manual' => $matchesManual,
                        ];
                    })
                    ->values();

                $matchedIngredients = $ingredients
                    ->filter(function ($ingredient, $index) use ($ingredientMatchMetadata) {
                        $metadata = $ingredientMatchMetadata->get($index);

                        return (bool) ($metadata['matches_any'] ?? false);
                    })
                    ->values();

                $missingIngredients = $ingredients
                    ->filter(function ($ingredient, $index) use ($ingredientMatchMetadata) {
                        $metadata = $ingredientMatchMetadata->get($index);

                        return ! (bool) ($metadata['matches_any'] ?? false);
                    })
                    ->values();

                $totalIngredients = $ingredients->count();
                $matchedCount = $matchedIngredients->count();
                $missingCount = max($totalIngredients - $matchedCount, 0);

                $manualMatchedCount = $ingredientMatchMetadata
                    ->filter(fn ($metadata) => (bool) ($metadata['matches_manual'] ?? false))
                    ->count();

                $score = $totalIngredients > 0 ? $matchedCount / $totalIngredients : 0;

                return [
                    'id' => $recipe->id,
                    'slug' => $recipe->slug,
                    'name' => html_entity_decode($recipe->name, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
                    'category' => $recipe->category ?: 'Uncategorized',
                    'image' => $recipe->image,
                    'description' => $recipe->description,
                    'matched_count' => $matchedCount,
                    'manual_matched_count' => $manualMatchedCount,
                    'total_ingredients' => $totalIngredients,
                    'missing_count' => $missingCount,
                    'match_percent' => (int) round($score * 100),
                    'matched_ingredients' => $matchedIngredients->take(4)->values(),
                    'missing_ingredients' => $missingIngredients->take(6)->values(),
                    'in_current_meal_plan' => $currentMealPlanRecipeIds->contains((int) $recipe->id),
                    'score' => $score,
                ];
            })
            ->filter(function ($item) use ($hasManualPantryInput) {
                if ($hasManualPantryInput) {
                    return ((int) ($item['manual_matched_count'] ?? 0)) > 0;
                }

                return ((int) ($item['matched_count'] ?? 0)) > 0;
            })
            ->sortBy([
                ['match_percent', 'desc'],
                ['score', 'desc'],
                ['manual_matched_count', 'desc'],
                ['matched_count', 'desc'],
                ['total_ingredients', 'asc'],
            ])
            ->take(30)
            ->values()
            ->map(function ($item) {
                unset($item['score'], $item['manual_matched_count']);

                return $item;
            });
    }
}
