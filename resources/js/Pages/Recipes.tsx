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
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-t-lg">
                        <div className="flex p-4 gap-4 flex-col">
                            {recipes.data.map((recipe: any, index: any) => (
                                <RecipePreview recipe={recipe} key={index} />
                            ))}
                        </div>
                    </div>
                    <Pagination paginated={recipes} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RecipePreview({ recipe }: any) {
    // return <div>preview</div>;
    // console.log({ preview: recipe });
    // const {
    //     originalLink,
    //     siteLink,
    //     recipeLink,
    //     graph,
    //     jsonRecipe,
    //     name,
    //     description,
    // } = formatRecipe(recipe);
    // console.log({ siteLink, originalLink, name: recipe.name });
    // console.log({ name });

    // console.log({ url: recipe.url, recipe });
    return (
        <div className="bg-white p-4 flex gap-4 rounded-lg">
            <div className="w-72 h-72 flex-shrink-0">
                {recipe.image ? (
                    <Link href={`/${recipe.slug}`}>
                        <img
                            src={recipe.image}
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
                            href={`recipe/${recipe.slug}`}
                            className="text-slate-600 hover:text-slate-800"
                            target="_blank"
                        >
                            {recipe.name}
                        </Link>
                    </div>
                    <ExternalLinkRow
                        name={recipe.site_name}
                        siteLink={recipe.site_domain}
                        // originalLink={originalLink}
                    />
                    <div className="text-xl text-slate-700">
                        {recipe.description}
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <AddedBy recipe={recipe} />
                    <div className="flex items-center gap-2">
                        <CommentIcon />
                        {recipe.comments.length}
                    </div>
                </div>
            </div>
        </div>
    );
}
