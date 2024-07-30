import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import ExternalLinkRow from "@/Components/Recipe/ExternalLinkRow";
import Directions from "@/Components/Recipe/Directions";
import Nutrition from "@/Components/Recipe/Nutrition";
import BackIcon from "@/Components/Icons/BackIcon";
import AddedBy from "@/Components/Recipe/AddedBy";

export default function Recipe({ auth, recipe }: PageProps) {
    const originalLink = recipe.content["@graph"][1]["@id"];
    const siteLink = recipe.content["@graph"][4].url;
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {recipe.name}
                </h2>
            }
        >
            <Head title={recipe.name} />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg ">
                        <div className="flex p-4 gap-4 flex-col">
                            <div className="bg-white p-4 rounded-lg">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <Link href="/recipes">
                                                <BackIcon />
                                            </Link>
                                        </div>

                                        <div className="text-2xl font-medium">
                                            {recipe.name}
                                        </div>
                                    </div>

                                    <ExternalLinkRow
                                        recipe={recipe}
                                        siteLink={siteLink}
                                        originalLink={originalLink}
                                    />
                                </div>
                                <div className="flex gap-8">
                                    <div className="w-72 h-72">
                                        <img
                                            src={
                                                recipe.content["@graph"][6]
                                                    .image[0]
                                            }
                                            alt=""
                                        />
                                    </div>

                                    <div>
                                        <Nutrition recipe={recipe} />
                                    </div>
                                </div>
                                <AddedBy recipe={recipe} />
                                <div>
                                    <ul>
                                        {recipe.ingredients.map((item) => (
                                            <div>{item}</div>
                                        ))}
                                    </ul>
                                </div>
                                <Directions recipe={recipe} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
