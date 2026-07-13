<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\NewRecipe;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'featuredRecipe' => $this->featuredRecipe(),
        ]);
    }

    private function featuredRecipe(): ?array
    {
        $sessionKey = 'auth_featured_recipe_id';

        $query = NewRecipe::query()
            ->select(['id', 'name', 'image'])
            ->whereNotNull('image', 'and')
            ->where('image', '!=', '');

        $recipeId = session($sessionKey);
        $recipe = $recipeId
            ? (clone $query)->where('id', $recipeId)->first()
            : null;

        if (! $recipe) {
            $recipe = (clone $query)->inRandomOrder('')->first();

            if ($recipe) {
                session([$sessionKey => $recipe->id]);
            } else {
                session()->forget($sessionKey);
            }
        }

        if (! $recipe) {
            return null;
        }

        return [
            'id' => $recipe->id,
            'name' => $recipe->name,
            'image' => $recipe->image,
        ];
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('recipes', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
