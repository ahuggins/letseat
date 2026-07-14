<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\PrivateRecipeNoteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use App\Models\MealPlan;
use App\Models\NewRecipe;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('recipes');
});

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

Route::get('/add-recipe', function () {
    return Inertia::render('AddRecipe');
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
    Route::get('/recipe', [RecipeController::class, 'create'])->name('recipe.create');
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
