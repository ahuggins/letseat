import { useEffect, useMemo, useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

type PlannerRecipe = {
    id: number;
    name: string;
    category: string;
    cook_time?: string | null;
    image?: string | null;
    description?: string | null;
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
    const lastAppliedQueryRef = useRef((filters?.q ?? "").trim());
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const latestSavedPlan = savedPlans[0] ?? null;

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

    function requestFilter(nextQuery: string) {
        if (nextQuery === lastAppliedQueryRef.current) {
            return;
        }

        const shouldRestoreFocus =
            document.activeElement === searchInputRef.current;

        lastAppliedQueryRef.current = nextQuery;

        router.get(
            route("meal-planning"),
            { q: nextQuery },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => {
                    if (!shouldRestoreFocus || !searchInputRef.current) {
                        return;
                    }

                    const input = searchInputRef.current;
                    input.focus({ preventScroll: true });
                    const cursorPos = input.value.length;
                    input.setSelectionRange(cursorPos, cursorPos);
                },
            },
        );
    }

    function applyFilter() {
        requestFilter(searchQuery.trim());
    }

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            requestFilter(searchQuery.trim());
        }, 350);

        return () => window.clearTimeout(timeoutId);
    }, [searchQuery]);

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
                className="bg-white py-6 pb-28 sm:py-10 sm:pb-32"
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
                        className="sticky top-16 z-30 mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-white/95 p-4 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between"
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
                                    ref={searchInputRef}
                                    id="meal-planning-search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            applyFilter();
                                        }
                                    }}
                                    placeholder="Filter by name, description, or ingredient"
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
                                        className="flex h-full flex-col rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
                                        data-testid={`meal-planning-recipe-card-${recipe.id}`}
                                    >
                                        <div className="flex flex-1 items-start gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                        {recipe.category}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        {recipe.cook_time ||
                                                            "Time not set"}
                                                    </span>
                                                </div>

                                                <h3 className="font-serif text-xl font-semibold leading-tight text-zinc-900">
                                                    {recipe.name}
                                                </h3>
                                                <p className="mt-2 text-sm text-zinc-600">
                                                    {recipe.description?.trim() ||
                                                        "No description yet."}
                                                </p>
                                            </div>

                                            {recipe.image ? (
                                                <img
                                                    src={recipe.image}
                                                    alt={recipe.name}
                                                    className="h-20 w-24 shrink-0 rounded-xl border border-red-100 object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-gradient-to-br from-red-100 to-orange-50 text-[11px] font-medium uppercase tracking-[0.08em] text-red-700/80">
                                                    Recipe
                                                </div>
                                            )}
                                        </div>

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

                <div
                    className="fixed inset-x-0 bottom-0 z-40 border-t border-red-200/80 bg-white/95 backdrop-blur"
                    data-testid="meal-planning-sticky-saved-plan"
                >
                    <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                        {latestSavedPlan ? (
                            <>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700/80">
                                        Latest saved list
                                    </p>
                                    <p className="truncate text-sm font-medium text-zinc-900">
                                        {latestSavedPlan.name ||
                                            "Saved meal list"}
                                    </p>
                                    <p className="truncate text-xs text-zinc-600">
                                        {formatWeekRange(
                                            latestSavedPlan.week_start,
                                            latestSavedPlan.week_end,
                                        )}{" "}
                                        • {latestSavedPlan.recipes_count} meal
                                        {latestSavedPlan.recipes_count === 1
                                            ? ""
                                            : "s"}
                                    </p>
                                </div>

                                <Link
                                    href={route(
                                        "meal-planning.list",
                                        latestSavedPlan.id,
                                    )}
                                    className="shrink-0 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                                    data-testid={`meal-planning-open-saved-plan-${latestSavedPlan.id}`}
                                >
                                    Open current list
                                </Link>
                            </>
                        ) : (
                            <div className="flex w-full items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700/80">
                                        Saved list
                                    </p>
                                    <p className="text-sm text-zinc-600">
                                        No saved lists yet.
                                    </p>
                                </div>
                            </div>
                        )}
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
