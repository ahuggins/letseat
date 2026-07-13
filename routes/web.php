<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/recipes', function (Request $request) {
    $user = $request->query('user');
    $query = trim((string) $request->query('q', ''));
    $category = trim((string) $request->query('category', 'All'));

    $baseQuery = App\Models\NewRecipe::query();

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
                ->orWhere('category', 'like', "%{$query}%");
        });
    }

    if ($category !== '' && strcasecmp($category, 'All') !== 0) {
        $recipesQuery->where('category', 'like', $category.'%');
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

    return Inertia::render('Recipes', [
        'recipes' => $recipes,
        'categories' => $categories,
        'filters' => [
            'q' => $query,
            'category' => $category !== '' ? $category : 'All',
            'user' => $user,
        ],
    ]);
})->middleware(['auth', 'verified'])->name('recipes');

Route::get('/recipe/{recipe:slug}', function (App\Models\NewRecipe $recipe) {
    return Inertia::render('Recipe', ['recipe' => $recipe]);
})->middleware(['auth', 'verified'])->name('recipe');

Route::get('/search', function (Request $request) {
    $recipes = App\Models\NewRecipe::search($request->query('q'))->options([
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
    Route::get('/recipe', [RecipeController::class, 'create'])->name('recipe.create');
    Route::post('/recipe', [RecipeController::class, 'store'])->name('recipe.store');
    Route::post('/comment/{model}/{id}', [CommentController::class, 'store'])->name('comment.store');
});

require __DIR__.'/auth.php';
