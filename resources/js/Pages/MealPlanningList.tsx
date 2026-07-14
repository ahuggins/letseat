import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

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
    };
    planRecipes: PlannedRecipe[];
    checklistItems: ChecklistItem[];
}) {
    const [checkedItems, setCheckedItems] = useState<number[]>([]);
    const [pantryItems, setPantryItems] = useState<number[]>([]);

    const visibleItems = useMemo(
        () => checklistItems.filter((item) => !pantryItems.includes(item.id)),
        [checklistItems, pantryItems],
    );

    function toggleChecked(itemId: number) {
        setCheckedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId],
        );
    }

    function markInPantry(itemId: number) {
        setPantryItems((prev) => {
            if (prev.includes(itemId)) {
                return prev;
            }

            return [...prev, itemId];
        });

        setCheckedItems((prev) => prev.filter((id) => id !== itemId));
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
                        <p className="mb-3 text-sm text-zinc-600" data-testid="meal-planning-list-range">
                            {formatWeekRange(mealPlan.week_start, mealPlan.week_end)}
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
                            <h2 className="font-serif text-2xl font-semibold text-zinc-900">
                                Ingredients to shop
                            </h2>
                            <p
                                className="text-sm text-zinc-600"
                                data-testid="meal-planning-checklist-count"
                            >
                                {visibleItems.length} item
                                {visibleItems.length === 1 ? "" : "s"} remaining
                            </p>
                        </div>

                        {visibleItems.length ? (
                            <ul
                                className="space-y-2"
                                data-testid="meal-planning-checklist-items"
                            >
                                {visibleItems.map((item) => {
                                    const isChecked = checkedItems.includes(
                                        item.id,
                                    );

                                    return (
                                        <li
                                            key={item.id}
                                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/40 px-3 py-2"
                                            data-testid={`meal-planning-checklist-item-${item.id}`}
                                        >
                                            <label className="flex min-w-0 flex-1 items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() =>
                                                        toggleChecked(item.id)
                                                    }
                                                    className="mt-1 rounded border-red-300 bg-red-50 text-red-600 focus:ring-red-500"
                                                    data-testid={`meal-planning-checklist-item-check-${item.id}`}
                                                />
                                                <span className="min-w-0">
                                                    <span
                                                        className={`block text-sm ${isChecked ? "text-zinc-500 line-through" : "text-zinc-900"}`}
                                                    >
                                                        {item.ingredient}
                                                    </span>
                                                    <span className="block text-xs text-zinc-600">
                                                        {item.recipe_name}
                                                    </span>
                                                </span>
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    markInPantry(item.id)
                                                }
                                                className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                                data-testid={`meal-planning-checklist-item-pantry-${item.id}`}
                                            >
                                                In the pantry
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p
                                className="text-sm text-zinc-600"
                                data-testid="meal-planning-checklist-empty"
                            >
                                Everything is checked off or marked in pantry.
                            </p>
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
