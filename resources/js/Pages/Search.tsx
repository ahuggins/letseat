import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
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

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-t-lg">
                        <div className="flex p-4 gap-4 flex-col">
                            {results.length > 0 ? (
                                results.map(
                                    (recipe: any, index: any) => (
                                        <SearchPreview
                                            recipe={recipe}
                                            key={index}
                                        />
                                    ),
                                )
                            ) : (
                                <div className="text-white">
                                    No Recipes matched the searched Term
                                </div>
                            )}
                        </div>
                    </div>
                    <Pagination paginated={recipes.data} />
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
        graph,
        jsonRecipe,
        name,
        description,
    } = formatRecipe(recipe);

    const imageUrl = getImageUrl(jsonRecipe);

    return (
        <div className="bg-white p-4 flex gap-4 rounded-lg">
            <div className="w-32 h-32 flex-shrink-0">
                {imageUrl ? (
                    <Link href={recipeLink}>
                        <img
                            src={imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    </Link>
                ) : (
                    <ApplicationLogo color="orange" size="w-full" />
                )}
            </div>
            <div className="flex flex-col justify-between">
                <div>
                    <div className="text-2xl font-medium">
                        <Link
                            href={recipeLink}
                            className="text-slate-600 hover:text-slate-800"
                            target="_blank"
                        >
                            {recipe.name}
                        </Link>
                    </div>
                    <ExternalLinkRow
                        name={name}
                        siteLink={siteLink}
                        originalLink={originalLink}
                    />
                    <div className="text-xl text-slate-700">{description}</div>
                </div>
            </div>
        </div>
    );
}

function getImageUrl(jsonRecipe: any): string | null {
    if (!jsonRecipe || !Object.prototype.hasOwnProperty.call(jsonRecipe, "image")) {
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
