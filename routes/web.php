<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\ExtensionTokenController;
use App\Http\Controllers\PrivateRecipeNoteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use App\Models\MealPlan;
use App\Models\NewRecipe;
use App\Models\PantryStaple;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('recipes');
});

Route::view('/privacy-policy', 'privacy-policy')->name('privacy-policy');

$renderRecipeIndex = function (Request $request, bool $favoritesOnly = false, bool $madesOnly = false) {
    $user = $request->query('user');
    $query = trim((string) $request->query('q', ''));
    $category = trim((string) $request->query('category', 'All'));
    $cuisine = trim((string) $request->query('cuisine', 'All'));
    $viewerId = (int) $request->user()->id;

    $baseQuery = NewRecipe::query()
        ->withExists([
            'favoritedBy as is_favorited' => fn ($builder) => $builder->where('users.id', $viewerId),
            'madeBy as is_made' => fn ($builder) => $builder->where('users.id', $viewerId),
        ]);

    if ($favoritesOnly) {
        $baseQuery->whereHas('favoritedBy', fn ($builder) => $builder->where('users.id', $viewerId));
    }

    if ($madesOnly) {
        $baseQuery->whereHas('madeBy', fn ($builder) => $builder->where('users.id', $viewerId));
    }

    if ($user) {
        $baseQuery->where('user_id', (int) $user);
    }

    $recipesQuery = clone $baseQuery;

    if ($query !== '') {
        $recipesQuery->where(function ($builder) use ($query) {
            $builder
                ->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->orWhere('ingredients', 'like', "%{$query}%")
                ->orWhere('category', 'like', "%{$query}%")
                ->orWhere('cuisine', 'like', "%{$query}%");
        });
    }

    if ($category !== '' && strcasecmp($category, 'All') !== 0) {
        $recipesQuery->where('category', 'like', $category.'%');
    }

    if ($cuisine !== '' && strcasecmp($cuisine, 'All') !== 0) {
        $recipesQuery->where('cuisine', 'like', $cuisine.'%');
    }

    $recipes = $recipesQuery
        ->orderBy('created_at', 'desc')
        ->paginate()
        ->withQueryString();

    $categories = (clone $baseQuery)
        ->pluck('category')
        ->map(function ($value) {
            return trim(explode(',', (string) $value)[0] ?? '');
        })
        ->filter()
        ->unique()
        ->sort()
        ->values();

    $cuisines = (clone $baseQuery)
        ->pluck('cuisine')
        ->map(function ($value) {
            return trim(explode(',', (string) $value)[0] ?? '');
        })
        ->filter()
        ->unique()
        ->sort()
        ->values();

    return Inertia::render('Recipes', [
        'recipes' => $recipes,
        'categories' => $categories,
        'cuisines' => $cuisines,
        'filters' => [
            'q' => $query,
            'category' => $category !== '' ? $category : 'All',
            'cuisine' => $cuisine !== '' ? $cuisine : 'All',
            'user' => $user,
        ],
        'pageTitle' => $madesOnly
            ? 'My Makes'
            : ($favoritesOnly ? 'My Favorites' : 'Recipes'),
        'emptyMessage' => $madesOnly
            ? 'No made recipes yet. Tap Made this on any recipe to track it here.'
            : ($favoritesOnly
                ? 'No favorites yet. Tap the heart on any recipe to save it here.'
                : 'No recipes matched your filters.'),
    ]);
};

Route::get('/recipes', fn (Request $request) => $renderRecipeIndex($request))
    ->middleware(['auth', 'verified'])
    ->name('recipes');

Route::get('/my-favorites', fn (Request $request) => $renderRecipeIndex($request, true))
    ->middleware(['auth', 'verified'])
    ->name('favorites');

Route::get('/my-makes', fn (Request $request) => $renderRecipeIndex($request, false, true))
    ->middleware(['auth', 'verified'])
    ->name('makes');

