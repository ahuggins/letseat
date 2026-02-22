<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // return 'working';

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/recipes', function (Request $request) {
    if ($request->query('user')) {
        $recipes = App\Models\Recipe::where('user_id', (int) $request->query('user'))->orderBy('created_at', 'desc')->paginate();
    } else {
        $recipes = App\Models\Recipe::orderBy('created_at', 'desc')->paginate();
    }

    // dd($recipes);

    return Inertia::render('Recipes', ['recipes' => $recipes]);
})->middleware(['auth', 'verified'])->name('recipes');

Route::get('/recipe/{recipe:slug}', function (App\Models\Recipe $recipe) {
    return Inertia::render('Recipe', ['recipe' => $recipe]);
})->middleware(['auth', 'verified'])->name('recipe');

Route::get('/search', function (Request $request) {
    $recipes = App\Models\Recipe::search($request->query('q'))->options([
        'query_by' => 'name,ingredients',
    ])->paginate();

    return Inertia::render('Search', ['recipes' => ['data' => $recipes]]);
})->middleware(['auth', 'verified'])->name('search');

// Route::delete('/recipe/{recipe:slug}', function (App\Models\Recipe $recipe) {
//     if (auth()->user()->email !== 'andrewhuggins@gmail.com') {
//         return;
//     }

//     $recipe->delete();

//     return to_route('recipes');

//     // return Inertia::render('Recipe', ['recipe' => $recipe]);
// })->middleware(['auth', 'verified'])->name('recipe');

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
