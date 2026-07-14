import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

type PlannerRecipe = {
    id: number;
    name: string;
    category: string;
    cook_time: string;
    ingredients: string[];
};

export default function MealPlanning({
    auth,
    recipes,
    filters,
    savedPlans,
}: {
    auth: any;
    recipes: PlannerRecipe[];
    filters: { q?: string };
    savedPlans: Array<{
        id: number;
        name?: string | null;
        week_start?: string | null;
        week_end?: string | null;
        recipes_count: number;
        created_at: string;
    }>;
}) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState(filters?.q ?? "");

    const selectedCount = selectedIds.length;
    const weekLabel = useMemo(() => {
        const now = new Date();
        const end = new Date();
        end.setDate(now.getDate() + 7);

        const startLabel = new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
        }).format(now);
        const endLabel = new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        }).format(end);

        return `${startLabel} to ${endLabel}`;
    }, []);

    function applyFilter() {
        router.get(
            route("meal-planning"),
            { q: searchQuery.trim() },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function toggleRecipe(recipeId: number) {
        setSelectedIds((prev) => {
            if (prev.includes(recipeId)) {
                return prev.filter((id) => id !== recipeId);
            }

            return [...prev, recipeId];
        });
    }

    function assembleList() {
        if (!selectedIds.length) {
            return;
        }

        router.post(route("meal-planning.assemble"), {
            selected_ids: selectedIds,
        });
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
            <Head title="Meal Planning" />

            <div
                className="bg-white py-6 sm:py-10"
                data-testid="meal-planning-page"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section
                        className="mb-8 rounded-3xl border border-red-200 bg-gradient-to-br from-red-100 via-rose-50 to-zinc-50 p-8 shadow-sm sm:p-10"
                        data-testid="meal-planning-hero"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                            This week
                        </p>
                        <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                            Plan Meals Quickly
                        </h1>
                        <p className="mt-3 max-w-3xl text-lg text-zinc-600">
                            Pick recipes for {weekLabel}, then assemble your
                            shopping checklist.
                        </p>
                    </section>

                    <section
                        className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between"
                        data-testid="meal-planning-controls"
                    >
                        <div className="w-full max-w-xl">
                            <label
                                htmlFor="meal-planning-search"
                                className="mb-2 block text-sm font-medium text-zinc-700"
                            >
                                Recipe filter
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="meal-planning-search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Filter by recipe or ingredient"
                                    className="h-11 w-full rounded-xl border border-red-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                    data-testid="meal-planning-filter-input"
                                />
                                <button
                                    type="button"
                                    onClick={applyFilter}
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                    data-testid="meal-planning-filter-submit"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={assembleList}
                            disabled={!selectedCount}
                            className="h-11 rounded-full bg-red-500 px-5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            data-testid="meal-planning-assemble-list"
                        >
                            Assemble List ({selectedCount})
                        </button>
                    </section>

                    {recipes.length ? (
                        <section
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                            data-testid="meal-planning-recipes-grid"
                        >
                            {recipes.map((recipe) => {
                                const isSelected = selectedIds.includes(
                                    recipe.id,
                                );

                                return (
                                    <article
                                        key={recipe.id}
                                        className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
                                        data-testid={`meal-planning-recipe-card-${recipe.id}`}
                                    >
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                {recipe.category}
                                            </span>
                                            <span className="text-xs text-zinc-500">
                                                {recipe.cook_time}
                                            </span>
                                        </div>

                                        <h3 className="font-serif text-2xl font-semibold text-zinc-900">
                                            {recipe.name}
                                        </h3>
                                        <p className="mt-2 text-sm text-zinc-600">
                                            {recipe.ingredients
                                                .slice(0, 3)
                                                .join(", ")}
                                            {recipe.ingredients.length > 3
                                                ? ", ..."
                                                : ""}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleRecipe(recipe.id)
                                            }
                                            className={`mt-4 w-full rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                                isSelected
                                                    ? "border border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
                                                    : "bg-red-500 text-white hover:bg-red-600"
                                            }`}
                                            data-testid={`meal-planning-add-to-meals-${recipe.id}`}
                                        >
                                            {isSelected
                                                ? "Added to Meals"
                                                : "Add to Meals"}
                                        </button>
                                    </article>
                                );
                            })}
                        </section>
                    ) : (
                        <div
                            className="rounded-2xl border border-red-200 bg-white p-8 text-center text-zinc-600"
                            data-testid="meal-planning-empty"
                        >
                            No recipes matched your filter.
                        </div>
                    )}

                    <section
                        className="mt-8 rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
                        data-testid="meal-planning-saved-plans"
                    >
                        <h2 className="font-serif text-2xl font-semibold text-zinc-900">
                            Saved Lists
                        </h2>
                        <p className="mt-1 text-sm text-zinc-600">
                            Reopen a saved checklist while shopping.
                        </p>

                        {savedPlans.length ? (
                            <ul
                                className="mt-4 space-y-2"
                                data-testid="meal-planning-saved-plans-list"
                            >
                                {savedPlans.map((plan) => (
                                    <li
                                        key={plan.id}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/40 px-3 py-2"
                                        data-testid={`meal-planning-saved-plan-${plan.id}`}
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">
                                                {plan.name || "Saved meal list"}
                                            </p>
                                            <p className="text-xs text-zinc-600">
                                                {formatWeekRange(
                                                    plan.week_start,
                                                    plan.week_end,
                                                )} • {plan.recipes_count} meal
                                                {plan.recipes_count === 1
                                                    ? ""
                                                    : "s"}
                                            </p>
                                        </div>
                                        <Link
                                            href={route(
                                                "meal-planning.list",
                                                plan.id,
                                            )}
                                            className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                            data-testid={`meal-planning-open-saved-plan-${plan.id}`}
                                        >
                                            Open list
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p
                                className="mt-4 text-sm text-zinc-500"
                                data-testid="meal-planning-saved-plans-empty"
                            >
                                No saved lists yet.
                            </p>
                        )}
                    </section>

                    <div
                        className="mt-8"
                        data-testid="meal-planning-step-footer"
                    >
                        <Link
                            href={route("recipes")}
                            className="text-sm font-medium text-red-700 underline decoration-red-300 underline-offset-4 hover:text-red-900"
                        >
                            Back to recipes
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
