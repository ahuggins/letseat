<?php

namespace App\Http\Controllers;

use App\Models\NewRecipe;
use App\Models\PrivateNoteShare;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecipeBrowseController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->renderRecipeIndex($request);
    }

    public function favorites(Request $request): Response
    {
        return $this->renderRecipeIndex($request, true);
    }

    public function makes(Request $request): Response
    {
        return $this->renderRecipeIndex($request, false, true);
    }

    public function show(Request $request, NewRecipe $recipe): Response
    {
        $viewerId = (int) $request->user()->id;

        $recipeWithViewerState = NewRecipe::query()
            ->whereKey($recipe->id)
            ->withExists([
                'madeBy as is_made' => fn ($builder) => $builder->where('users.id', $viewerId),
            ])
            ->first() ?? $recipe;

        $privateNotes = $recipe->privateNotes()
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at')
            ->get();

        $isSharingNotes = $request->user()
            ->noteSharesGiven()
            ->where('status', PrivateNoteShare::STATUS_ACCEPTED)
            ->exists();

        $sharedOwnerIds = $request->user()
            ->noteSharesReceived()
            ->where('status', PrivateNoteShare::STATUS_ACCEPTED)
            ->pluck('owner_user_id');

        $sharedNotes = $recipe->privateNotes()
            ->with('user:id,name,email')
            ->whereIn('user_id', $sharedOwnerIds)
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Recipe', [
            'recipe' => $recipeWithViewerState,
            'privateNotes' => $privateNotes,
            'sharedNotes' => $sharedNotes,
            'isSharingNotes' => $isSharingNotes,
        ]);
    }

    public function search(Request $request): Response
    {
        $recipes = NewRecipe::search($request->query('q'))->options([
            'query_by' => 'name,ingredients,category',
        ])->paginate();

        return Inertia::render('Search', ['recipes' => ['data' => $recipes]]);
    }

    public function addRecipe(Request $request): Response
    {
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
    }

    public function favorite(Request $request, NewRecipe $recipe): RedirectResponse
    {
        $request->user()->favoriteRecipes()->syncWithoutDetaching([$recipe->id]);

        return back(303);
    }

    public function unfavorite(Request $request, NewRecipe $recipe): RedirectResponse
    {
        $request->user()->favoriteRecipes()->detach($recipe->id);

        return back(303);
    }

    public function made(Request $request, NewRecipe $recipe): RedirectResponse
    {
        $request->user()->madeRecipes()->syncWithoutDetaching([$recipe->id]);

        return back(303);
    }

    public function unmade(Request $request, NewRecipe $recipe): RedirectResponse
    {
        $request->user()->madeRecipes()->detach($recipe->id);

        return back(303);
    }

    private function renderRecipeIndex(Request $request, bool $favoritesOnly = false, bool $madesOnly = false): Response
    {
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
    }
}
