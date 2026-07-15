import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { router, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

type NoteShare = {
    id: number;
    viewer_id: number;
    viewer_name: string;
    viewer_email: string;
    created_at: string;
};

export default function NotesSharingForm({
    className = "",
    noteShares,
}: {
    className?: string;
    noteShares: NoteShare[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("profile.note-shares.store"), {
            preserveScroll: true,
            errorBag: "storeNoteShare",
            onSuccess: () => reset("email"),
        });
    };

    function removeShare(viewerId: number) {
        router.delete(route("profile.note-shares.destroy", viewerId), {
            preserveScroll: true,
        });
    }

    return (
        <section
            className={className}
            data-testid="profile-notes-sharing-section"
        >
            <header>
                <h2 className="text-lg font-medium text-zinc-900">
                    Notes Sharing
                </h2>

                <p className="mt-1 text-sm text-zinc-600">
                    Enter an email to share all of your recipe notes with that
                    user.
                </p>
            </header>

            <form
                onSubmit={submit}
                className="mt-6 space-y-4"
                data-testid="profile-notes-sharing-form"
            >
                <div>
                    <InputLabel htmlFor="note_share_email" value="User email" />

                    <TextInput
                        id="note_share_email"
                        type="email"
                        className="mt-1 block w-full rounded-xl border-red-200 bg-red-50 text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:ring-red-200"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="name@example.com"
                        data-testid="profile-notes-sharing-email-input"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton
                        className="rounded-full bg-red-500 px-5 py-2 text-white hover:bg-red-600 focus:bg-red-600 active:bg-red-700 focus:ring-red-300"
                        disabled={processing}
                        data-testid="profile-notes-sharing-submit"
                    >
                        Save
                    </PrimaryButton>
                </div>
            </form>

            <div
                className="mt-6"
                data-testid="profile-notes-sharing-list-wrapper"
            >
                {noteShares.length ? (
                    <ul
                        className="space-y-2"
                        data-testid="profile-notes-sharing-list"
                    >
                        {noteShares.map((share) => (
                            <li
                                key={share.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2"
                                data-testid={`profile-notes-sharing-item-${share.viewer_id}`}
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-zinc-800">
                                        {share.viewer_name}
                                    </p>
                                    <p className="truncate text-xs text-zinc-600">
                                        {share.viewer_email}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeShare(share.viewer_id)}
                                    className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                    data-testid={`profile-notes-sharing-remove-${share.viewer_id}`}
                                >
                                    Stop sharing
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p
                        className="text-sm text-zinc-500"
                        data-testid="profile-notes-sharing-empty"
                    >
                        You are not sharing notes with anyone yet.
                    </p>
                )}
            </div>
        </section>
    );
}
