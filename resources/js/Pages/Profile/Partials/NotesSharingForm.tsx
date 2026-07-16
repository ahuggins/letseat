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
    status: "pending" | "accepted";
    accepted_at: string | null;
    created_at: string;
};

type NoteIncomingInvite = {
    id: number;
    owner_id: number;
    owner_name: string;
    owner_email: string;
    created_at: string;
};

type NoteShareReceived = {
    id: number;
    owner_id: number;
    owner_name: string;
    owner_email: string;
    accepted_at: string | null;
    created_at: string;
};

export default function NotesSharingForm({
    className = "",
    noteShares,
    noteIncomingInvites,
    noteSharesReceived,
}: {
    className?: string;
    noteShares: NoteShare[];
    noteIncomingInvites: NoteIncomingInvite[];
    noteSharesReceived: NoteShareReceived[];
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

    function acceptInvite(ownerId: number) {
        router.patch(route("profile.note-shares.accept", ownerId), undefined, {
            preserveScroll: true,
        });
    }

    function declineInvite(ownerId: number) {
        router.delete(route("profile.note-shares.decline", ownerId), {
            preserveScroll: true,
        });
    }

    function leaveSharedNotes(ownerId: number) {
        router.delete(route("profile.note-shares.leave", ownerId), {
            preserveScroll: true,
        });
    }

    const pendingOutgoing = noteShares.filter(
        (share) => share.status === "pending",
    );
    const acceptedOutgoing = noteShares.filter(
        (share) => share.status === "accepted",
    );

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
                    Send a notes invite. They must accept before your private
                    notes are shared.
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
                {noteIncomingInvites.length ? (
                    <div className="mb-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                            Pending invites for you
                        </p>
                        <ul className="space-y-2">
                            {noteIncomingInvites.map((invite) => (
                                <li
                                    key={invite.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-zinc-800">
                                            {invite.owner_name}
                                        </p>
                                        <p className="truncate text-xs text-zinc-600">
                                            {invite.owner_email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                acceptInvite(invite.owner_id)
                                            }
                                            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                declineInvite(invite.owner_id)
                                            }
                                            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {pendingOutgoing.length ? (
                    <div className="mb-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                            Pending invites you sent
                        </p>
                        <ul className="space-y-2">
                            {pendingOutgoing.map((share) => (
                                <li
                                    key={share.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2"
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
                                        onClick={() =>
                                            removeShare(share.viewer_id)
                                        }
                                        className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                    >
                                        Cancel invite
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {acceptedOutgoing.length ? (
                    <div className="mb-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                            Shared notes members
                        </p>
                        <ul
                            className="space-y-2"
                            data-testid="profile-notes-sharing-list"
                        >
                            {acceptedOutgoing.map((share) => (
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
                                        onClick={() =>
                                            removeShare(share.viewer_id)
                                        }
                                        className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                        data-testid={`profile-notes-sharing-remove-${share.viewer_id}`}
                                    >
                                        Remove member
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {noteSharesReceived.length ? (
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                            Notes shared with you
                        </p>
                        <ul className="space-y-2">
                            {noteSharesReceived.map((share) => (
                                <li
                                    key={share.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-zinc-800">
                                            {share.owner_name}
                                        </p>
                                        <p className="truncate text-xs text-zinc-600">
                                            {share.owner_email}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            leaveSharedNotes(share.owner_id)
                                        }
                                        className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                                    >
                                        Leave shared notes
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {!noteIncomingInvites.length &&
                !pendingOutgoing.length &&
                !acceptedOutgoing.length &&
                !noteSharesReceived.length ? (
                    <p
                        className="text-sm text-zinc-500"
                        data-testid="profile-notes-sharing-empty"
                    >
                        No note invitations or shared members yet.
                    </p>
                ) : null}
            </div>
        </section>
    );
}
