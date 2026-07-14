import React, { useEffect, useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from "@/types";

type ImportedRecipePreview = {
    id: number;
    slug?: string | null;
    name: string;
    site_name?: string | null;
    site_domain?: string | null;
    image?: string | null;
    category?: string | null;
    cuisine?: string | null;
    ingredient_count?: number;
    cook_time?: string | null;
};

export default function AddRecipe({
    auth,
    importedRecipe,
}: PageProps & {
    importedRecipe?: ImportedRecipePreview | null;
}) {
    const [values, setValues] = useState({
        url: "",
        user_id: auth.user.id,
        email: "",
    });
    const [importState, setImportState] = useState<
        "idle" | "importing" | "success" | "error"
    >(importedRecipe ? "success" : "idle");
    const [statusNote, setStatusNote] = useState(
        importedRecipe ? "Recipe imported successfully." : "",
    );
    const [previewState, setPreviewState] = useState<
        "idle" | "loading" | "ready" | "error"
    >(importedRecipe ? "ready" : "idle");
    const [previewNote, setPreviewNote] = useState("");
    const [previewRecipe, setPreviewRecipe] =
        useState<ImportedRecipePreview | null>(importedRecipe ?? null);

    const sourceHost = useMemo(() => {
        try {
            const parsed = new URL(values.url.trim());
            return parsed.hostname.replace(/^www\./, "");
        } catch {
            return "";
        }
    }, [values.url]);

    useEffect(() => {
        if (!importedRecipe) {
            return;
        }

        setPreviewRecipe(importedRecipe);
        setPreviewState("ready");
        setPreviewNote("");
    }, [importedRecipe]);

    useEffect(() => {
        const trimmedUrl = values.url.trim();

        if (!trimmedUrl) {
            return;
        }

        try {
            new URL(trimmedUrl);
        } catch {
            setPreviewState("idle");
            setPreviewNote("");
            return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(async () => {
            setPreviewState("loading");
            setPreviewNote("Fetching preview from source...");

            try {
                const csrf = (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement | null
                )?.content;

                const response = await fetch("/recipe/preview", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        ...(csrf ? { "X-CSRF-TOKEN": csrf } : {}),
                    },
                    body: JSON.stringify({ url: trimmedUrl }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const errorData = (await response
                        .json()
                        .catch(() => ({}))) as { message?: string };
                    throw new Error(
                        errorData.message || "Preview request failed",
                    );
                }

                const data = (await response.json()) as {
                    preview?: ImportedRecipePreview;
                };

                setPreviewRecipe(data.preview ?? null);
                setPreviewState(data.preview ? "ready" : "idle");
                setPreviewNote("");
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                setPreviewRecipe(null);
                setPreviewState("error");
                setPreviewNote(
                    error instanceof Error
                        ? error.message
                        : "Could not fetch preview for this URL. You can still try importing.",
                );
            }
        }, 500);

        return () => {
            controller.abort();
            window.clearTimeout(timeoutId);
        };
    }, [values.url]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const key = e.target.id;
        const value = e.target.value;
        setValues((values) => ({
            ...values,
            [key]: value,
        }));

        if (key === "url") {
            setPreviewRecipe(null);
            setPreviewState("idle");
            setPreviewNote("");
        }

        if (importState === "error" || importState === "success") {
            setImportState("idle");
            setStatusNote("");
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!values.url.trim()) {
            setImportState("error");
            setStatusNote("Paste a recipe URL to start importing.");
            return;
        }

        router.post("/recipe", values, {
            preserveScroll: true,
            onStart: () => {
                setImportState("importing");
                setStatusNote("Fetching recipe data and parsing content...");
            },
            onSuccess: () => {
                setImportState("success");
                setStatusNote("Recipe imported successfully.");
            },
            onError: () => {
                setImportState("error");
                setStatusNote(
                    "We could not import that URL. Try another recipe link.",
                );
            },
        });
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

            <div
                className="bg-white py-6 sm:py-10"
                data-testid="add-recipe-page"
            >
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <section
                        className="mb-6 rounded-3xl border border-red-200 bg-gradient-to-br from-red-100 via-rose-50 to-zinc-50 p-8 shadow-sm sm:p-10"
                        data-testid="add-recipe-hero"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                            Recipe Import
                        </p>
                        <h1
                            className="mt-1 font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl"
                            data-testid="add-recipe-title"
                        >
                            Add a New Recipe
                        </h1>
                        <p className="mt-3 max-w-2xl text-lg text-zinc-600">
                            Found a great recipe on the internet and want to
                            reference it later? Paste the recipe URL and LetsEat
                            will scrape and save it to your shared recipe
                            library.
                        </p>
                    </section>

                    <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
                        <section
                            className="overflow-hidden rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3"
                            data-testid="add-recipe-form-section"
                        >
                            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-red-200 bg-red-50/60 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                                        Step 1
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-zinc-800">
                                        Paste recipe URL
                                    </p>
                                </div>
                                <div className="rounded-xl border border-red-200 bg-red-50/60 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                                        Step 2
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-zinc-800">
                                        LetsEat parses details
                                    </p>
                                </div>
                                <div className="rounded-xl border border-red-200 bg-red-50/60 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                                        Step 3
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-zinc-800">
                                        Recipe lands in library
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                                data-testid="add-recipe-form"
                            >
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
                                        data-testid="add-recipe-url-input"
                                        className="h-11 w-full rounded-xl border border-red-200 bg-red-50 px-4 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                        placeholder="https://example.com/recipe"
                                    />
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                                            Typical import: 3-10 seconds
                                        </span>
                                        <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                                            Public recipe URLs work best
                                        </span>
                                        <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                                            We never post back to source sites
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <button
                                        className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                                        type="submit"
                                        data-testid="add-recipe-submit"
                                        disabled={importState === "importing"}
                                    >
                                        {importState === "importing"
                                            ? "Importing..."
                                            : "Import Recipe from URL"}
                                    </button>
                                </div>
                            </form>

                            {statusNote ? (
                                <div
                                    className={`mt-4 rounded-xl border p-3 text-sm ${
                                        importState === "success"
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                            : importState === "error"
                                              ? "border-amber-200 bg-amber-50 text-amber-800"
                                              : "border-red-200 bg-red-50 text-zinc-700"
                                    }`}
                                    data-testid="add-recipe-status-strip"
                                >
                                    {statusNote}
                                </div>
                            ) : null}
                        </section>

                        <aside
                            className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm lg:col-span-2"
                            data-testid="add-recipe-preview-panel"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                                Import Preview
                            </p>
                            <h2 className="mt-1 font-serif text-2xl font-semibold text-zinc-900">
                                {previewRecipe
                                    ? "Imported Recipe"
                                    : "What we will pull in"}
                            </h2>

                            {previewState === "loading" ? (
                                <p className="mt-2 text-sm text-zinc-600">
                                    {previewNote}
                                </p>
                            ) : null}

                            {previewState === "error" ? (
                                <p className="mt-2 text-sm text-amber-700">
                                    {previewNote}
                                </p>
                            ) : null}

                            {previewRecipe ? (
                                <div className="mt-4 space-y-4">
                                    {previewRecipe.image ? (
                                        <div className="overflow-hidden rounded-xl border border-red-200 bg-red-50/40">
                                            <img
                                                src={previewRecipe.image}
                                                alt={previewRecipe.name}
                                                className="h-40 w-full object-cover"
                                            />
                                        </div>
                                    ) : null}

                                    <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                                            Imported from
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-zinc-800">
                                            {previewRecipe.site_name ||
                                                previewRecipe.site_domain ||
                                                sourceHost ||
                                                "Unknown source"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-base font-semibold text-zinc-900">
                                            {previewRecipe.name}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-700">
                                            {previewRecipe.category ? (
                                                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1">
                                                    {previewRecipe.category}
                                                </span>
                                            ) : null}
                                            {previewRecipe.cuisine ? (
                                                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1">
                                                    {previewRecipe.cuisine}
                                                </span>
                                            ) : null}
                                            {previewRecipe.ingredient_count ? (
                                                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1">
                                                    {
                                                        previewRecipe.ingredient_count
                                                    }{" "}
                                                    ingredients
                                                </span>
                                            ) : null}
                                            {previewRecipe.cook_time ? (
                                                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1">
                                                    {previewRecipe.cook_time}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    {previewRecipe.slug ? (
                                        <div className="pt-1">
                                            <Link
                                                href={route(
                                                    "recipe",
                                                    previewRecipe.slug,
                                                )}
                                                className="inline-flex rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                                            >
                                                Open imported recipe
                                            </Link>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <>
                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50/50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                                            Source
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-zinc-800">
                                            {sourceHost || "No URL entered yet"}
                                        </p>
                                    </div>

                                    <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                                        <li className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                                            Recipe title and image
                                        </li>
                                        <li className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                                            Ingredient list
                                        </li>
                                        <li className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                                            Directions and cook-time details
                                        </li>
                                        <li className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                                            Category and cuisine metadata (if
                                            available)
                                        </li>
                                    </ul>
                                </>
                            )}
                        </aside>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