Route::get('/recipe/{recipe:slug}', function (Request $request, NewRecipe $recipe) {
    $privateNotes = $recipe->privateNotes()
        ->where('user_id', $request->user()->id)
        ->orderBy('created_at')
        ->get();

    $isSharingNotes = $request->user()->noteSharesGiven()->exists();

    $sharedOwnerIds = $request->user()
        ->noteSharesReceived()
        ->pluck('owner_user_id');

    $sharedNotes = $recipe->privateNotes()
        ->with('user:id,name,email')
        ->whereIn('user_id', $sharedOwnerIds)
        ->orderBy('created_at')
        ->get();

    return Inertia::render('Recipe', [
        'recipe' => $recipe,
        'privateNotes' => $privateNotes,
        'sharedNotes' => $sharedNotes,
        'isSharingNotes' => $isSharingNotes,
    ]);
})->middleware(['auth', 'verified'])->name('recipe');

Route::get('/search', function (Request $request) {
    $recipes = NewRecipe::search($request->query('q'))->options([
        'query_by' => 'name,ingredients,category',
    ])->paginate();

    return Inertia::render('Search', ['recipes' => ['data' => $recipes]]);
})->middleware(['auth', 'verified'])->name('search');

Route::get('/add-recipe', function (Request $request) {
    $importedRecipeId = (int) $request->query('imported_recipe_id', 0);

    $importedRecipe = null;

    if ($importedRecipeId > 0) {
        $recipe = NewRecipe::query()->find($importedRecipeId);

        if ($recipe) {
            $ingredientCount = is_array($recipe->ingredients)
                ? count($recipe->ingredients)
                : 0;

            $importedRecipe = [
                'id' => $recipe->id,
                'slug' => $recipe->slug,
                'name' => html_entity_decode($recipe->name, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
                'site_name' => $recipe->site_name,
                'site_domain' => $recipe->site_domain,
                'image' => $recipe->image,
                'category' => $recipe->category,
                'cuisine' => $recipe->cuisine,
                'ingredient_count' => $ingredientCount,
                'cook_time' => $recipe->planningCookTimeLabel(),
            ];
        }
    }

    return Inertia::render('AddRecipe', [
        'importedRecipe' => $importedRecipe,
    ]);
})->middleware(['auth', 'verified'])->name('add-recipe');

Route::get('/meal-planning', function (Request $request) {
    $query = trim((string) $request->query('q', ''));

    $recipes = NewRecipe::query()
        ->when($query !== '', function ($builder) use ($query) {
            $builder->where(function ($queryBuilder) use ($query) {
                $queryBuilder
                    ->where('name', 'like', "%{$query}%")
                    ->orWhere('category', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhere('ingredients', 'like', "%{$query}%");
            });
        })
        ->orderByDesc('created_at')
        ->limit(60)
        ->get()
        ->map(function (NewRecipe $recipe) {
            $ingredients = is_array($recipe->ingredients)
                ? $recipe->ingredients
                : [];

            return [
                'id' => $recipe->id,
                'name' => html_entity_decode($recipe->name, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
                'category' => $recipe->category ?: 'Uncategorized',
                'cook_time' => $recipe->planningCookTimeLabel(),
                'image' => $recipe->image,
                'description' => $recipe->description,
                'ingredients' => $ingredients,
            ];
        })
        ->values();

    $savedPlans = MealPlan::query()
        ->where('user_id', $request->user()->id)
        ->withCount('recipes')
        ->latest()
        ->limit(12)
        ->get()
        ->map(function (MealPlan $plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'week_start' => $plan->week_start?->toDateString(),
                'week_end' => $plan->week_end?->toDateString(),
                'recipes_count' => $plan->recipes_count,
                'created_at' => $plan->created_at,
            ];
        })
        ->values();

    return Inertia::render('MealPlanning', [
        'recipes' => $recipes,
        'filters' => [
            'q' => $query,
        ],
        'savedPlans' => $savedPlans,
    ]);
})->middleware(['auth', 'verified'])->name('meal-planning');

$renderPantryAssistantPage = function (Request $request, string $pantryInput = '') {
    $selectedCategory = trim((string) $request->query('category', ''));
    $selectedCuisine = trim((string) $request->query('cuisine', ''));

    $normalizeTerm = function (string $value): string {
        $value = strtolower($value);
        $value = preg_replace('/\([^)]*\)/', ' ', $value) ?? $value;
        $value = preg_replace('/^\s*\d+[\d\s\/\.-]*/', ' ', $value) ?? $value;
        $value = preg_replace('/\b(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|gram|grams|kg|ml|l|clove|cloves|slice|slices|can|cans|package|packages|pinch|bunch)\b/', ' ', $value) ?? $value;
        $value = preg_replace('/[^a-z0-9\s]/', ' ', $value) ?? $value;
        $value = preg_replace('/\s+/', ' ', $value) ?? $value;

        return trim($value);
    };

    $pantryItems = collect(preg_split('/[\r\n,]+/', $pantryInput) ?: [])
        ->map(fn ($item) => trim((string) $item))
        ->filter()
        ->unique()
        ->values();

    $pantryStaples = PantryStaple::query()
        ->where('user_id', $request->user()->id)
        ->orderBy('name')
        ->get();

    $inStockStapleItems = $pantryStaples
        ->where('is_in_stock', true)
        ->pluck('name')
        ->map(fn ($item) => trim((string) $item))
        ->filter()
        ->values();

    $currentMealPlan = MealPlan::query()
        ->where('user_id', $request->user()->id)
        ->latest()
        ->first();

    $currentMealPlanRecipeIds = $currentMealPlan
        ? $currentMealPlan->recipes()
            ->pluck('recipe_id')
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
        : collect();

    $allAvailableItems = $pantryItems
        ->concat($inStockStapleItems)
        ->map(fn ($item) => trim((string) $item))
        ->filter()
        ->unique()
        ->values();

    $normalizedPantryItems = $allAvailableItems
        ->map(fn ($item) => $normalizeTerm($item))
        ->filter()
        ->unique()
        ->values();

    $suggestions = collect();

    $categoryOptions = NewRecipe::query()
        ->pluck('category')
        ->map(fn ($value) => trim((string) $value))
        ->filter()
        ->unique()
        ->sort()
        ->values();

    $cuisineOptions = NewRecipe::query()
        ->pluck('cuisine')
        ->map(fn ($value) => trim((string) $value))
        ->filter()
        ->unique()
        ->sort()
        ->values();

    if ($normalizedPantryItems->isNotEmpty()) {
        $recipeQuery = NewRecipe::query();

        if ($selectedCategory !== '') {
            $recipeQuery->where('category', $selectedCategory);
        }

        if ($selectedCuisine !== '') {
            $recipeQuery->where('cuisine', $selectedCuisine);
        }

        $suggestions = $recipeQuery
            ->orderByDesc('created_at')
            ->limit(350)
            ->get()
            ->map(function (NewRecipe $recipe) use ($normalizeTerm, $normalizedPantryItems, $currentMealPlanRecipeIds) {
                $ingredients = collect(is_array($recipe->ingredients) ? $recipe->ingredients : [])
                    ->map(fn ($item) => trim(html_entity_decode((string) $item, ENT_QUOTES | ENT_HTML5, 'UTF-8')))
                    ->filter()
                    ->values();

                $normalizedIngredients = $ingredients
                    ->map(fn ($item) => $normalizeTerm($item))
                    ->filter()
                    ->values();

                $matchedIngredients = $ingredients
                    ->filter(function ($ingredient, $index) use ($normalizedIngredients, $normalizedPantryItems) {
                        $normalizedIngredient = (string) ($normalizedIngredients->get($index) ?? '');

                        if ($normalizedIngredient === '') {
                            return false;
                        }

                        foreach ($normalizedPantryItems as $pantryItem) {
                            if (
                                str_contains($normalizedIngredient, $pantryItem)
                                || str_contains((string) $pantryItem, $normalizedIngredient)
                            ) {
                                return true;
                            }
                        }

                        return false;
                    })
                    ->values();

                $missingIngredients = $ingredients
                    ->filter(function ($ingredient, $index) use ($normalizedIngredients, $normalizedPantryItems) {
                        $normalizedIngredient = (string) ($normalizedIngredients->get($index) ?? '');

                        if ($normalizedIngredient === '') {
                            return false;
                        }

                        foreach ($normalizedPantryItems as $pantryItem) {
                            if (
                                str_contains($normalizedIngredient, $pantryItem)
                                || str_contains((string) $pantryItem, $normalizedIngredient)
                            ) {
                                return false;
                            }
                        }

                        return true;
                    })
                    ->values();

                $totalIngredients = $ingredients->count();
                $matchedCount = $matchedIngredients->count();
                $missingCount = max($totalIngredients - $matchedCount, 0);
                $score = $totalIngredients > 0 ? $matchedCount / $totalIngredients : 0;

                return [
                    'id' => $recipe->id,
                    'slug' => $recipe->slug,
                    'name' => html_entity_decode($recipe->name, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
                    'category' => $recipe->category ?: 'Uncategorized',
                    'image' => $recipe->image,
                    'description' => $recipe->description,
                    'matched_count' => $matchedCount,
                    'total_ingredients' => $totalIngredients,
                    'missing_count' => $missingCount,
                    'match_percent' => (int) round($score * 100),
                    'matched_ingredients' => $matchedIngredients->take(4)->values(),
                    'missing_ingredients' => $missingIngredients->take(6)->values(),
                    'in_current_meal_plan' => $currentMealPlanRecipeIds->contains((int) $recipe->id),
                    'score' => $score,
                ];
            })
            ->filter(fn ($item) => $item['matched_count'] > 0)
            ->sortBy([
                ['match_percent', 'desc'],
                ['matched_count', 'desc'],
                ['total_ingredients', 'asc'],
            ])
            ->take(30)
            ->values()
            ->map(function ($item) {
                unset($item['score']);

                return $item;
            });
    }

    return Inertia::render('MealPlanningPantry', [
        'pantryInput' => $pantryInput,
        'pantryItems' => $pantryItems,
        'pantryStaples' => $pantryStaples
            ->map(fn (PantryStaple $staple) => [
                'id' => $staple->id,
                'name' => $staple->name,
                'is_in_stock' => (bool) $staple->is_in_stock,
            ])
            ->values(),
        'shoppingListItems' => $pantryStaples
            ->where('is_in_stock', false)
            ->pluck('name')
            ->values(),
        'effectivePantryItems' => $allAvailableItems,
        'filters' => [
            'category' => $selectedCategory,
            'cuisine' => $selectedCuisine,
        ],
        'filterOptions' => [
            'categories' => $categoryOptions,
            'cuisines' => $cuisineOptions,
        ],
        'suggestions' => $suggestions,
    ]);
};

Route::get('/meal-planning/pantry', function (Request $request) use ($renderPantryAssistantPage) {
    $pantryInput = trim((string) $request->query('pantry_input', ''));

    return $renderPantryAssistantPage($request, $pantryInput);
})->middleware(['auth', 'verified'])->name('meal-planning.pantry');

Route::post('/meal-planning/pantry', function (Request $request) {
    $validated = $request->validate([
        'pantry_input' => ['nullable', 'string', 'max:5000'],
        'filter_category' => ['nullable', 'string', 'max:120'],
        'filter_cuisine' => ['nullable', 'string', 'max:120'],
    ]);

    return redirect()->route('meal-planning.pantry', [
        'pantry_input' => trim((string) ($validated['pantry_input'] ?? '')),
        'category' => trim((string) ($validated['filter_category'] ?? '')),
        'cuisine' => trim((string) ($validated['filter_cuisine'] ?? '')),
    ]);
})->middleware(['auth', 'verified'])->name('meal-planning.pantry.suggest');

Route::post('/meal-planning/pantry/add-to-meal-plan', function (Request $request) {
    $validated = $request->validate([
        'pantry_input' => ['nullable', 'string', 'max:5000'],
        'filter_category' => ['nullable', 'string', 'max:120'],
        'filter_cuisine' => ['nullable', 'string', 'max:120'],
        'recipe_id' => ['required', 'integer', 'exists:new_recipes,id'],
    ]);

    $recipe = NewRecipe::query()->find((int) $validated['recipe_id']);

    if (! $recipe) {
        return redirect()->route('meal-planning.pantry', [
            'pantry_input' => trim((string) ($validated['pantry_input'] ?? '')),
            'category' => trim((string) ($validated['filter_category'] ?? '')),
            'cuisine' => trim((string) ($validated['filter_cuisine'] ?? '')),
        ]);
    }

    $mealPlan = MealPlan::query()
        ->where('user_id', $request->user()->id)
        ->latest()
        ->first();

    if (! $mealPlan) {
        $weekStart = Carbon::now()->startOfDay();
        $weekEnd = Carbon::now()->addDays(7)->startOfDay();

        $mealPlan = MealPlan::create([
            'user_id' => $request->user()->id,
            'name' => sprintf('Week of %s', $weekStart->format('F j, Y')),
            'week_start' => $weekStart,
            'week_end' => $weekEnd,
            'checked_item_ids' => [],
            'pantry_item_ids' => [],
            'checklist_view_mode' => 'combined',
        ]);
    }

    $alreadyInPlan = $mealPlan->recipes()
        ->where('recipe_id', $recipe->id)
        ->exists();

    if (! $alreadyInPlan) {
        $mealPlan->recipes()->create([
            'recipe_id' => $recipe->id,
            'recipe_name' => $recipe->name,
            'recipe_category' => $recipe->category,
            'cook_time' => $recipe->planningCookTimeLabel(),
            'ingredients' => is_array($recipe->ingredients)
                ? $recipe->ingredients
                : [],
        ]);
    }

    return redirect()->route('meal-planning.pantry', [
        'pantry_input' => trim((string) ($validated['pantry_input'] ?? '')),
        'category' => trim((string) ($validated['filter_category'] ?? '')),
        'cuisine' => trim((string) ($validated['filter_cuisine'] ?? '')),
    ]);
})->middleware(['auth', 'verified'])->name('meal-planning.pantry.add-to-meal-plan');

Route::post('/meal-planning/pantry/staples', function (Request $request) {
    $validated = $request->validate([
        'pantry_input' => ['nullable', 'string', 'max:5000'],
        'filter_category' => ['nullable', 'string', 'max:120'],
        'filter_cuisine' => ['nullable', 'string', 'max:120'],
        'staple_name' => ['required', 'string', 'max:120'],
    ]);

    $name = trim((string) $validated['staple_name']);

    if ($name !== '') {
        $existingStaple = PantryStaple::query()
            ->where('user_id', $request->user()->id)
            ->whereRaw('lower(name) = ?', [mb_strtolower($name)])
            ->first();

        if ($existingStaple) {
            $existingStaple->update([
                'is_in_stock' => true,
            ]);
        } else {
            PantryStaple::create([
                'user_id' => $request->user()->id,
                'name' => $name,
                'is_in_stock' => true,
            ]);
        }
    }

    return redirect()->route('meal-planning.pantry', [
        'pantry_input' => trim((string) ($validated['pantry_input'] ?? '')),
        'category' => trim((string) ($validated['filter_category'] ?? '')),
        'cuisine' => trim((string) ($validated['filter_cuisine'] ?? '')),
    ]);
})->middleware(['auth', 'verified'])->name('meal-planning.pantry.staples.store');

Route::patch('/meal-planning/pantry/staples/{pantryStaple}', function (Request $request, PantryStaple $pantryStaple) {
    if ((int) $pantryStaple->user_id !== (int) $request->user()->id) {
        abort(403);
    }

    $validated = $request->validate([
        'pantry_input' => ['nullable', 'string', 'max:5000'],
        'filter_category' => ['nullable', 'string', 'max:120'],
        'filter_cuisine' => ['nullable', 'string', 'max:120'],
        'is_in_stock' => ['required', 'boolean'],
    ]);

    $pantryStaple->update([
        'is_in_stock' => (bool) $validated['is_in_stock'],
    ]);

    return redirect()->route('meal-planning.pantry', [
        'pantry_input' => trim((string) ($validated['pantry_input'] ?? '')),
        'category' => trim((string) ($validated['filter_category'] ?? '')),
        'cuisine' => trim((string) ($validated['filter_cuisine'] ?? '')),
    ]);
})->middleware(['auth', 'verified'])->name('meal-planning.pantry.staples.update');

Route::delete('/meal-planning/pantry/staples/{pantryStaple}', function (Request $request, PantryStaple $pantryStaple) {
    if ((int) $pantryStaple->user_id !== (int) $request->user()->id) {
        abort(403);
    }

    $validated = $request->validate([
        'pantry_input' => ['nullable', 'string', 'max:5000'],
        'filter_category' => ['nullable', 'string', 'max:120'],
        'filter_cuisine' => ['nullable', 'string', 'max:120'],
    ]);

    $pantryStaple->delete();

    return redirect()->route('meal-planning.pantry', [
        'pantry_input' => trim((string) ($validated['pantry_input'] ?? '')),
        'category' => trim((string) ($validated['filter_category'] ?? '')),
        'cuisine' => trim((string) ($validated['filter_cuisine'] ?? '')),
    ]);
})->middleware(['auth', 'verified'])->name('meal-planning.pantry.staples.destroy');

Route::get('/meal-planning/previous', function (Request $request) {
    $plans = MealPlan::query()
        ->where('user_id', $request->user()->id)
        ->withCount('recipes')
        ->orderByDesc('week_start')
        ->orderByDesc('created_at')
        ->paginate(15)
        ->withQueryString()
        ->through(function (MealPlan $plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'week_start' => $plan->week_start?->toDateString(),
                'week_end' => $plan->week_end?->toDateString(),
                'recipes_count' => $plan->recipes_count,
                'created_at' => $plan->created_at,
            ];
        });

    return Inertia::render('MealPlanningPrevious', [
        'plans' => $plans,
    ]);
})->middleware(['auth', 'verified'])->name('meal-planning.previous');

Route::get('/meal-planning/list/{mealPlan}', function (Request $request, MealPlan $mealPlan) {
    if ((int) $mealPlan->user_id !== (int) $request->user()->id) {
        abort(403);
    }

    $planRecipes = $mealPlan->recipes()
        ->orderBy('id')
        ->get()
        ->map(function ($recipe) {
            return [
                'id' => $recipe->recipe_id,
                'name' => $recipe->recipe_name,
                'category' => $recipe->recipe_category,
                'cook_time' => $recipe->cook_time,
                'ingredients' => $recipe->ingredients ?? [],
            ];
        })
        ->values();

    $selectedIds = $planRecipes
        ->pluck('id')
        ->values();

    $checklistItems = $planRecipes
        ->flatMap(function (array $recipe) {
            return collect($recipe['ingredients'])->map(function (string $ingredient) use ($recipe) {
                return [
                    'ingredient' => $ingredient,
                    'recipe_id' => $recipe['id'],
                    'recipe_name' => $recipe['name'],
                ];
            });
        })
        ->values()
        ->map(function (array $item, int $index) {
            return [
                'id' => $index + 1,
                ...$item,
            ];
        });

    return Inertia::render('MealPlanningList', [
        'mealPlan' => [
            'id' => $mealPlan->id,
            'name' => $mealPlan->name,
            'week_start' => $mealPlan->week_start?->toDateString(),
            'week_end' => $mealPlan->week_end?->toDateString(),
            'created_at' => $mealPlan->created_at,
            'checked_item_ids' => $mealPlan->checked_item_ids ?? [],
            'pantry_item_ids' => $mealPlan->pantry_item_ids ?? [],
            'checklist_view_mode' => $mealPlan->checklist_view_mode ?? 'combined',
        ],
        'selectedIds' => $selectedIds,
        'planRecipes' => $planRecipes,
        'checklistItems' => $checklistItems,
    ]);
})->middleware(['auth', 'verified'])->name('meal-planning.list');

Route::get('/meal-planning/{mealPlan}/edit', function (Request $request, MealPlan $mealPlan) {
    if ((int) $mealPlan->user_id !== (int) $request->user()->id) {
        abort(403);
    }

    $query = trim((string) $request->query('q', ''));

    $recipes = NewRecipe::query()
        ->when($query !== '', function ($builder) use ($query) {
            $builder->where(function ($queryBuilder) use ($query) {
                $queryBuilder
                    ->where('name', 'like', "%{$query}%")
                    ->orWhere('category', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhere('ingredients', 'like', "%{$query}%");
            });
        })
        ->orderByDesc('created_at')
        ->limit(60)
        ->get()
        ->map(function (NewRecipe $recipe) {
            $ingredients = is_array($recipe->ingredients)
                ? $recipe->ingredients
                : [];

            return [
                'id' => $recipe->id,
                'name' => html_entity_decode($recipe->name, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
                'category' => $recipe->category ?: 'Uncategorized',
                'cook_time' => $recipe->planningCookTimeLabel(),
                'image' => $recipe->image,
                'description' => $recipe->description,
                'ingredients' => $ingredients,
            ];
        })
        ->values();

    $selectedIds = $mealPlan->recipes()
        ->orderBy('id')
        ->pluck('recipe_id')
        ->map(fn ($id) => (int) $id)
        ->values();

    return Inertia::render('MealPlanningEdit', [
        'mealPlan' => [
            'id' => $mealPlan->id,
            'name' => $mealPlan->name,
            'week_start' => $mealPlan->week_start?->toDateString(),
            'week_end' => $mealPlan->week_end?->toDateString(),
            'created_at' => $mealPlan->created_at,
            'checked_item_count' => count($mealPlan->checked_item_ids ?? []),
            'pantry_item_count' => count($mealPlan->pantry_item_ids ?? []),
        ],
        'recipes' => $recipes,
        'selectedIds' => $selectedIds,
        'filters' => [
            'q' => $query,
        ],
    ]);
})->middleware(['auth', 'verified'])->name('meal-planning.edit');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/note-shares', [ProfileController::class, 'storeNoteShare'])->name('profile.note-shares.store');
    Route::delete('/profile/note-shares/{viewer}', [ProfileController::class, 'destroyNoteShare'])->name('profile.note-shares.destroy');
    Route::get('/profile/extension-tokens', [ExtensionTokenController::class, 'index'])
        ->middleware('throttle:20,1')
        ->name('profile.extension-tokens.index');
    Route::post('/profile/extension-tokens', [ExtensionTokenController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('profile.extension-tokens.store');
    Route::delete('/profile/extension-tokens/{tokenId}', [ExtensionTokenController::class, 'destroy'])
        ->middleware('throttle:20,1')
        ->name('profile.extension-tokens.destroy');
    Route::get('/recipe', [RecipeController::class, 'create'])->name('recipe.create');
    Route::post('/recipe/preview', [RecipeController::class, 'preview'])->name('recipe.preview');
    Route::post('/recipe', [RecipeController::class, 'store'])->name('recipe.store');
    Route::post('/recipes/{recipe}/favorite', function (Request $request, NewRecipe $recipe) {
        $request->user()->favoriteRecipes()->syncWithoutDetaching([$recipe->id]);

        return back(303);
    })->name('recipes.favorite');

    Route::delete('/recipes/{recipe}/favorite', function (Request $request, NewRecipe $recipe) {
        $request->user()->favoriteRecipes()->detach($recipe->id);

        return back(303);
    })->name('recipes.unfavorite');

    Route::post('/recipes/{recipe}/made', function (Request $request, NewRecipe $recipe) {
        $request->user()->madeRecipes()->syncWithoutDetaching([$recipe->id]);

        return back(303);
    })->name('recipes.made');

    Route::delete('/recipes/{recipe}/made', function (Request $request, NewRecipe $recipe) {
        $request->user()->madeRecipes()->detach($recipe->id);

        return back(303);
    })->name('recipes.unmade');

    Route::post('/comment/{model}/{id}', [CommentController::class, 'store'])->name('comment.store');
    Route::post('/meal-planning/assemble', function (Request $request) {
        $validated = $request->validate([
            'selected_ids' => ['required', 'array', 'min:1'],
            'selected_ids.*' => ['integer'],
        ]);

        $selectedIds = collect($validated['selected_ids'])
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values();

        if ($selectedIds->isEmpty()) {
            return redirect()->route('meal-planning');
        }

        $recipesById = NewRecipe::query()
            ->whereIn('id', $selectedIds->all(), 'and', false)
            ->get()
            ->keyBy('id');

        $selectedRecipes = $selectedIds
            ->map(fn ($id) => $recipesById->get($id))
            ->filter()
            ->values();

        if ($selectedRecipes->isEmpty()) {
            return redirect()->route('meal-planning');
        }

        $weekStart = Carbon::now()->startOfDay();
        $weekEnd = Carbon::now()->addDays(7)->startOfDay();

        $mealPlan = MealPlan::create([
            'user_id' => $request->user()->id,
            'name' => sprintf('Week of %s', $weekStart->format('F j, Y')),
            'week_start' => $weekStart,
            'week_end' => $weekEnd,
            'checked_item_ids' => [],
            'pantry_item_ids' => [],
            'checklist_view_mode' => 'combined',
        ]);

        $mealPlan->recipes()->createMany(
            $selectedRecipes->map(function (NewRecipe $recipe) {
                return [
                    'recipe_id' => $recipe->id,
                    'recipe_name' => $recipe->name,
                    'recipe_category' => $recipe->category,
                    'cook_time' => $recipe->planningCookTimeLabel(),
                    'ingredients' => is_array($recipe->ingredients)
                        ? $recipe->ingredients
                        : [],
                ];
            })->all()
        );

        return redirect()->route('meal-planning.list', $mealPlan->id);
    })->name('meal-planning.assemble');
    Route::patch('/meal-planning/{mealPlan}/recipes', function (Request $request, MealPlan $mealPlan) {
        if ((int) $mealPlan->user_id !== (int) $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'selected_ids' => ['required', 'array', 'min:1'],
            'selected_ids.*' => ['integer'],
        ]);

        $selectedIds = collect($validated['selected_ids'])
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values();

        if ($selectedIds->isEmpty()) {
            return back(303);
        }

        $recipesById = NewRecipe::query()
            ->whereIn('id', $selectedIds->all(), 'and', false)
            ->get()
            ->keyBy('id');

        $selectedRecipes = $selectedIds
            ->map(fn ($id) => $recipesById->get($id))
            ->filter()
            ->values();

        if ($selectedRecipes->isEmpty()) {
            return back(303);
        }

        $existingRecipeIds = $mealPlan->recipes()
            ->pluck('recipe_id')
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->sort()
            ->values();

        $nextRecipeIds = $selectedIds
            ->sort()
            ->values();

        $recipeSetChanged = $existingRecipeIds->all() !== $nextRecipeIds->all();

        if (! $recipeSetChanged) {
            return redirect()->route('meal-planning.list', $mealPlan->id);
        }

        DB::transaction(function () use ($mealPlan, $selectedRecipes) {
            $mealPlan->recipes()->delete();

            $mealPlan->recipes()->createMany(
                $selectedRecipes->map(function (NewRecipe $recipe) {
                    return [
                        'recipe_id' => $recipe->id,
                        'recipe_name' => $recipe->name,
                        'recipe_category' => $recipe->category,
                        'cook_time' => $recipe->planningCookTimeLabel(),
                        'ingredients' => is_array($recipe->ingredients)
                            ? $recipe->ingredients
                            : [],
                    ];
                })->all()
            );

            $mealPlan->update([
                'checked_item_ids' => [],
                'pantry_item_ids' => [],
            ]);
        });

        return redirect()->route('meal-planning.list', $mealPlan->id);
    })->name('meal-planning.update');
    Route::patch('/meal-planning/list/{mealPlan}/state', function (Request $request, MealPlan $mealPlan) {
        if ((int) $mealPlan->user_id !== (int) $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'checked_item_ids' => ['present', 'array'],
            'checked_item_ids.*' => ['integer'],
            'pantry_item_ids' => ['present', 'array'],
            'pantry_item_ids.*' => ['integer'],
            'checklist_view_mode' => ['required', 'in:combined,by-meal'],
        ]);

        $mealPlan->update([
            'checked_item_ids' => collect($validated['checked_item_ids'])
                ->map(fn ($id) => (int) $id)
                ->filter(fn ($id) => $id > 0)
                ->unique()
                ->values()
                ->all(),
            'pantry_item_ids' => collect($validated['pantry_item_ids'])
                ->map(fn ($id) => (int) $id)
                ->filter(fn ($id) => $id > 0)
                ->unique()
                ->values()
                ->all(),
            'checklist_view_mode' => $validated['checklist_view_mode'],
        ]);

        return back(303);
    })->name('meal-planning.list.state');
    Route::post('/recipes/{recipe}/private-notes', [PrivateRecipeNoteController::class, 'store'])
        ->name('recipes.private-notes.store');
    Route::patch('/recipes/{recipe}/private-notes/{note}', [PrivateRecipeNoteController::class, 'update'])
        ->name('recipes.private-notes.update');
    Route::delete('/recipes/{recipe}/private-notes/{note}', [PrivateRecipeNoteController::class, 'destroy'])
        ->name('recipes.private-notes.destroy');
});

require __DIR__.'/auth.php';
