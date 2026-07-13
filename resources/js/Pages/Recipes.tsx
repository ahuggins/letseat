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
    filters,
}: {
    auth: any;
    recipes: any;
    categories: string[];
    filters: { q?: string; category?: string; user?: string | null };
}) {
    const [searchQuery, setSearchQuery] = useState(filters?.q ?? "");
    const [activeCategory, setActiveCategory] = useState(
        filters?.category ?? "All",
    );

    const recipeList = recipes?.data ?? [];
    const categories = useMemo(() => {
        const list = Array.isArray(categoryOptions)
            ? categoryOptions.filter(Boolean)
            : [];
        return ["All", ...list];
    }, [categoryOptions]);

    useEffect(() => {
        setSearchQuery(filters?.q ?? "");
        setActiveCategory(filters?.category ?? "All");
    }, [filters?.q, filters?.category]);

    useEffect(() => {
        const currentQuery = filters?.q ?? "";

        if (searchQuery === currentQuery) {
            return;
        }

        const timeout = window.setTimeout(() => {
            visitWithFilters(searchQuery, activeCategory);
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [searchQuery]);

    function visitWithFilters(nextQuery: string, nextCategory: string) {
        const params: Record<string, string> = {};

        const q = nextQuery.trim();
        if (q) {
            params.q = q;
        }

        if (nextCategory && nextCategory !== "All") {
            params.category = nextCategory;
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
        visitWithFilters(searchQuery, category);
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Recipes
                </h2>
            }
        >
            <Head title="Recipes" />

            <div className="bg-white py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section className="mb-10 rounded-3xl border border-red-200 bg-gradient-to-br from-red-100 via-rose-50 to-zinc-50 p-8 shadow-sm sm:p-10">
                        <h1 className="font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                            Discover Delicious Recipes
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
                                    placeholder="Search recipes..."
                                    className="h-11 w-full rounded-full border border-red-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <div className="max-w-sm">
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
                    </section>

                    {recipeList.length > 0 ? (
                        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {recipeList.map((recipe: any) => (
                                <RecipePreview
                                    recipe={recipe}
                                    key={recipe.id}
                                />
                            ))}
                        </section>
                    ) : (
                        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center text-zinc-600">
                            No recipes matched your filters.
                        </div>
                    )}

                    <div className="mt-8">
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

    return (
        <article className="group overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative aspect-[4/3] overflow-hidden bg-red-50">
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
            </div>

            <div className="p-5">
                <div>
                    <h3 className="font-serif text-2xl font-semibold text-zinc-900 transition-colors group-hover:text-red-600">
                        <Link href={`/recipe/${recipe.slug}`}>
                            {recipeName}
                        </Link>
                    </h3>
                    <div className="mt-2 text-sm text-zinc-600">
                        {recipe.description}
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4" />
                        <span>{getCookTime(recipe)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <UsersIcon className="h-4 w-4" />
                        <span>{getServings(recipe)} servings</span>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                    <AddedBy recipe={recipe} />
                    <div className="flex items-center gap-2 text-zinc-500">
                        <CommentIcon />
                        {recipe.comments?.length ?? 0}
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
