<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\PrivateRecipeNoteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use App\Models\NewRecipe;
use Illuminate\Http\Request;
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
    Route::post('/recipes/{recipe}/private-notes', [PrivateRecipeNoteController::class, 'store'])
        ->name('recipes.private-notes.store');
    Route::patch('/recipes/{recipe}/private-notes/{note}', [PrivateRecipeNoteController::class, 'update'])
        ->name('recipes.private-notes.update');
    Route::delete('/recipes/{recipe}/private-notes/{note}', [PrivateRecipeNoteController::class, 'destroy'])
        ->name('recipes.private-notes.destroy');
});

require __DIR__.'/auth.php';
