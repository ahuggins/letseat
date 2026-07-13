import React, { useEffect, useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import AddedBy from "@/Components/Recipe/AddedBy";
import CommentIcon from "@/Components/Icons/CommentIcon";
import Pagination from "./Pagination";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Recipes({
    auth,
    recipes,
    categories: categoryOptions,
    cuisines: cuisineOptions,
    filters,
    pageTitle = "Recipes",
    emptyMessage = "No recipes matched your filters.",
}: {
    auth: any;
    recipes: any;
    categories: string[];
    cuisines: string[];
    filters: {
        q?: string;
        category?: string;
        cuisine?: string;
        user?: string | null;
    };
    pageTitle?: string;
    emptyMessage?: string;
}) {
    const [searchQuery, setSearchQuery] = useState(filters?.q ?? "");
    const [activeCategory, setActiveCategory] = useState(
        filters?.category ?? "All",
    );
    const [activeCuisine, setActiveCuisine] = useState(
        filters?.cuisine ?? "All",
    );

    const recipeList = recipes?.data ?? [];
    const categories = useMemo(() => {
        const list = Array.isArray(categoryOptions)
            ? categoryOptions.filter(Boolean)
            : [];
        return ["All", ...list];
    }, [categoryOptions]);
    const cuisines = useMemo(() => {
        const list = Array.isArray(cuisineOptions)
            ? cuisineOptions.filter(Boolean)
            : [];
        return ["All", ...list];
    }, [cuisineOptions]);

    useEffect(() => {
        setSearchQuery(filters?.q ?? "");
        setActiveCategory(filters?.category ?? "All");
        setActiveCuisine(filters?.cuisine ?? "All");
    }, [filters?.q, filters?.category, filters?.cuisine]);

    useEffect(() => {
        const currentQuery = filters?.q ?? "";

        if (searchQuery === currentQuery) {
            return;
        }

        const timeout = window.setTimeout(() => {
            visitWithFilters(searchQuery, activeCategory, activeCuisine);
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [searchQuery]);

    function visitWithFilters(
        nextQuery: string,
        nextCategory: string,
        nextCuisine: string,
    ) {
        const params: Record<string, string> = {};

        const q = nextQuery.trim();
        if (q) {
            params.q = q;
        }

        if (nextCategory && nextCategory !== "All") {
            params.category = nextCategory;
        }

        if (nextCuisine && nextCuisine !== "All") {
            params.cuisine = nextCuisine;
        }

        if (filters?.user) {
            params.user = String(filters.user);
        }

        router.get(route("recipes"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function handleCategoryClick(category: string) {
        setActiveCategory(category);
        visitWithFilters(searchQuery, category, activeCuisine);
    }

    function handleCuisineClick(cuisine: string) {
        setActiveCuisine(cuisine);
        visitWithFilters(searchQuery, activeCategory, cuisine);
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {pageTitle}
                </h2>
            }
        >
            <Head title={pageTitle} />

            <div className="bg-white py-6 sm:py-10" data-testid="recipes-page">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section
                        className="mb-10 rounded-3xl border border-red-200 bg-gradient-to-br from-red-100 via-rose-50 to-zinc-50 p-8 shadow-sm sm:p-10"
                        data-testid="recipes-hero"
                    >
                        <h1
                            className="font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl"
                            data-testid="recipes-title"
                        >
                            {pageTitle === "My Favorites"
                                ? "Your Favorite Recipes"
                                : "Discover Delicious Recipes"}
                        </h1>
                        <p className="mt-3 max-w-3xl text-lg text-zinc-600">
                            Explore your collection and find the perfect recipe
                            by ingredient, category, or inspiration.
                        </p>

                        <div className="mt-6 max-w-md">
                            <div className="relative">
                                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    data-testid="recipes-search-input"
                                    placeholder="Search recipes..."
                                    className="h-11 w-full rounded-full border border-red-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                />
                            </div>
                        </div>
                    </section>

                    <section
                        className="mb-8 grid gap-4 md:max-w-2xl md:grid-cols-2"
                        data-testid="recipes-filters"
                    >
                        <div>
                            <label
                                htmlFor="category-filter"
                                className="mb-2 block text-sm font-medium text-zinc-700"
                            >
                                Category
                            </label>
                            <select
                                id="category-filter"
                                value={activeCategory}
                                onChange={(e) =>
                                    handleCategoryClick(e.target.value)
                                }
                                data-testid="recipes-category-filter"
                                className="h-11 w-full rounded-xl border border-red-200 bg-white px-3 text-sm text-zinc-900 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category === "All"
                                            ? "All categories"
                                            : decodeHtmlEntities(category)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="cuisine-filter"
                                className="mb-2 block text-sm font-medium text-zinc-700"
                            >
                                Cuisine
                            </label>
                            <select
                                id="cuisine-filter"
                                value={activeCuisine}
                                onChange={(e) =>
                                    handleCuisineClick(e.target.value)
                                }
                                data-testid="recipes-cuisine-filter"
                                className="h-11 w-full rounded-xl border border-red-200 bg-white px-3 text-sm text-zinc-900 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                                {cuisines.map((cuisine) => (
                                    <option key={cuisine} value={cuisine}>
                                        {cuisine === "All"
                                            ? "All cuisines"
                                            : decodeHtmlEntities(cuisine)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {recipeList.length > 0 ? (
                        <section
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                            data-testid="recipes-grid"
                        >
                            {recipeList.map((recipe: any) => (
                                <RecipePreview
                                    recipe={recipe}
                                    key={recipe.id}
                                />
                            ))}
                        </section>
                    ) : (
                        <div
                            className="rounded-2xl border border-red-200 bg-white p-8 text-center text-zinc-600"
                            data-testid="recipes-empty"
                        >
                            {emptyMessage}
                        </div>
                    )}

                    <div className="mt-8" data-testid="recipes-pagination">
                        <Pagination paginated={recipes} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RecipePreview({ recipe }: any) {
    const [imageFailed, setImageFailed] = useState(false);
    const category = normalizeCategory(recipe.category) || "Uncategorized";
    const recipeName = decodeHtmlEntities(recipe.name ?? "Untitled recipe");
    const hasImage = Boolean(recipe.image) && !imageFailed;
    const isFavorited = Boolean(recipe.is_favorited);
    const isMade = Boolean(recipe.is_made);

    function toggleFavorite(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();

        const url = route(
            isFavorited ? "recipes.unfavorite" : "recipes.favorite",
            recipe.id,
        );

        if (isFavorited) {
            router.delete(url, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });

            return;
        }

        router.post(
            url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function toggleMade(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();

        const url = route(
            isMade ? "recipes.unmade" : "recipes.made",
            recipe.id,
        );

        if (isMade) {
            router.delete(url, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });

            return;
        }

        router.post(
            url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <article
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            data-testid={`recipe-card-${recipe.id}`}
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-red-50">
                <button
                    type="button"
                    aria-label={
                        isFavorited
                            ? "Remove from favorites"
                            : "Add to favorites"
                    }
                    onClick={toggleFavorite}
                    data-testid={`recipe-favorite-toggle-${recipe.id}`}
                    className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white/95 text-red-500 shadow-sm transition hover:bg-red-50"
                >
                    <HeartIcon filled={isFavorited} className="h-5 w-5" />
                </button>

                {hasImage ? (
                    <Link href={`/recipe/${recipe.slug}`}>
                        <img
                            src={recipe.image}
                            alt={recipeName}
                            onError={() => setImageFailed(true)}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </Link>
                ) : (
                    <ApplicationLogo color="red" size="w-full" />
                )}

                <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">
                    {category}
                </span>

                <button
                    type="button"
                    aria-label={isMade ? "Mark as not made" : "Mark as made"}
                    onClick={toggleMade}
                    data-testid={`recipe-made-toggle-${recipe.id}`}
                    className={
                        "absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition " +
                        (isMade
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-white/95 text-zinc-600 hover:bg-zinc-100")
                    }
                >
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    Made this
                </button>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex-1">
                    <h3 className="font-serif text-2xl font-semibold text-zinc-900 transition-colors group-hover:text-red-600">
                        <Link href={`/recipe/${recipe.slug}`}>
                            {recipeName}
                        </Link>
                    </h3>
                    <div className="mt-2 text-sm text-zinc-600">
                        {recipe.description}
                    </div>
                </div>

                <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                            <ClockIcon className="h-4 w-4" />
                            <span>{getCookTime(recipe)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <UsersIcon className="h-4 w-4" />
                            <span>{getServings(recipe)} servings</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-sm">
                        <AddedBy recipe={recipe} />
                        <div className="flex items-center gap-2 text-zinc-500">
                            <CommentIcon />
                            {recipe.comments?.length ?? 0}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

function normalizeCategory(value: any): string {
    if (typeof value === "string") {
        return decodeHtmlEntities(value.split(",")[0]?.trim() ?? "");
    }

    return "";
}

function decodeHtmlEntities(value: string): string {
    return value
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">");
}

function getContent(recipe: any): any {
    if (!recipe?.content) {
        return {};
    }

    if (typeof recipe.content === "string") {
        try {
            return JSON.parse(recipe.content);
        } catch {
            return {};
        }
    }

    return recipe.content;
}

function getCookTime(recipe: any): string {
    const content = getContent(recipe);
    const duration = parseDuration(content?.cookTime || content?.prepTime);

    return duration || "Quick";
}

function getServings(recipe: any): string {
    const content = getContent(recipe);
    const yieldValue = content?.recipeYield;

    if (typeof yieldValue === "number") {
        return String(yieldValue);
    }

    if (typeof yieldValue === "string") {
        const match = yieldValue.match(/\d+/);
        return match ? match[0] : yieldValue;
    }

    return "2";
}

function parseDuration(value: any): string {
    if (typeof value !== "string") {
        return "";
    }

    const matches = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
    if (!matches) {
        return value;
    }

    const hours = Number(matches[1] || 0);
    const minutes = Number(matches[2] || 0);

    if (!hours && !minutes) {
        return "";
    }

    if (hours && minutes) {
        return `${hours}h ${minutes}m`;
    }

    if (hours) {
        return `${hours}h`;
    }

    return `${minutes} min`;
}

function SearchIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 5.5 5.5a7.5 7.5 0 0 0 11.15 11.15Z"
            />
        </svg>
    );
}

function ClockIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"
            />
        </svg>
    );
}

function UsersIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.72 9.72 0 0 0-12 0m12 0a12.04 12.04 0 0 1 3 2.13m-15-2.13a12.04 12.04 0 0 0-3 2.13m16.5-9.22a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-13.5 0a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Zm13.5 0a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z"
            />
        </svg>
    );
}

function HeartIcon({
    className = "",
    filled = false,
}: {
    className?: string;
    filled?: boolean;
}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            className={className}
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21.35 10.55 20.03C5.4 15.36 2 12.27 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.77-3.4 6.86-8.55 11.54L12 21.35Z"
            />
        </svg>
    );
}

function CheckCircleIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={className}
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
        </svg>
    );
}
