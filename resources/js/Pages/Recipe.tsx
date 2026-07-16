import React, { useEffect, useRef, useState } from "react";
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

export default function Recipe({
    auth,
    recipe,
    privateNotes = [],
    sharedNotes = [],
    isSharingNotes = false,
}: any) {
    const wakeLockRef = useRef<any>(null);
    const [isCookModeEnabled, setIsCookModeEnabled] = useState(false);
    const [cookModeMessage, setCookModeMessage] = useState("");

    const recipeName = decodeHtmlEntities(recipe.name || "");
    const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
        : [];
    const category = normalizeCategory(recipe.category);

    useEffect(() => {
        let cancelled = false;

        const wakeLockNavigator = navigator as Navigator & {
            wakeLock?: {
                request: (type: "screen") => Promise<any>;
            };
        };

        const releaseWakeLock = async () => {
            if (!wakeLockRef.current) {
                return;
            }

            try {
                await wakeLockRef.current.release();
            } catch {
                // No action needed if already released by browser.
            } finally {
                wakeLockRef.current = null;
            }
        };

        const requestWakeLock = async () => {
            if (!wakeLockNavigator.wakeLock) {
                setCookModeMessage(
                    "Cook Mode is on, but this browser cannot prevent screen sleep.",
                );

                return;
            }

            try {
                const sentinel =
                    await wakeLockNavigator.wakeLock.request("screen");

                if (cancelled) {
                    await sentinel.release();

                    return;
                }

                wakeLockRef.current = sentinel;
                setCookModeMessage("Cook Mode is keeping your screen awake.");
            } catch {
                setCookModeMessage(
                    "Cook Mode could not keep your screen awake. Try turning off Low Power Mode.",
                );
            }
        };

        const handleVisibilityChange = async () => {
            if (!isCookModeEnabled) {
                return;
            }

            if (document.visibilityState === "visible") {
                await requestWakeLock();
            } else {
                await releaseWakeLock();
            }
        };

        if (isCookModeEnabled) {
            requestWakeLock();
            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        } else {
            setCookModeMessage("");
            releaseWakeLock();
        }

        return () => {
            cancelled = true;
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            releaseWakeLock();
        };
    }, [isCookModeEnabled]);

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

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsCookModeEnabled((current) => !current)
                                }
                                aria-pressed={isCookModeEnabled}
                                title={
                                    isCookModeEnabled
                                        ? "Cook Mode is keeping your screen awake."
                                        : "Turn on Cook Mode to keep your screen awake."
                                }
                                data-testid="recipe-cook-mode-toggle"
                                className="inline-flex items-center gap-2 rounded-full border border-red-300/80 bg-white/85 px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm backdrop-blur transition-colors hover:bg-red-50 hover:text-red-900"
                            >
                                <span
                                    className={`inline-flex h-2.5 w-2.5 rounded-full ${
                                        isCookModeEnabled
                                            ? "bg-emerald-500"
                                            : "bg-zinc-400"
                                    }`}
                                />
                                Cook Mode
                            </button>

                            <AddedBy recipe={recipe} />
                        </div>
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
                                sharedNotes={sharedNotes}
                                isSharingNotes={isSharingNotes}
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

