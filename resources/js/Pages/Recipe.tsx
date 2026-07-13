import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from "@/types";
import ExternalLinkRow from "@/Components/Recipe/ExternalLinkRow";
import Directions from "@/Components/Recipe/Directions";
import Nutrition from "@/Components/Recipe/Nutrition";
import BackIcon from "@/Components/Icons/BackIcon";
import AddedBy from "@/Components/Recipe/AddedBy";
import { formatRecipe } from "./recipe-functions";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Recipe({ auth, recipe }: any) {
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
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <Link href="/recipes">
                                                    <BackIcon />
                                                </Link>
                                            </div>

                                            <div className="text-2xl font-medium">
                                                {recipe.name}{" "}
                                            </div>
                                            <AddedBy recipe={recipe} />
                                        </div>
                                    </div>

                                    <ExternalLinkRow
                                        name={recipe.name}
                                        siteLink={
                                            recipe.site_link ||
                                            recipe.site_domain
                                        }
                                        originalLink={recipe.url}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                    <div className="sm:w-3/5">
                                        <div className="flex gap-8">
                                            <div className="w-72 h-72">
                                                <RecipeImage
                                                    json={{
                                                        image: [recipe.image],
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-shrink w-1/2">
                                                <ul className="list-disc">
                                                    {recipe.ingredients.map(
                                                        toLiElement,
                                                    )}
                                                </ul>
                                            </div>
                                        </div>

                                        <Directions recipe={recipe} />
                                    </div>
                                    <div className="sm:w-1/3">
                                        {recipe.nutrition !== "" && (
                                            <Nutrition recipe={recipe} />
                                        )}
                                        <div className="mt-8 bg-slate-100 rounded-lg">
                                            <Comments
                                                comments={recipe.comments}
                                            />
                                        </div>
                                        <div className="mt-4">
                                            <CommentInput
                                                auth={auth}
                                                recipe={recipe}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RecipeImage({ json }: { json: any }) {
    if (json.hasOwnProperty("image")) {
        return (
            <img
                src={
                    typeof json.image[0] === "string"
                        ? json.image[0]
                        : json.image[0].url
                }
                alt=""
                className="w-full h-full object-cover"
            />
        );
    }
    return <ApplicationLogo color="orange" size="w-full" />;
}

function toLiElement(item: any, index: any) {
    return (
        <li key={index} className="flex-shrink">
            {item}
        </li>
    );
}

function Comment({ comment }: any) {
    let date = new Date(comment.created_at);
    return (
        <div className="odd:bd-slate-100 even:bg-white px-4 py-1.5 ">
            {/* <CommentImage /> */}

            <div className="flex items-center gap-8 justify-between">
                <h4 className="text-base text-slate-600">
                    {comment.commentator.name}
                </h4>
                <div className="text-slate-500 text-sm">
                    {/* {readableDateTime(date)} */}
                </div>
            </div>
            <p className="mt-1 text-slate-800 text-lg">{comment.comment}</p>
        </div>
    );
}

function CommentImage() {
    return (
        <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
            <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 200 200"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="h-16 w-16 border border-gray-300 bg-white text-gray-300"
            >
                <path
                    d="M0 0l200 200M0 200L200 0"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    );
}

function Comments({ comments }: any) {
    return (
        <div className="flex flex-col ">
            {comments.map((comment: any) => (
                <Comment key={comment.id} comment={comment} />
            ))}
        </div>
    );
}

function CommentInput({ auth, recipe }: any) {
    const [values, setValues] = useState({
        user_id: auth.user.id,
        comment: "",
    });

    function handleChange(e: any) {
        const key = e.target.id;
        const value = e.target.value;
        setValues((values) => ({
            ...values,
            [key]: value,
        }));
    }

    async function handleSubmit(e: any) {
        e.preventDefault();
        let response = await router.post(
            `/comment/new-recipe/${recipe.id}`,
            values,
        );

        setValues((prev) => ({ ...prev, comment: "" }));
    }
    return (
        <form onSubmit={handleSubmit}>
            <textarea
                id="comment"
                onChange={handleChange}
                className="w-full border border-slate-300 rounded"
                value={values.comment}
            />
            <button type="submit" className="bg-slate-200 px-3 py-1 rounded-md">
                Comment
            </button>
        </form>
    );
}

// function readableDateTime(date: Date): string {
//     let readable = null;

//     let formatDate = {
//         // weekday: "short",

//         month: "short",
//         day: "numeric",
//         year: "numeric",
//         // year: "short",
//     };

//     if (date.getFullYear() !== new Date().getFullYear()) {
//         formatDate.year = "2-digit";
//     }

//     readable = date.toLocaleDateString(undefined, formatDate);
//     readable += " at ";
//     readable += date.toLocaleTimeString(undefined, {
//         hour: "2-digit",
//         minute: "2-digit",
//     });
//     return readable;
// }
