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
        await router.post("/recipe", values);
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

            <div className="bg-white py-6 sm:py-10">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <section className="mb-6 rounded-3xl border border-red-200 bg-gradient-to-br from-red-100 via-rose-50 to-zinc-50 p-8 shadow-sm sm:p-10">
                        <h1 className="font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                            Add a New Recipe
                        </h1>
                        <p className="mt-3 max-w-2xl text-lg text-zinc-600">
                            Paste a recipe URL and LetsEat will scrape and save
                            it to your shared recipe library.
                        </p>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="url"
                                    className="mb-2 block text-sm font-medium text-zinc-700"
                                >
                                    Recipe URL
                                </label>
                                <input
                                    onChange={handleChange}
                                    id="url"
                                    value={values.url}
                                    className="h-11 w-full rounded-xl border border-red-200 bg-red-50 px-4 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                    placeholder="https://example.com/recipe"
                                />
                            </div>

                            <div className="flex items-center justify-end">
                                <button
                                    className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                                    type="submit"
                                >
                                    Import Recipe
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
