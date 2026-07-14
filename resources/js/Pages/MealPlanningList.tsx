import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

type PlannedRecipe = {
    id: number;
    name: string;
    category: string;
};

type ChecklistItem = {
    id: number;
    ingredient: string;
    recipe_id: number;
    recipe_name: string;
};

export default function MealPlanningList({
    auth,
    mealPlan,
    planRecipes,
    checklistItems,
}: {
    auth: any;
    mealPlan: {
        id: number;
        name?: string | null;
        week_start?: string | null;
        week_end?: string | null;
        created_at: string;
        checked_item_ids?: number[];
        pantry_item_ids?: number[];
        checklist_view_mode?: "combined" | "by-meal";
    };
    planRecipes: PlannedRecipe[];
    checklistItems: ChecklistItem[];
}) {
    const [checkedItems, setCheckedItems] = useState<number[]>(
        mealPlan.checked_item_ids ?? [],
    );
    const [pantryItems, setPantryItems] = useState<number[]>(
        mealPlan.pantry_item_ids ?? [],
    );
    const [viewMode, setViewMode] = useState<"combined" | "by-meal">(
        mealPlan.checklist_view_mode ?? "combined",
    );

    const shoppingItems = useMemo(
        () => checklistItems.filter((item) => !pantryItems.includes(item.id)),
        [checklistItems, pantryItems],
    );
    const pantryListItems = useMemo(
        () => checklistItems.filter((item) => pantryItems.includes(item.id)),
        [checklistItems, pantryItems],
    );
    const groupedShoppingItems = useMemo(() => {
        const groups = planRecipes.map((recipe) => ({
            recipe_id: recipe.id,
            recipe_name: recipe.name,
            items: shoppingItems.filter((item) => item.recipe_id === recipe.id),
        }));

        const knownRecipeIds = new Set(planRecipes.map((recipe) => recipe.id));
        const ungroupedItems = shoppingItems.filter(
            (item) => !knownRecipeIds.has(item.recipe_id),
        );

        if (ungroupedItems.length) {
            groups.push({
                recipe_id: -1,
                recipe_name: "Other",
                items: ungroupedItems,
            });
        }

        return groups.filter((group) => group.items.length > 0);
    }, [planRecipes, shoppingItems]);

    function toggleChecked(itemId: number) {
        setCheckedItems((prev) => {
            const nextChecked = prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId];

            persistChecklistState(nextChecked, pantryItems, viewMode);

            return nextChecked;
        });
    }

    function markInPantry(itemId: number) {
        setPantryItems((prev) => {
            if (prev.includes(itemId)) {
                return prev;
            }

            const nextPantry = [...prev, itemId];
            const nextChecked = checkedItems.filter((id) => id !== itemId);

            setCheckedItems(nextChecked);
            persistChecklistState(nextChecked, nextPantry, viewMode);

            return nextPantry;
        });
    }

    function removeFromPantry(itemId: number) {
        setPantryItems((prev) => {
            const nextPantry = prev.filter((id) => id !== itemId);

            persistChecklistState(checkedItems, nextPantry, viewMode);

            return nextPantry;
        });
    }

    function setAndPersistViewMode(nextViewMode: "combined" | "by-meal") {
        setViewMode(nextViewMode);
        persistChecklistState(checkedItems, pantryItems, nextViewMode);
    }

    function persistChecklistState(
        nextChecked: number[],
        nextPantry: number[],
        nextViewMode: "combined" | "by-meal",
    ) {
        router.patch(
            route("meal-planning.list.state", mealPlan.id),
            {
                checked_item_ids: nextChecked,
                pantry_item_ids: nextPantry,
                checklist_view_mode: nextViewMode,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Meal Planning
                </h2>
            }
        >
            <Head title="Meal Planning Checklist" />

            <div
                className="bg-white py-6 sm:py-10"
                data-testid="meal-planning-list-page"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section
                        className="mb-8 rounded-3xl border border-red-200 bg-gradient-to-br from-red-100 via-rose-50 to-zinc-50 p-8 shadow-sm sm:p-10"
                        data-testid="meal-planning-list-hero"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                            Step 2
                        </p>
                        <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                            Shopping Checklist
                        </h1>
                        <p className="mt-3 max-w-3xl text-lg text-zinc-600">
                            Combined ingredients from your selected meals. Mark
                            pantry items to hide them from shopping.
                        </p>
                    </section>

                    <section
                        className="mb-6 rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
                        data-testid="meal-planning-selected-recipes"
                    >
                        <p
                            className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-red-700/80"
                            data-testid="meal-planning-list-name"
                        >
                            {mealPlan.name || "Saved meal list"}
                        </p>
                        <p
                            className="mb-3 text-sm text-zinc-600"
                            data-testid="meal-planning-list-range"
                        >
                            {formatWeekRange(
                                mealPlan.week_start,
                                mealPlan.week_end,
                            )}
                        </p>
                        <h2 className="font-serif text-2xl font-semibold text-zinc-900">
                            Meals in this list
                        </h2>
                        {planRecipes.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {planRecipes.map((recipe) => (
                                    <span
                                        key={recipe.id}
                                        className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-800"
                                        data-testid={`meal-planning-selected-recipe-${recipe.id}`}
                                    >
                                        {recipe.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-zinc-600">
                                No recipes selected yet.
                            </p>
                        )}
                    </section>

                    <section
                        className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
                        data-testid="meal-planning-checklist"
                    >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="font-serif text-2xl font-semibold text-zinc-900">
                                    Ingredients to shop
                                </h2>
                                <div
                                    className="inline-flex rounded-full border border-zinc-200 bg-white p-1"
                                    data-testid="meal-planning-view-mode-toggle"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAndPersistViewMode("combined")
                                        }
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                            viewMode === "combined"
                                                ? "bg-red-50 text-red-800"
                                                : "text-zinc-600 hover:bg-zinc-50"
                                        }`}
                                        data-testid="meal-planning-view-mode-combined"
                                    >
                                        Combined
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAndPersistViewMode("by-meal")
                                        }
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                            viewMode === "by-meal"
                                                ? "bg-red-50 text-red-800"
                                                : "text-zinc-600 hover:bg-zinc-50"
                                        }`}
                                        data-testid="meal-planning-view-mode-by-meal"
                                    >
                                        By meal
                                    </button>
                                </div>
                            </div>
                            <p
                                className="text-sm text-zinc-600"
                                data-testid="meal-planning-checklist-count"
                            >
                                {shoppingItems.length} item
                                {shoppingItems.length === 1 ? "" : "s"} to shop
                            </p>
                        </div>

                        {shoppingItems.length ? (
                            viewMode === "combined" ? (
                                <ul
                                    className="space-y-2"
                                    data-testid="meal-planning-checklist-items"
                                >
                                    {shoppingItems.map((item) => {
                                        const isChecked = checkedItems.includes(
                                            item.id,
                                        );

                                        return (
                                            <ChecklistRow
                                                key={item.id}
                                                item={item}
                                                isChecked={isChecked}
                                                onToggleChecked={toggleChecked}
                                                onMarkInPantry={markInPantry}
                                                showMealLabel={true}
                                            />
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div
                                    className="space-y-4"
                                    data-testid="meal-planning-checklist-by-meal"
                                >
                                    {groupedShoppingItems.map((group) => (
                                        <div
                                            key={group.recipe_id}
                                            className="rounded-xl border border-red-100 bg-red-50/25 p-3"
                                            data-testid={`meal-planning-checklist-group-${group.recipe_id}`}
                                        >
                                            <h3
                                                className="mb-2 text-sm font-semibold text-zinc-800"
                                                data-testid={`meal-planning-checklist-group-title-${group.recipe_id}`}
                                            >
                                                {group.recipe_name}
                                            </h3>
                                            <ul className="space-y-2">
                                                {group.items.map((item) => {
                                                    const isChecked =
                                                        checkedItems.includes(
                                                            item.id,
                                                        );

                                                    return (
                                                        <ChecklistRow
                                                            key={item.id}
                                                            item={item}
                                                            isChecked={
                                                                isChecked
                                                            }
                                                            onToggleChecked={
                                                                toggleChecked
                                                            }
                                                            onMarkInPantry={
                                                                markInPantry
                                                            }
                                                            showMealLabel={
                                                                false
                                                            }
                                                        />
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <p
                                className="text-sm text-zinc-600"
                                data-testid="meal-planning-checklist-empty"
                            >
                                No shopping items left.
                            </p>
                        )}

                        {pantryListItems.length > 0 && (
                            <div
                                className="mt-5 border-t border-red-100 pt-4"
                                data-testid="meal-planning-pantry-items"
                            >
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                                    In Pantry (Excluded from shopping)
                                </p>

                                <ul
                                    className="space-y-2"
                                    data-testid="meal-planning-pantry-items-list"
                                >
                                    {pantryListItems.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2"
                                            data-testid={`meal-planning-pantry-item-${item.id}`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <span className="block text-sm text-zinc-500 line-through">
                                                    {item.ingredient}
                                                </span>
                                                <span className="block text-xs text-zinc-500">
                                                    {item.recipe_name}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeFromPantry(item.id)
                                                }
                                                className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                                                data-testid={`meal-planning-pantry-item-restore-${item.id}`}
                                            >
                                                Add back to list
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>

                    <div
                        className="mt-8 flex flex-wrap items-center gap-4"
                        data-testid="meal-planning-list-footer"
                    >
                        <Link
                            href={route("meal-planning")}
                            className="text-sm font-medium text-red-700 underline decoration-red-300 underline-offset-4 hover:text-red-900"
                        >
                            Back to meal planning
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ChecklistRow({
    item,
    isChecked,
    onToggleChecked,
    onMarkInPantry,
    showMealLabel,
}: {
    item: ChecklistItem;
    isChecked: boolean;
    onToggleChecked: (itemId: number) => void;
    onMarkInPantry: (itemId: number) => void;
    showMealLabel: boolean;
}) {
    return (
        <li
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/40 px-3 py-2"
            data-testid={`meal-planning-checklist-item-${item.id}`}
        >
            <label className="flex min-w-0 flex-1 items-start gap-3">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleChecked(item.id)}
                    className="mt-1 rounded border-red-300 bg-red-50 text-red-600 focus:ring-red-500"
                    data-testid={`meal-planning-checklist-item-check-${item.id}`}
                />
                <span className="min-w-0">
                    <span
                        className={`block text-sm ${isChecked ? "text-zinc-500 line-through" : "text-zinc-900"}`}
                    >
                        {item.ingredient}
                    </span>
                    {showMealLabel && (
                        <span className="block text-xs text-zinc-600">
                            {item.recipe_name}
                        </span>
                    )}
                </span>
            </label>

            <button
                type="button"
                onClick={() => onMarkInPantry(item.id)}
                className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                data-testid={`meal-planning-checklist-item-pantry-${item.id}`}
            >
                In the pantry
            </button>
        </li>
    );
}

function formatWeekRange(start?: string | null, end?: string | null): string {
    if (!start || !end) {
        return "Week range unavailable";
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return "Week range unavailable";
    }

    const startLabel = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
    }).format(startDate);
    const endLabel = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(endDate);

    return `${startLabel} to ${endLabel}`;
}
