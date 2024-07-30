import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import ExternalLinkRow from "@/Components/Recipe/ExternalLinkRow";
import AddedBy from "@/Components/Recipe/AddedBy";

export default function Recipes({ auth, recipes }: PageProps) {
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

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="flex p-4 gap-4 flex-col">
                            {recipes.map((recipe, index) => (
                                <RecipePreview recipe={recipe} key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RecipePreview({ recipe }) {
    const originalLink = recipe.content["@graph"][1]["@id"];
    const siteLink = recipe.content["@graph"][4].url;
    const recipeLink = `/recipe/${recipe.id}`;
    return (
        <div className="bg-white p-4 flex gap-4 rounded-lg">
            <div className="w-72 h-72 flex-shrink-0">
                <Link href={recipeLink}>
                    <img src={recipe.content["@graph"][6].image[1]} alt="" />
                </Link>
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
                        recipe={recipe}
                        siteLink={siteLink}
                        originalLink={originalLink}
                    />
                    <div className="text-xl text-slate-700">
                        {recipe.content["@graph"][1].description}
                    </div>
                </div>
                <div>
                    <AddedBy recipe={recipe} />
                </div>
            </div>
        </div>
    );
}
