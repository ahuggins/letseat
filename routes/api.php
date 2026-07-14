<?php

use App\Http\Controllers\Api\ExtensionRecipeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'throttle:30,1'])
    ->prefix('extension')
    ->group(function () {
        Route::get('/me', [ExtensionRecipeController::class, 'me']);
        Route::post('/recipe/preview', [ExtensionRecipeController::class, 'preview']);
        Route::post('/recipe/import', [ExtensionRecipeController::class, 'import']);
    });
