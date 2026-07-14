<?php

namespace App\Http\Controllers\Api;

use App\Actions\GetNewRecipe;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;
use Throwable;

class ExtensionRecipeController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $user = $this->requireTokenUser($request, 'extension:me');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);
    }

    public function preview(Request $request, GetNewRecipe $action): JsonResponse
    {
        $this->requireTokenUser($request, 'recipe:preview');

        $validated = $request->validate([
            'url' => ['required', 'url:http,https', 'max:2000'],
        ]);

        try {
            $preview = $action->preview((string) $validated['url']);

            return response()->json([
                'parseable' => true,
                'preview' => $preview,
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'parseable' => false,
                'message' => $exception->getMessage() ?: 'This URL could not be parsed right now.',
            ], 422);
        }
    }

    public function import(Request $request, GetNewRecipe $action): JsonResponse
    {
        $user = $this->requireTokenUser($request, 'recipe:import');

        $validated = $request->validate([
            'url' => ['required', 'url:http,https', 'max:2000'],
        ]);

        try {
            $recipe = $action->execute((string) $validated['url'], (int) $user->id);

            return response()->json([
                'imported' => true,
                'recipe_id' => $recipe->id,
                'recipe_slug' => $recipe->slug,
                'recipe_url' => URL::to('/recipe/'.$recipe->slug),
            ]);
        } catch (Throwable $exception) {
            throw ValidationException::withMessages([
                'url' => $exception->getMessage() ?: 'Unable to import this recipe URL right now.',
            ]);
        }
    }

    private function requireTokenUser(Request $request, string $ability)
    {
        $user = $request->user();

        if (! $user || ! $user->currentAccessToken()) {
            abort(401, 'Token authentication is required.');
        }

        if (! $user->tokenCan($ability)) {
            abort(403, 'Token does not have the required ability.');
        }

        $token = $user->currentAccessToken();
        $token->forceFill(['last_used_at' => now()])->save();

        return $user;
    }
}
