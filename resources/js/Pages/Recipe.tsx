import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ExternalLinkRow from "@/Components/Recipe/ExternalLinkRow";
import Directions from "@/Components/Recipe/Directions";
import Nutrition from "@/Components/Recipe/Nutrition";
import BackIcon from "@/Components/Icons/BackIcon";
import AddedBy from "@/Components/Recipe/AddedBy";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Recipe({ auth, recipe, privateNotes = [] }: any) {
    const recipeName = decodeHtmlEntities(recipe.name || "");
    const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
        : [];
    const category = normalizeCategory(recipe.category);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {recipeName}
                </h2>
            }
        >
            <Head title={recipeName} />

            <div className="bg-white py-6 sm:py-10" data-testid="recipe-page">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <Link
                            href="/recipes"
                            data-testid="recipe-back-link"
                            className="inline-flex items-center gap-2 rounded-full border border-red-300/80 bg-white/85 px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm backdrop-blur transition-colors hover:bg-red-50 hover:text-red-900"
                        >
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700 ring-1 ring-red-200">
                                <BackIcon className="size-4" />
                            </span>
                            Back to recipes
                        </Link>

                        <AddedBy recipe={recipe} />
                    </div>

                    <section
                        className="relative mb-6 overflow-hidden rounded-3xl border border-red-200/80 bg-gradient-to-br from-red-100 via-rose-50 to-amber-50 p-6 shadow-sm sm:p-10"
                        data-testid="recipe-hero"
                    >
                        <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-red-200/45 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl" />

                        <div className="relative flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-4xl">
                                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                                        Recipe
                                    </p>

                                    {category && (
                                        <span
                                            className="inline-flex rounded-full border border-red-200 bg-red-500 px-3 py-1 text-xs font-medium text-white shadow-sm"
                                            data-testid="recipe-category"
                                        >
                                            {category}
                                        </span>
                                    )}
                                </div>

                                <h1
                                    className="font-serif text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl"
                                    data-testid="recipe-title"
                                >
                                    {recipeName}
                                </h1>

                                <div
                                    className="relative mt-4"
                                    data-testid="recipe-external-links"
                                >
                                    <ExternalLinkRow
                                        name={recipe.site_name || recipeName}
                                        siteLink={
                                            recipe.site_link ||
                                            recipe.site_domain
                                        }
                                        originalLink={recipe.url}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        className="grid gap-6 lg:grid-cols-3"
                        data-testid="recipe-content-grid"
                    >
                        <div className="space-y-6 lg:col-span-2">
                            <div
                                className="overflow-hidden rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:p-6"
                                data-testid="recipe-ingredients-section"
                            >
                                <div className="grid gap-6 md:grid-cols-[320px_minmax(0,1fr)]">
                                    <div className="h-80 overflow-hidden rounded-xl bg-red-50">
                                        <RecipeImage
                                            image={recipe.image}
                                            name={recipeName}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-serif text-2xl font-semibold text-zinc-900">
                                            Ingredients
                                        </h2>

                                        {ingredients.length > 0 ? (
                                            <ul
                                                className="mt-4 space-y-2 text-zinc-700"
                                                data-testid="recipe-ingredients-list"
                                            >
                                                {ingredients.map(toLiElement)}
                                            </ul>
                                        ) : (
                                            <p className="mt-4 text-sm text-zinc-500">
                                                Ingredients are not available
                                                for this recipe yet.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div
                                className="overflow-hidden rounded-2xl border border-red-200 bg-white p-6 shadow-sm"
                                data-testid="recipe-directions-section"
                            >
                                <h2 className="mb-2 font-serif text-2xl font-semibold text-zinc-900">
                                    Directions
                                </h2>
                                <div className="text-zinc-700">
                                    <Directions recipe={recipe} />
                                </div>
                            </div>

                            <PrivateNotesSection
                                auth={auth}
                                recipe={recipe}
                                privateNotes={privateNotes}
                            />
                        </div>

                        <div className="space-y-6">
                            <div data-testid="recipe-nutrition-section">
                                {recipe.nutrition !== "" ? (
                                    <Nutrition recipe={recipe} />
                                ) : (
                                    <p className="text-sm text-zinc-500">
                                        Nutrition info unavailable.
                                    </p>
                                )}
                            </div>

                            <div
                                className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm"
                                data-testid="recipe-comments-section"
                            >
                                <div className="border-b border-red-100 px-5 py-4">
                                    <h3 className="font-serif text-xl font-semibold text-zinc-900">
                                        Comments
                                    </h3>
                                </div>
                                <Comments comments={recipe.comments || []} />
                                <div className="border-t border-red-100 p-4">
                                    <CommentInput auth={auth} recipe={recipe} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function decodeHtmlEntities(value: string): string {
    if (!value || typeof document === "undefined") {
        return value;
    }

    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;

    return textarea.value;
}

function RecipeImage({ image, name }: { image: any; name: string }) {
    if (image) {
        return (
            <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
            />
        );
    }

    return <ApplicationLogo color="red" size="w-full" />;
}

function toLiElement(item: any, index: any) {
    return (
        <li key={index} className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
            {item}
        </li>
    );
}

function Comment({ comment }: any) {
    return (
        <div
            className="border-b border-red-100 px-4 py-3 last:border-b-0"
            data-testid={`recipe-comment-${comment.id}`}
        >
            <div className="flex items-center justify-between gap-4">
                <h4 className="text-sm font-medium text-zinc-700">
                    {comment.commentator.name}
                </h4>
            </div>
            <p className="mt-1 text-zinc-800">{comment.comment}</p>
        </div>
    );
}

function Comments({ comments }: any) {
    if (!comments.length) {
        return (
            <div
                className="px-4 py-6 text-sm text-zinc-500"
                data-testid="recipe-comments-empty"
            >
                No comments yet. Be the first to leave one.
            </div>
        );
    }

    return (
        <div className="flex flex-col" data-testid="recipe-comments-list">
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
        setValues((prev: any) => ({
            ...prev,
            [key]: value,
        }));
    }

    async function handleSubmit(e: any) {
        e.preventDefault();
        await router.post(`/comment/new-recipe/${recipe.id}`, values);

        setValues((prev) => ({ ...prev, comment: "" }));
    }

    return (
        <form onSubmit={handleSubmit} data-testid="recipe-comment-form">
            <textarea
                id="comment"
                onChange={handleChange}
                data-testid="recipe-comment-input"
                className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Add your comment"
                value={values.comment}
            />
            <button
                type="submit"
                data-testid="recipe-comment-submit"
                className="mt-3 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
                Comment
            </button>
        </form>
    );
}

function PrivateNotesSection({ auth, recipe, privateNotes }: any) {
    const [values, setValues] = useState({
        user_id: auth.user.id,
        note: "",
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingNote, setEditingNote] = useState("");

    async function handleCreate(e: any) {
        e.preventDefault();

        if (!values.note.trim()) {
            return;
        }

        await router.post(
            `/recipes/${recipe.id}/private-notes`,
            { note: values.note },
            {
                preserveScroll: true,
            },
        );

        setValues((prev) => ({ ...prev, note: "" }));
    }

    async function handleSaveEdit(noteId: number) {
        if (!editingNote.trim()) {
            return;
        }

        await router.patch(
            `/recipes/${recipe.id}/private-notes/${noteId}`,
            {
                note: editingNote,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingId(null);
                    setEditingNote("");
                },
            },
        );
    }

    async function handleDelete(noteId: number) {
        await router.delete(`/recipes/${recipe.id}/private-notes/${noteId}`, {
            preserveScroll: true,
        });
    }

    return (
        <div
            className="overflow-hidden rounded-2xl border border-red-200 bg-white p-6 shadow-sm"
            data-testid="recipe-private-notes-section"
        >
            <div className="mb-4">
                <h2 className="font-serif text-2xl font-semibold text-zinc-900">
                    Private Notes
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                    Only you can see these notes.
                </p>
            </div>

            {privateNotes.length ? (
                <div
                    className="mb-5 space-y-3"
                    data-testid="recipe-private-notes-list"
                >
                    {privateNotes.map((note: any) => {
                        const isEditing = editingId === note.id;

                        return (
                            <div
                                key={note.id}
                                className="rounded-xl border border-red-100 bg-red-50/30 p-4"
                                data-testid={`recipe-private-note-${note.id}`}
                            >
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                    <p
                                        className="text-xs font-medium text-zinc-600"
                                        data-testid={`recipe-private-note-timestamp-${note.id}`}
                                    >
                                        {formatTimestamp(note.created_at)}
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingId(note.id);
                                                setEditingNote(note.note || "");
                                            }}
                                            className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                            data-testid={`recipe-private-note-edit-${note.id}`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(note.id)
                                            }
                                            className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                            data-testid={`recipe-private-note-delete-${note.id}`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div>
                                        <textarea
                                            value={editingNote}
                                            onChange={(e) =>
                                                setEditingNote(e.target.value)
                                            }
                                            className="min-h-24 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                            data-testid={`recipe-private-note-edit-input-${note.id}`}
                                        />
                                        <div className="mt-3 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSaveEdit(note.id)
                                                }
                                                className="rounded-full bg-red-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600"
                                                data-testid={`recipe-private-note-edit-save-${note.id}`}
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditingNote("");
                                                }}
                                                className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-red-100"
                                                data-testid={`recipe-private-note-edit-cancel-${note.id}`}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="markdown-note text-sm leading-6 text-zinc-800"
                                        data-testid={`recipe-private-note-body-${note.id}`}
                                    >
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                        >
                                            {note.note || ""}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div
                    className="mb-5 text-sm text-zinc-500"
                    data-testid="recipe-private-notes-empty"
                >
                    No private notes yet.
                </div>
            )}

            <form
                onSubmit={handleCreate}
                data-testid="recipe-private-note-form"
            >
                <textarea
                    id="note"
                    onChange={(e) =>
                        setValues((prev) => ({ ...prev, note: e.target.value }))
                    }
                    data-testid="recipe-private-note-input"
                    className="min-h-28 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="Write a private note in Markdown"
                    value={values.note}
                />
                <button
                    type="submit"
                    data-testid="recipe-private-note-submit"
                    className="mt-3 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                >
                    Save note
                </button>
            </form>
        </div>
    );
}

function formatTimestamp(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function normalizeCategory(value: any): string {
    if (typeof value === "string") {
        return value.split(",")[0]?.trim() ?? "";
    }

    return "";
}
