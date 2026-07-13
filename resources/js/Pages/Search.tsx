import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import ExternalLinkRow from "@/Components/Recipe/ExternalLinkRow";
import AddedBy from "@/Components/Recipe/AddedBy";
import CommentIcon from "@/Components/Icons/CommentIcon";
import { formatRecipe } from "./recipe-functions";
import Pagination from "./Pagination";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Recipes({
    auth,
    recipes,
}: {
    auth: any;
    recipes: any;
}) {
    const results = recipes?.data?.data ?? [];
    const query = recipes?.data?.query ?? "";

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Search Results
                </h2>
            }
        >
            <Head title="Recipes" />

            <div className="bg-white py-6 sm:py-10" data-testid="search-page">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section
                        className="mb-8 rounded-3xl border border-red-200 bg-gradient-to-br from-red-100 via-rose-50 to-zinc-50 p-8 shadow-sm sm:p-10"
                        data-testid="search-hero"
                    >
                        <h1
                            className="font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl"
                            data-testid="search-title"
                        >
                            Search Results
                        </h1>
                        <p className="mt-3 text-lg text-zinc-600">
                            {query
                                ? `Showing results for "${query}"`
                                : "Showing all matched recipes"}
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-500">
                            {results.length} recipe
                            {results.length === 1 ? "" : "s"} on this page
                        </p>
                    </section>

                    {results.length > 0 ? (
                        <section
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                            data-testid="search-results-grid"
                        >
                            {results.map((recipe: any, index: any) => (
                                <SearchPreview recipe={recipe} key={index} />
                            ))}
                        </section>
                    ) : (
                        <div
                            className="rounded-2xl border border-red-200 bg-white p-8 text-center text-zinc-600"
                            data-testid="search-empty"
                        >
                            No recipes matched that search.
                        </div>
                    )}

                    <div className="mt-8" data-testid="search-pagination">
                        <Pagination paginated={recipes.data} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function SearchPreview({ recipe }: any) {
    const {
        originalLink,
        siteLink,
        recipeLink,
        jsonRecipe,
        name,
        description,
    } = formatRecipe(recipe);

    const imageUrl = getImageUrl(jsonRecipe);
    const category = normalizeCategory(recipe.category) || "Uncategorized";
    const commentCount = recipe.comments?.length ?? 0;

    return (
        <article
            className="group overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            data-testid={`search-card-${recipe.id}`}
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-red-50">
                {imageUrl ? (
                    <Link href={recipeLink}>
                        <img
                            src={imageUrl}
                            alt={recipe.name}
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
                        <Link
                            href={recipeLink}
                            className="text-inherit"
                            target="_blank"
                        >
                            {recipe.name}
                        </Link>
                    </h3>
                    <ExternalLinkRow
                        name={name}
                        siteLink={siteLink}
                        originalLink={originalLink}
                    />
                    <div className="mt-2 text-sm text-zinc-600">
                        {description || recipe.description}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                    <AddedBy recipe={recipe} />
                    <div className="flex items-center gap-2 text-zinc-500">
                        <CommentIcon />
                        {commentCount}
                    </div>
                </div>
            </div>
        </article>
    );
}

function normalizeCategory(value: any): string {
    if (typeof value === "string") {
        return value.split(",")[0]?.trim() ?? "";
    }

    return "";
}

function getImageUrl(jsonRecipe: any): string | null {
    if (
        !jsonRecipe ||
        !Object.prototype.hasOwnProperty.call(jsonRecipe, "image")
    ) {
        return null;
    }

    const image = jsonRecipe.image;

    if (typeof image === "string") {
        return image;
    }

    if (Array.isArray(image)) {
        const firstImage = image[0];

        if (typeof firstImage === "string") {
            return firstImage;
        }

        if (firstImage && typeof firstImage === "object") {
            return firstImage.url ?? firstImage.contentUrl ?? null;
        }

        return null;
    }

    if (image && typeof image === "object") {
        return image.url ?? image.contentUrl ?? null;
    }

    return null;
}
