<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\NewRecipe;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
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
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('recipes', absolute: false));
    }
}
