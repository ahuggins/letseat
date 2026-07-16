<?php

namespace App\Http\Controllers;

use App\Models\MealPlan;
use App\Models\NewRecipe;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MealPlanningController extends Controller
{
    public function index(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));

        $recipes = NewRecipe::query()
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($queryBuilder) use ($query) {
                    $queryBuilder
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('category', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%")
                        ->orWhere('ingredients', 'like', "%{$query}%");
                });
            })
            ->orderByDesc('created_at')
            ->limit(60)
            ->get()
            ->map(fn (NewRecipe $recipe) => $this->mapPlanningRecipe($recipe))
            ->values();

        $savedPlans = MealPlan::query()
            ->where('user_id', $request->user()->id)
            ->withCount('recipes')
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn (MealPlan $plan) => $this->mapPlanSummary($plan))
            ->values();

        return Inertia::render('MealPlanning', [
            'recipes' => $recipes,
            'filters' => [
                'q' => $query,
            ],
            'savedPlans' => $savedPlans,
        ]);
    }

    public function previous(Request $request): Response
    {
        $plans = MealPlan::query()
            ->where('user_id', $request->user()->id)
            ->withCount('recipes')
            ->orderByDesc('week_start')
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (MealPlan $plan) => $this->mapPlanSummary($plan));

        return Inertia::render('MealPlanningPrevious', [
            'plans' => $plans,
        ]);
    }

    public function list(Request $request, MealPlan $mealPlan): Response
    {
        $this->assertMealPlanOwner($request, $mealPlan);

        $planRecipes = $mealPlan->recipes()
            ->orderBy('id')
            ->get()
            ->map(function ($recipe) {
                return [
                    'id' => $recipe->recipe_id,
                    'name' => $recipe->recipe_name,
                    'category' => $recipe->recipe_category,
                    'cook_time' => $recipe->cook_time,
                    'ingredients' => $recipe->ingredients ?? [],
                ];
            })
            ->values();

        $selectedIds = $planRecipes
            ->pluck('id')
            ->values();

        $checklistItems = $planRecipes
            ->flatMap(function (array $recipe) {
                return collect($recipe['ingredients'])->map(function (string $ingredient) use ($recipe) {
                    return [
                        'ingredient' => $ingredient,
                        'recipe_id' => $recipe['id'],
                        'recipe_name' => $recipe['name'],
                    ];
                });
            })
            ->values()
            ->map(function (array $item, int $index) {
                return [
                    'id' => $index + 1,
                    ...$item,
                ];
            });

        return Inertia::render('MealPlanningList', [
            'mealPlan' => [
                'id' => $mealPlan->id,
                'name' => $mealPlan->name,
                'week_start' => $mealPlan->week_start?->toDateString(),
                'week_end' => $mealPlan->week_end?->toDateString(),
                'created_at' => $mealPlan->created_at,
                'checked_item_ids' => $mealPlan->checked_item_ids ?? [],
                'pantry_item_ids' => $mealPlan->pantry_item_ids ?? [],
                'checklist_view_mode' => $mealPlan->checklist_view_mode ?? 'combined',
            ],
            'selectedIds' => $selectedIds,
            'planRecipes' => $planRecipes,
            'checklistItems' => $checklistItems,
        ]);
    }

    public function edit(Request $request, MealPlan $mealPlan): Response
    {
        $this->assertMealPlanOwner($request, $mealPlan);

        $query = trim((string) $request->query('q', ''));

        $recipes = NewRecipe::query()
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($queryBuilder) use ($query) {
                    $queryBuilder
                        ->where('name', 'like', "%{$query}%")
                        ->orWhere('category', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%")
                        ->orWhere('ingredients', 'like', "%{$query}%");
                });
            })
            ->orderByDesc('created_at')
            ->limit(60)
            ->get()
            ->map(fn (NewRecipe $recipe) => $this->mapPlanningRecipe($recipe))
            ->values();

        $selectedIds = $mealPlan->recipes()
            ->orderBy('id')
            ->pluck('recipe_id')
            ->map(fn ($id) => (int) $id)
            ->values();

        return Inertia::render('MealPlanningEdit', [
            'mealPlan' => [
                'id' => $mealPlan->id,
                'name' => $mealPlan->name,
                'week_start' => $mealPlan->week_start?->toDateString(),
                'week_end' => $mealPlan->week_end?->toDateString(),
                'created_at' => $mealPlan->created_at,
                'checked_item_count' => count($mealPlan->checked_item_ids ?? []),
                'pantry_item_count' => count($mealPlan->pantry_item_ids ?? []),
            ],
            'recipes' => $recipes,
            'selectedIds' => $selectedIds,
            'filters' => [
                'q' => $query,
            ],
        ]);
    }

    public function assemble(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'selected_ids' => ['required', 'array', 'min:1'],
            'selected_ids.*' => ['integer'],
        ]);

        $selectedIds = collect($validated['selected_ids'])
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values();

        if ($selectedIds->isEmpty()) {
            return redirect()->route('meal-planning');
        }

        $recipesById = NewRecipe::query()
            ->whereIn('id', $selectedIds->all(), 'and', false)
            ->get()
            ->keyBy('id');

        $selectedRecipes = $selectedIds
            ->map(fn ($id) => $recipesById->get($id))
            ->filter()
            ->values();

        if ($selectedRecipes->isEmpty()) {
            return redirect()->route('meal-planning');
        }

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

        $mealPlan->recipes()->createMany(
            $selectedRecipes->map(function (NewRecipe $recipe) {
                return [
                    'recipe_id' => $recipe->id,
                    'recipe_name' => $recipe->name,
                    'recipe_category' => $recipe->category,
                    'cook_time' => $recipe->planningCookTimeLabel(),
                    'ingredients' => is_array($recipe->ingredients)
                        ? $recipe->ingredients
                        : [],
                ];
            })->all()
        );

        return redirect()->route('meal-planning.list', $mealPlan->id);
    }

    public function update(Request $request, MealPlan $mealPlan): RedirectResponse
    {
        $this->assertMealPlanOwner($request, $mealPlan);

        $validated = $request->validate([
            'selected_ids' => ['required', 'array', 'min:1'],
            'selected_ids.*' => ['integer'],
        ]);

        $selectedIds = collect($validated['selected_ids'])
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values();

        if ($selectedIds->isEmpty()) {
            return back(303);
        }

        $recipesById = NewRecipe::query()
            ->whereIn('id', $selectedIds->all(), 'and', false)
            ->get()
            ->keyBy('id');

        $selectedRecipes = $selectedIds
            ->map(fn ($id) => $recipesById->get($id))
            ->filter()
            ->values();

        if ($selectedRecipes->isEmpty()) {
            return back(303);
        }

        $existingRecipeIds = $mealPlan->recipes()
            ->pluck('recipe_id')
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->sort()
            ->values();

        $nextRecipeIds = $selectedIds
            ->sort()
            ->values();

        $recipeSetChanged = $existingRecipeIds->all() !== $nextRecipeIds->all();

        if (! $recipeSetChanged) {
            return redirect()->route('meal-planning.list', $mealPlan->id);
        }

        DB::transaction(function () use ($mealPlan, $selectedRecipes) {
            $mealPlan->recipes()->delete();

            $mealPlan->recipes()->createMany(
                $selectedRecipes->map(function (NewRecipe $recipe) {
                    return [
                        'recipe_id' => $recipe->id,
                        'recipe_name' => $recipe->name,
                        'recipe_category' => $recipe->category,
                        'cook_time' => $recipe->planningCookTimeLabel(),
                        'ingredients' => is_array($recipe->ingredients)
                            ? $recipe->ingredients
                            : [],
                    ];
                })->all()
            );

            $mealPlan->update([
                'checked_item_ids' => [],
                'pantry_item_ids' => [],
            ]);
        });

        return redirect()->route('meal-planning.list', $mealPlan->id);
    }

    public function updateListState(Request $request, MealPlan $mealPlan): RedirectResponse
    {
        $this->assertMealPlanOwner($request, $mealPlan);

        $validated = $request->validate([
            'checked_item_ids' => ['present', 'array'],
            'checked_item_ids.*' => ['integer'],
            'pantry_item_ids' => ['present', 'array'],
            'pantry_item_ids.*' => ['integer'],
            'checklist_view_mode' => ['required', 'in:combined,by-meal'],
        ]);

        $mealPlan->update([
            'checked_item_ids' => collect($validated['checked_item_ids'])
                ->map(fn ($id) => (int) $id)
                ->filter(fn ($id) => $id > 0)
                ->unique()
                ->values()
                ->all(),
            'pantry_item_ids' => collect($validated['pantry_item_ids'])
                ->map(fn ($id) => (int) $id)
                ->filter(fn ($id) => $id > 0)
                ->unique()
                ->values()
                ->all(),
            'checklist_view_mode' => $validated['checklist_view_mode'],
        ]);

        return back(303);
    }

    private function mapPlanningRecipe(NewRecipe $recipe): array
    {
        $ingredients = is_array($recipe->ingredients)
            ? $recipe->ingredients
            : [];

        return [
            'id' => $recipe->id,
            'name' => html_entity_decode($recipe->name, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            'category' => $recipe->category ?: 'Uncategorized',
            'cook_time' => $recipe->planningCookTimeLabel(),
            'image' => $recipe->image,
            'description' => $recipe->description,
            'ingredients' => $ingredients,
        ];
    }

    private function mapPlanSummary(MealPlan $plan): array
    {
        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'week_start' => $plan->week_start?->toDateString(),
            'week_end' => $plan->week_end?->toDateString(),
            'recipes_count' => $plan->recipes_count,
            'created_at' => $plan->created_at,
        ];
    }

    private function assertMealPlanOwner(Request $request, MealPlan $mealPlan): void
    {
        if ((int) $mealPlan->user_id !== (int) $request->user()->id) {
            abort(403);
        }
    }
}
