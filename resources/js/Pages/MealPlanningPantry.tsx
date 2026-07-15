import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

type PantrySuggestion = {
    id: number;
    slug?: string | null;
    name: string;
    category: string;
    image?: string | null;
    description?: string | null;
    matched_count: number;
    total_ingredients: number;
    missing_count: number;
    match_percent: number;
    matched_ingredients: string[];
    missing_ingredients?: string[];
    in_current_meal_plan?: boolean;
};

type PantryStaple = {
    id: number;
    name: string;
    is_in_stock: boolean;
};

type SharedPantryOwner = {
    name?: string | null;
    email?: string | null;
};

export default function MealPlanningPantry({
    auth,
    pantryInput,
    pantryItems,
    pantryStaples,
    sharedPantryOwners,
    filters,
    filterOptions,
    suggestions,
}: {
    auth: any;
    pantryInput: string;
    pantryItems: string[];
    pantryStaples: PantryStaple[];
    sharedPantryOwners: SharedPantryOwner[];
    filters: {
        category?: string;
        cuisine?: string;
    };
    filterOptions: {
        categories: string[];
        cuisines: string[];
    };
    suggestions: PantrySuggestion[];
}) {
    const [inputValue, setInputValue] = useState(pantryInput ?? "");
    const [stapleName, setStapleName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(
        filters?.category ?? "",
    );
    const [selectedCuisine, setSelectedCuisine] = useState(
        filters?.cuisine ?? "",
    );
    const inStockStaples = pantryStaples.filter((staple) => staple.is_in_stock);
    const outOfStockStaples = pantryStaples.filter(
        (staple) => !staple.is_in_stock,
    );
    const sharedByText = sharedPantryOwners
        .map((owner) => owner.name ?? owner.email)
        .filter(Boolean)
        .join(", ");

    useEffect(() => {
        setInputValue(pantryInput ?? "");
    }, [pantryInput]);

    useEffect(() => {
        setSelectedCategory(filters?.category ?? "");
        setSelectedCuisine(filters?.cuisine ?? "");
    }, [filters?.category, filters?.cuisine]);

    function pantryRequestPayload(extra?: Record<string, unknown>) {
        return {
            pantry_input: inputValue,
            filter_category: selectedCategory,
            filter_cuisine: selectedCuisine,
            ...extra,
        };
    }

    function applyFilters(nextCategory: string, nextCuisine: string) {
        setSelectedCategory(nextCategory);
        setSelectedCuisine(nextCuisine);

        router.get(
            route("meal-planning.pantry"),
            {
                pantry_input: inputValue,
                category: nextCategory,
                cuisine: nextCuisine,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    function suggestMeals() {
        router.post(
            route("meal-planning.pantry.suggest"),
            pantryRequestPayload(),
        );
    }

    function addStaple() {
        if (!stapleName.trim()) {
            return;
        }

        router.post(
            route("meal-planning.pantry.staples.store"),
            pantryRequestPayload({
                staple_name: stapleName.trim(),
            }),
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setStapleName("");
                },
            },
        );
    }

    function updateStapleStock(staple: PantryStaple, isInStock: boolean) {
        router.patch(
            route("meal-planning.pantry.staples.update", staple.id),
            pantryRequestPayload({
                is_in_stock: isInStock,
            }),
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    function removeStaple(staple: PantryStaple) {
        router.delete(
            route("meal-planning.pantry.staples.destroy", staple.id),
            {
                data: pantryRequestPayload(),
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    function clearPantry() {
        setInputValue("");
        setSelectedCategory("");
        setSelectedCuisine("");
        router.get(route("meal-planning.pantry"));
    }

    function addToMealPlan(recipeId: number) {
        router.post(
            route("meal-planning.pantry.add-to-meal-plan"),
            pantryRequestPayload({
                recipe_id: recipeId,
            }),
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Pantry Ideas
                </h2>
            }
        >
            <Head title="Pantry Ideas" />

            <div
                className="bg-white py-6 sm:py-10"
                data-testid="meal-planning-pantry-page"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section className="mb-8 rounded-3xl border border-red-200 bg-gradient-to-br from-red-100 via-rose-50 to-zinc-50 p-8 shadow-sm sm:p-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                            Meal Planning
                        </p>
                        <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                            Pantry & Fridge Match
                        </h1>
                        <p className="mt-3 max-w-3xl text-lg text-zinc-600">
                            List what you have and get meal suggestions ranked
                            by ingredient overlap.
                        </p>
                    </section>

                    {pantryItems.length ? (
                        <section
                            className="mb-6 rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
                            data-testid="meal-planning-pantry-effective-items"
                        >
                            <h2 className="font-serif text-2xl font-semibold text-zinc-900">
                                Used for suggestions right now
                            </h2>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {pantryItems.map((item) => (
                                    <span
                                        key={item}
                                        className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-800"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                                Shared pantry ({inStockStaples.length} item
                                {inStockStaples.length === 1 ? "" : "s"}
                                {outOfStockStaples.length
                                    ? `, ${outOfStockStaples.length} out of stock`
                                    : ""}
                                )
                            </p>
                        </section>
                    ) : null}
                    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                        <section
                            className="lg:col-span-2"
                            data-testid="meal-planning-pantry-suggestions-area"
                        >
                            {suggestions.length ? (
                                <section
                                    className="grid gap-4 md:grid-cols-2"
                                    data-testid="meal-planning-pantry-suggestions"
                                >
                                    {suggestions.map((suggestion) => (
                                        <article
                                            key={suggestion.id}
                                            className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm"
                                            data-testid={`meal-planning-pantry-suggestion-${suggestion.id}`}
                                        >
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                    {suggestion.category}
                                                </span>
                                                <span className="text-xs font-semibold text-red-700">
                                                    {suggestion.match_percent}%
                                                    match
                                                </span>
                                            </div>

                                            <h3 className="font-serif text-xl font-semibold leading-tight text-zinc-900">
                                                {suggestion.name}
                                            </h3>
                                            <p className="mt-2 text-sm text-zinc-600">
                                                {suggestion.matched_count} of{" "}
                                                {suggestion.total_ingredients}{" "}
                                                ingredients matched
                                            </p>

                                            {suggestion.matched_ingredients
                                                .length ? (
                                                <p className="mt-2 text-xs text-zinc-600">
                                                    Matches:{" "}
                                                    {suggestion.matched_ingredients.join(
                                                        ", ",
                                                    )}
                                                </p>
                                            ) : null}

                                            <div className="mt-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            addToMealPlan(
                                                                suggestion.id,
                                                            )
                                                        }
                                                        disabled={Boolean(
                                                            suggestion.in_current_meal_plan,
                                                        )}
                                                        className="rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:border disabled:border-red-300 disabled:bg-red-50 disabled:text-red-800"
                                                        data-testid={`meal-planning-pantry-add-to-meal-plan-${suggestion.id}`}
                                                    >
                                                        {suggestion.in_current_meal_plan
                                                            ? "Added to current plan"
                                                            : "Add to Meal plan"}
                                                    </button>

                                                    {suggestion.slug ? (
                                                        <Link
                                                            href={route(
                                                                "recipe",
                                                                suggestion.slug,
                                                            )}
                                                            className="inline-flex rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                                        >
                                                            View recipe
                                                        </Link>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-4 text-amber-700"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                                        />
                                                    </svg>

                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                                                        To cook this
                                                    </p>
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-zinc-800">
                                                    Missing{" "}
                                                    {suggestion.missing_count}{" "}
                                                    ingredient
                                                    {suggestion.missing_count ===
                                                    1
                                                        ? ""
                                                        : "s"}
                                                </p>

                                                {suggestion.missing_ingredients
                                                    ?.length ? (
                                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-zinc-700">
                                                        {suggestion.missing_ingredients.map(
                                                            (ingredient) => (
                                                                <li
                                                                    key={
                                                                        ingredient
                                                                    }
                                                                >
                                                                    {ingredient}
                                                                </li>
                                                            ),
                                                        )}
                                                        {suggestion.missing_count >
                                                        suggestion
                                                            .missing_ingredients
                                                            .length ? (
                                                            <li className="list-none pl-0 text-zinc-500">
                                                                +
                                                                {suggestion.missing_count -
                                                                    suggestion
                                                                        .missing_ingredients
                                                                        .length}{" "}
                                                                more
                                                            </li>
                                                        ) : null}
                                                    </ul>
                                                ) : null}
                                            </div>
                                        </article>
                                    ))}
                                </section>
                            ) : (
                                <section
                                    className="rounded-2xl border border-red-200 bg-white p-8 text-center text-zinc-600"
                                    data-testid="meal-planning-pantry-empty"
                                >
                                    Add items in the pantry panel and tap
                                    Suggest meals to get recommendations.
                                </section>
                            )}
                        </section>

                        <aside
                            className="space-y-6 lg:col-span-1"
                            data-testid="meal-planning-pantry-sidebar"
                        >
                            <section
                                className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
                                data-testid="meal-planning-pantry-input"
                            >
                                <label
                                    htmlFor="pantry-items-input"
                                    className="mb-2 block text-sm font-medium text-zinc-700"
                                >
                                    Pantry / fridge items
                                </label>
                                <textarea
                                    id="pantry-items-input"
                                    value={inputValue}
                                    onChange={(e) =>
                                        setInputValue(e.target.value)
                                    }
                                    placeholder={
                                        "garlic\nonion\nolive oil\nchicken"
                                    }
                                    className="min-h-32 w-full rounded-xl border border-red-200 bg-white px-3 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                    data-testid="meal-planning-pantry-textarea"
                                />
                                <p className="mt-2 text-xs text-zinc-500">
                                    Add one item per line (commas also work).
                                </p>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="pantry-filter-category"
                                            className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80"
                                        >
                                            Category
                                        </label>
                                        <select
                                            id="pantry-filter-category"
                                            value={selectedCategory}
                                            onChange={(e) =>
                                                applyFilters(
                                                    e.target.value,
                                                    selectedCuisine,
                                                )
                                            }
                                            className="h-10 w-full rounded-xl border border-red-200 bg-white px-3 text-sm text-zinc-900 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                            data-testid="meal-planning-pantry-filter-category"
                                        >
                                            <option value="">
                                                All categories
                                            </option>
                                            {filterOptions.categories.map(
                                                (category) => (
                                                    <option
                                                        key={category}
                                                        value={category}
                                                    >
                                                        {category}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="pantry-filter-cuisine"
                                            className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80"
                                        >
                                            Cuisine
                                        </label>
                                        <select
                                            id="pantry-filter-cuisine"
                                            value={selectedCuisine}
                                            onChange={(e) =>
                                                applyFilters(
                                                    selectedCategory,
                                                    e.target.value,
                                                )
                                            }
                                            className="h-10 w-full rounded-xl border border-red-200 bg-white px-3 text-sm text-zinc-900 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                            data-testid="meal-planning-pantry-filter-cuisine"
                                        >
                                            <option value="">
                                                All cuisines
                                            </option>
                                            {filterOptions.cuisines.map(
                                                (cuisine) => (
                                                    <option
                                                        key={cuisine}
                                                        value={cuisine}
                                                    >
                                                        {cuisine}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={suggestMeals}
                                        className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                                        data-testid="meal-planning-pantry-suggest"
                                    >
                                        Suggest meals
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearPantry}
                                        className="rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                        data-testid="meal-planning-pantry-clear"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </section>

                            <section
                                className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
                                data-testid="meal-planning-pantry-staples"
                            >
                                <h2 className="font-serif text-2xl font-semibold text-zinc-900">
                                    {sharedByText
                                        ? `Shared pantry with ${sharedByText}`
                                        : "Your pantry staples"}
                                </h2>
                                <p className="mt-1 text-sm text-zinc-600">
                                    Everyone in this pantry can mark items in
                                    stock or out of stock.
                                </p>

                                {outOfStockStaples.length ? (
                                    <section
                                        className="mt-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4"
                                        data-testid="meal-planning-pantry-staple-out-of-stock-list"
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                                            Out of stock
                                        </p>
                                        <ul className="mt-3 space-y-2">
                                            {outOfStockStaples.map((staple) => (
                                                <li
                                                    key={staple.id}
                                                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2"
                                                >
                                                    <span className="text-sm font-medium text-zinc-900">
                                                        {staple.name}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateStapleStock(
                                                                    staple,
                                                                    true,
                                                                )
                                                            }
                                                            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                                                            data-testid={`meal-planning-pantry-staple-restocked-top-${staple.id}`}
                                                        >
                                                            Mark restocked
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeStaple(
                                                                    staple,
                                                                )
                                                            }
                                                            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                                                            data-testid={`meal-planning-pantry-staple-remove-top-${staple.id}`}
                                                            aria-label={`Remove ${staple.name}`}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth="1.5"
                                                                stroke="currentColor"
                                                                className="size-4 text-amber-700"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                                />
                                                            </svg>
                                                            <span className="sr-only">
                                                                Remove
                                                            </span>
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                ) : null}

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <input
                                        type="text"
                                        value={stapleName}
                                        onChange={(e) =>
                                            setStapleName(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                addStaple();
                                            }
                                        }}
                                        placeholder="Add staple item (ex: rice)"
                                        className="h-10 w-full rounded-xl border border-red-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                        data-testid="meal-planning-pantry-staple-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={addStaple}
                                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                        data-testid="meal-planning-pantry-staple-add"
                                    >
                                        Add staple
                                    </button>
                                </div>

                                {inStockStaples.length ? (
                                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                                        In stock
                                    </p>
                                ) : null}

                                {inStockStaples.length ? (
                                    <ul
                                        className="mt-4 space-y-2"
                                        data-testid="meal-planning-pantry-staple-list"
                                    >
                                        {inStockStaples.map((staple) => (
                                            <li
                                                key={staple.id}
                                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50/30 px-3 py-2"
                                            >
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-zinc-900">
                                                        {staple.name}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {staple.is_in_stock ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateStapleStock(
                                                                    staple,
                                                                    false,
                                                                )
                                                            }
                                                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                                                            data-testid={`meal-planning-pantry-staple-out-${staple.id}`}
                                                        >
                                                            I'm out
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateStapleStock(
                                                                    staple,
                                                                    true,
                                                                )
                                                            }
                                                            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                                                            data-testid={`meal-planning-pantry-staple-restocked-${staple.id}`}
                                                        >
                                                            Mark restocked
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeStaple(staple)
                                                        }
                                                        className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                                                        data-testid={`meal-planning-pantry-staple-remove-${staple.id}`}
                                                        aria-label={`Remove ${staple.name}`}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke-width="1.5"
                                                            stroke="currentColor"
                                                            className="size-4 text-amber-700"
                                                        >
                                                            <path
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                            />
                                                        </svg>

                                                        <span className="sr-only">
                                                            Remove
                                                        </span>
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-3 text-sm text-zinc-500">
                                        No in-stock staples right now.
                                    </p>
                                )}
                            </section>
                        </aside>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
