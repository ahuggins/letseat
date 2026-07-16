<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\ExtensionTokenController;
use App\Http\Controllers\MealPlanningController;
use App\Http\Controllers\PantryAssistantController;
use App\Http\Controllers\PrivateRecipeNoteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeBrowseController;
use App\Http\Controllers\RecipeController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('recipes');
});

Route::view('/privacy-policy', 'privacy-policy')->name('privacy-policy');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/recipes', [RecipeBrowseController::class, 'index'])->name('recipes');

    Route::get('/my-favorites', [RecipeBrowseController::class, 'favorites'])->name('favorites');

    Route::get('/my-makes', [RecipeBrowseController::class, 'makes'])->name('makes');

    Route::get('/recipe/{recipe:slug}', [RecipeBrowseController::class, 'show'])->name('recipe');

    Route::get('/search', [RecipeBrowseController::class, 'search'])->name('search');

    Route::get('/add-recipe', [RecipeBrowseController::class, 'addRecipe'])->name('add-recipe');

    Route::prefix('meal-planning')->group(function () {
        Route::get('/', [MealPlanningController::class, 'index'])->name('meal-planning');

        Route::prefix('pantry')->group(function () {
            Route::get('/', [PantryAssistantController::class, 'index'])->name('meal-planning.pantry');
            Route::post('/', [PantryAssistantController::class, 'suggest'])->name('meal-planning.pantry.suggest');
            Route::post('/add-to-meal-plan', [PantryAssistantController::class, 'addToMealPlan'])->name('meal-planning.pantry.add-to-meal-plan');
            Route::post('/staples', [PantryAssistantController::class, 'storeStaple'])->name('meal-planning.pantry.staples.store');
            Route::patch('/staples/{pantryStaple}', [PantryAssistantController::class, 'updateStaple'])->name('meal-planning.pantry.staples.update');
            Route::delete('/staples/{pantryStaple}', [PantryAssistantController::class, 'destroyStaple'])->name('meal-planning.pantry.staples.destroy');
        });

        Route::get('/previous', [MealPlanningController::class, 'previous'])->name('meal-planning.previous');
        Route::get('/list/{mealPlan}', [MealPlanningController::class, 'list'])->name('meal-planning.list');
        Route::get('/{mealPlan}/edit', [MealPlanningController::class, 'edit'])->name('meal-planning.edit');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/note-shares', [ProfileController::class, 'storeNoteShare'])->name('profile.note-shares.store');
    Route::delete('/profile/note-shares/{viewer}', [ProfileController::class, 'destroyNoteShare'])->name('profile.note-shares.destroy');
    Route::patch('/profile/note-shares/{owner}/accept', [ProfileController::class, 'acceptNoteShare'])->name('profile.note-shares.accept');
    Route::delete('/profile/note-shares/{owner}/decline', [ProfileController::class, 'declineNoteShare'])->name('profile.note-shares.decline');
    Route::delete('/profile/note-shares/{owner}/leave', [ProfileController::class, 'leaveNoteShare'])->name('profile.note-shares.leave');
    Route::post('/profile/pantry-shares', [ProfileController::class, 'storePantryShare'])->name('profile.pantry-shares.store');
    Route::delete('/profile/pantry-shares/{viewer}', [ProfileController::class, 'destroyPantryShare'])->name('profile.pantry-shares.destroy');
    Route::patch('/profile/pantry-shares/{owner}/accept', [ProfileController::class, 'acceptPantryShare'])->name('profile.pantry-shares.accept');
    Route::delete('/profile/pantry-shares/{owner}/decline', [ProfileController::class, 'declinePantryShare'])->name('profile.pantry-shares.decline');
    Route::delete('/profile/pantry-shares/{owner}/leave', [ProfileController::class, 'leavePantryShare'])->name('profile.pantry-shares.leave');
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

    Route::prefix('recipes/{recipe}')->group(function () {
        Route::post('/favorite', [RecipeBrowseController::class, 'favorite'])->name('recipes.favorite');
        Route::delete('/favorite', [RecipeBrowseController::class, 'unfavorite'])->name('recipes.unfavorite');

        Route::post('/made', [RecipeBrowseController::class, 'made'])->name('recipes.made');
        Route::delete('/made', [RecipeBrowseController::class, 'unmade'])->name('recipes.unmade');
    });

    Route::post('/comment/{model}/{id}', [CommentController::class, 'store'])->name('comment.store');

    Route::prefix('meal-planning')->group(function () {
        Route::post('/assemble', [MealPlanningController::class, 'assemble'])
            ->name('meal-planning.assemble');
        Route::patch('/{mealPlan}/recipes', [MealPlanningController::class, 'update'])
            ->name('meal-planning.update');
        Route::patch('/list/{mealPlan}/state', [MealPlanningController::class, 'updateListState'])
            ->name('meal-planning.list.state');
    });

    Route::prefix('recipes/{recipe}/private-notes')->group(function () {
        Route::post('/', [PrivateRecipeNoteController::class, 'store'])
            ->name('recipes.private-notes.store');
        Route::patch('/{note}', [PrivateRecipeNoteController::class, 'update'])
            ->name('recipes.private-notes.update');
        Route::delete('/{note}', [PrivateRecipeNoteController::class, 'destroy'])
            ->name('recipes.private-notes.destroy');
    });
});

require __DIR__.'/auth.php';
