<?php

namespace App\Http\Controllers;

use App\Models\MealPlan;
use App\Models\NewRecipe;
use App\Models\PantryShare;
use App\Models\PantryStaple;
use App\Models\User;
use App\Services\PantrySuggestionService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class PantryAssistantController extends Controller
{
    public function __construct(private PantrySuggestionService $pantrySuggestionService)
    {
    }

    public function index(Request $request): Response
    {
        $pantryInput = trim((string) $request->query('pantry_input', ''));

        return $this->renderPantryAssistantPage($request, $pantryInput);
    }

    public function suggest(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pantry_input' => ['nullable', 'string', 'max:5000'],
            'filter_category' => ['nullable', 'string', 'max:120'],
            'filter_cuisine' => ['nullable', 'string', 'max:120'],
        ]);

        return redirect()->route('meal-planning.pantry', $this->pantryRedirectParams($validated));
    }

    public function addToMealPlan(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pantry_input' => ['nullable', 'string', 'max:5000'],
            'filter_category' => ['nullable', 'string', 'max:120'],
            'filter_cuisine' => ['nullable', 'string', 'max:120'],
            'recipe_id' => ['required', 'integer', 'exists:new_recipes,id'],
        ]);

        $recipe = NewRecipe::query()->find((int) $validated['recipe_id']);

        if (! $recipe) {
            return redirect()->route('meal-planning.pantry', $this->pantryRedirectParams($validated));
        }

        $mealPlan = MealPlan::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->first();

        if (! $mealPlan) {
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
        }

        $alreadyInPlan = $mealPlan->recipes()
            ->where('recipe_id', $recipe->id)
            ->exists();

        if (! $alreadyInPlan) {
            $mealPlan->recipes()->create([
                'recipe_id' => $recipe->id,
                'recipe_name' => $recipe->name,
                'recipe_category' => $recipe->category,
                'cook_time' => $recipe->planningCookTimeLabel(),
                'ingredients' => is_array($recipe->ingredients)
                    ? $recipe->ingredients
                    : [],
            ]);
        }

        return redirect()->route('meal-planning.pantry', $this->pantryRedirectParams($validated));
    }

    public function storeStaple(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pantry_input' => ['nullable', 'string', 'max:5000'],
            'filter_category' => ['nullable', 'string', 'max:120'],
            'filter_cuisine' => ['nullable', 'string', 'max:120'],
            'staple_name' => ['required', 'string', 'max:120'],
        ]);

        $name = trim((string) $validated['staple_name']);
        $pantryMemberIds = $this->resolvePantryMemberIds($request);

        if ($name !== '') {
            $existingStaple = PantryStaple::query()
                ->whereIn('user_id', $pantryMemberIds)
                ->whereRaw('lower(name) = ?', [mb_strtolower($name)])
                ->first();

            if ($existingStaple) {
                $existingStaple->update([
                    'is_in_stock' => true,
                ]);
            } else {
                PantryStaple::create([
                    'user_id' => $request->user()->id,
                    'name' => $name,
                    'is_in_stock' => true,
                ]);
            }
        }

        return redirect()->route('meal-planning.pantry', $this->pantryRedirectParams($validated));
    }

    public function updateStaple(Request $request, PantryStaple $pantryStaple): RedirectResponse
    {
        $pantryMemberIds = $this->resolvePantryMemberIds($request);

        if (! $pantryMemberIds->contains((int) $pantryStaple->user_id)) {
            abort(403);
        }

        $validated = $request->validate([
            'pantry_input' => ['nullable', 'string', 'max:5000'],
            'filter_category' => ['nullable', 'string', 'max:120'],
            'filter_cuisine' => ['nullable', 'string', 'max:120'],
            'is_in_stock' => ['required', 'boolean'],
        ]);

        $pantryStaple->update([
            'is_in_stock' => (bool) $validated['is_in_stock'],
        ]);

        return redirect()->route('meal-planning.pantry', $this->pantryRedirectParams($validated));
    }

    public function destroyStaple(Request $request, PantryStaple $pantryStaple): RedirectResponse
    {
        $pantryMemberIds = $this->resolvePantryMemberIds($request);

        if (! $pantryMemberIds->contains((int) $pantryStaple->user_id)) {
            abort(403);
        }

        $validated = $request->validate([
            'pantry_input' => ['nullable', 'string', 'max:5000'],
            'filter_category' => ['nullable', 'string', 'max:120'],
            'filter_cuisine' => ['nullable', 'string', 'max:120'],
        ]);

        $pantryStaple->delete();

        return redirect()->route('meal-planning.pantry', $this->pantryRedirectParams($validated));
    }

    private function renderPantryAssistantPage(Request $request, string $pantryInput = ''): Response
    {
        $selectedCategory = trim((string) $request->query('category', ''));
        $selectedCuisine = trim((string) $request->query('cuisine', ''));
        $pantryMemberIds = $this->resolvePantryMemberIds($request);
        $viewerId = (int) $request->user()->id;

        $normalizeTerm = function (string $value): string {
            $value = strtolower($value);
            $value = preg_replace('/\([^)]*\)/', ' ', $value) ?? $value;
            $value = preg_replace('/^\s*\d+[\d\s\/\.-]*/', ' ', $value) ?? $value;
            $value = preg_replace('/\b(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|gram|grams|kg|ml|l|clove|cloves|slice|slices|can|cans|package|packages|pinch|bunch)\b/', ' ', $value) ?? $value;
            $value = preg_replace('/[^a-z0-9\s]/', ' ', $value) ?? $value;
            $value = preg_replace('/\s+/', ' ', $value) ?? $value;

            return trim($value);
        };

        $pantryItems = collect(preg_split('/[\r\n,]+/', $pantryInput) ?: [])
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->unique()
            ->values();

        $pantryStaples = PantryStaple::query()
            ->whereIn('user_id', $pantryMemberIds)
            ->orderBy('name')
            ->get();

        $sharedPantryOwners = User::query()
            ->whereIn('id', $pantryMemberIds->reject(fn ($id) => (int) $id === $viewerId)->values()->all(), 'and', false)
            ->orderBy('name', 'asc')
            ->get(['name', 'email'])
            ->map(fn ($user) => [
                'name' => $user->name,
                'email' => $user->email,
            ])
            ->values();

        $inStockStapleItems = $pantryStaples
            ->where('is_in_stock', true)
            ->pluck('name')
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->unique()
            ->values();

        $currentMealPlan = MealPlan::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->first();

        $currentMealPlanRecipeIds = $currentMealPlan
            ? $currentMealPlan->recipes()
                ->pluck('recipe_id')
                ->map(fn ($id) => (int) $id)
                ->filter(fn ($id) => $id > 0)
                ->unique()
                ->values()
            : collect();

        $normalizedManualPantryItems = $pantryItems
            ->map(fn ($item) => $normalizeTerm($item))
            ->filter()
            ->unique()
            ->values();

        $normalizedStaplePantryItems = $inStockStapleItems
            ->map(fn ($item) => $normalizeTerm($item))
            ->filter()
            ->unique()
            ->values();

        $normalizedPantryItems = $normalizedManualPantryItems
            ->concat($normalizedStaplePantryItems)
            ->unique()
            ->values();

        $allAvailableItems = $pantryItems
            ->concat($inStockStapleItems)
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->unique()
            ->values();

        $categoryOptions = NewRecipe::query()
            ->pluck('category')
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique()
            ->sort()
            ->values();

        $cuisineOptions = NewRecipe::query()
            ->pluck('cuisine')
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique()
            ->sort()
            ->values();

        $suggestions = $this->pantrySuggestionService->buildSuggestions(
            $selectedCategory,
            $selectedCuisine,
            $normalizedPantryItems,
            $normalizedManualPantryItems,
            $currentMealPlanRecipeIds,
            $normalizeTerm
        );

        return Inertia::render('MealPlanningPantry', [
            'pantryInput' => $pantryInput,
            'pantryItems' => $pantryItems,
            'pantryStaples' => $pantryStaples
                ->map(fn (PantryStaple $staple) => [
                    'id' => $staple->id,
                    'name' => $staple->name,
                    'is_in_stock' => (bool) $staple->is_in_stock,
                ])
                ->values(),
            'sharedPantryOwners' => $sharedPantryOwners,
            'shoppingListItems' => $pantryStaples
                ->where('is_in_stock', false)
                ->pluck('name')
                ->values(),
            'effectivePantryItems' => $allAvailableItems,
            'filters' => [
                'category' => $selectedCategory,
                'cuisine' => $selectedCuisine,
            ],
            'filterOptions' => [
                'categories' => $categoryOptions,
                'cuisines' => $cuisineOptions,
            ],
            'suggestions' => $suggestions,
        ]);
    }

    private function resolvePantryMemberIds(Request $request): Collection
    {
        $userId = (int) $request->user()->id;

        $acceptedShares = PantryShare::query()
            ->accepted()
            ->where(function ($builder) use ($userId) {
                $builder
                    ->where('owner_user_id', $userId)
                    ->orWhere('viewer_user_id', $userId);
            })
            ->get(['owner_user_id', 'viewer_user_id']);

        return collect([$userId])
            ->concat($acceptedShares->pluck('owner_user_id'))
            ->concat($acceptedShares->pluck('viewer_user_id'))
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values();
    }

    private function pantryRedirectParams(array $validated): array
    {
        return [
            'pantry_input' => trim((string) ($validated['pantry_input'] ?? '')),
            'category' => trim((string) ($validated['filter_category'] ?? '')),
            'cuisine' => trim((string) ($validated['filter_cuisine'] ?? '')),
        ];
    }
}