function PrivateNotesSection({
    auth,
    recipe,
    privateNotes,
    sharedNotes,
    isSharingNotes,
}: any) {
    const [values, setValues] = useState({
        user_id: auth.user.id,
        note: "",
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingNote, setEditingNote] = useState("");
    const [notesFilter, setNotesFilter] = useState<"all" | "mine" | "shared">(
        "all",
    );
    const notesForDisplay = [
        ...privateNotes.map((note: any) => ({
            ...note,
            _source: "mine",
            _ownerLabel: "You",
        })),
        ...sharedNotes.map((note: any) => ({
            ...note,
            _source: "shared",
            _ownerLabel: note.user?.name || "Unknown user",
        })),
    ].sort(
        (a: any, b: any) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const filteredNotes = notesForDisplay.filter((note: any) => {
        if (notesFilter === "mine") {
            return note._source === "mine";
        }

        if (notesFilter === "shared") {
            return note._source === "shared";
        }

        return true;
    });

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
                    Notes
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                    {isSharingNotes
                        ? "Notes are shown in time order. You are sharing your notes with users from your profile settings."
                        : "Notes are shown in time order. Shared notes from others will appear here too."}
                </p>
            </div>

            <div
                className="mb-4 flex flex-wrap items-center gap-2"
                data-testid="recipe-notes-filter"
            >
                <button
                    type="button"
                    onClick={() => setNotesFilter("all")}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        notesFilter === "all"
                            ? "border-red-200 bg-red-50 text-red-800"
                            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                    data-testid="recipe-notes-filter-all"
                >
                    All notes
                </button>
                <button
                    type="button"
                    onClick={() => setNotesFilter("mine")}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        notesFilter === "mine"
                            ? "border-red-200 bg-red-50 text-red-800"
                            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                    data-testid="recipe-notes-filter-mine"
                >
                    Mine
                </button>
                <button
                    type="button"
                    onClick={() => setNotesFilter("shared")}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        notesFilter === "shared"
                            ? "border-red-200 bg-red-50 text-red-800"
                            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                    data-testid="recipe-notes-filter-shared"
                >
                    Shared
                </button>
            </div>

            {filteredNotes.length ? (
                <div className="mb-5 space-y-3" data-testid="recipe-notes-list">
                    {filteredNotes.map((note: any) => {
                        const isOwnNote = note._source === "mine";
                        const isEditing = isOwnNote && editingId === note.id;
                        const noteCardClass = isOwnNote
                            ? "rounded-xl border border-red-200 bg-red-50/35 p-4"
                            : "rounded-xl border border-zinc-200 bg-zinc-50/80 p-4";
                        const ownerBadgeClass = isOwnNote
                            ? "inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-800"
                            : "inline-flex rounded-full border border-zinc-300 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-700";

                        return (
                            <div
                                key={note.id}
                                className={noteCardClass}
                                data-testid={
                                    isOwnNote
                                        ? `recipe-private-note-${note.id}`
                                        : `recipe-shared-note-${note.id}`
                                }
                            >
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={ownerBadgeClass}
                                            data-testid={
                                                isOwnNote
                                                    ? `recipe-private-note-owner-${note.id}`
                                                    : `recipe-shared-note-owner-${note.id}`
                                            }
                                        >
                                            {isOwnNote
                                                ? "You"
                                                : `Shared by ${note._ownerLabel}`}
                                        </span>
                                        <p
                                            className="text-xs font-medium text-zinc-600"
                                            data-testid={
                                                isOwnNote
                                                    ? `recipe-private-note-timestamp-${note.id}`
                                                    : `recipe-shared-note-timestamp-${note.id}`
                                            }
                                        >
                                            {formatTimestamp(note.created_at)}
                                        </p>
                                    </div>

                                    {isOwnNote && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingId(note.id);
                                                    setEditingNote(
                                                        note.note || "",
                                                    );
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
                                    )}
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
                                        data-testid={
                                            isOwnNote
                                                ? `recipe-private-note-body-${note.id}`
                                                : `recipe-shared-note-body-${note.id}`
                                        }
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
                    data-testid="recipe-notes-empty"
                >
                    No notes in this view.
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

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;
    const relativeCutoffDays = 7;

    if (diffMs >= 0 && diffMs < relativeCutoffDays * dayMs) {
        if (diffMs < minuteMs) {
            return "just now";
        }

        if (diffMs < hourMs) {
            const minutes = Math.floor(diffMs / minuteMs);
            return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
        }

        if (diffMs < dayMs) {
            const hours = Math.floor(diffMs / hourMs);
            return `${hours} hour${hours === 1 ? "" : "s"} ago`;
        }

        const days = Math.floor(diffMs / dayMs);
        return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    const datePart = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);

    const timePart = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(date);

    return `${datePart} at ${timePart}`;
}

function normalizeCategory(value: any): string {
    if (typeof value === "string") {
        return value.split(",")[0]?.trim() ?? "";
    }

    return "";
}
