import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { PageProps } from "@/types";

export default function AddRecipe({ auth }: PageProps) {
    const [values, setValues] = useState({
        url: "",
        user_id: auth.user.id,
        email: "",
    });

    function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value;
        setValues((values) => ({
            ...values,
            [key]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        let response = await router.post("/recipe", values);
        console.log({ response });
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    AddRecipe
                </h2>
            }
        >
            <Head title="Add Recipe" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            Add a recipe, provide the url below!
                        </div>
                        <div className="">
                            <form
                                onSubmit={handleSubmit}
                                className="flex p-4 flex-col gap-3"
                            >
                                <input
                                    onChange={handleChange}
                                    id="url"
                                    className="rounded-xl w-full"
                                    placeholder="Enter url you want to save"
                                />

                                <button
                                    className="bg-red-500 p-3 block text-red-100"
                                    type="submit"
                                >
                                    Add it!
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
