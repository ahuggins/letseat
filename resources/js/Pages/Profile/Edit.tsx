import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DeleteUserForm from "./Partials/DeleteUserForm";
import ExtensionTokensForm from "./Partials/ExtensionTokensForm";
import NotesSharingForm from "./Partials/NotesSharingForm";
import PantrySharingForm from "./Partials/PantrySharingForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";
import { useState } from "react";

type ProfileTab = "account" | "notes" | "pantry" | "extension";

export default function Edit({
    auth,
    mustVerifyEmail,
    status,
    noteShares,
    noteIncomingInvites,
    noteSharesReceived,
    pantryShares,
    pantryIncomingInvites,
    pantrySharesReceived,
    extensionTokens,
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    noteShares: Array<{
        id: number;
        viewer_id: number;
        viewer_name: string;
        viewer_email: string;
        status: "pending" | "accepted";
        accepted_at: string | null;
        created_at: string;
    }>;
    noteIncomingInvites: Array<{
        id: number;
        owner_id: number;
        owner_name: string;
        owner_email: string;
        created_at: string;
    }>;
    noteSharesReceived: Array<{
        id: number;
        owner_id: number;
        owner_name: string;
        owner_email: string;
        accepted_at: string | null;
        created_at: string;
    }>;
    pantryShares: Array<{
        id: number;
        viewer_id: number;
        viewer_name: string;
        viewer_email: string;
        status: "pending" | "accepted";
        accepted_at: string | null;
        created_at: string;
    }>;
    pantryIncomingInvites: Array<{
        id: number;
        owner_id: number;
        owner_name: string;
        owner_email: string;
        created_at: string;
    }>;
    pantrySharesReceived: Array<{
        id: number;
        owner_id: number;
        owner_name: string;
        owner_email: string;
        accepted_at: string | null;
        created_at: string;
    }>;
    extensionTokens: Array<{
        id: number;
        name: string;
        abilities: string[];
        last_used_at: string | null;
        created_at: string;
    }>;
}>) {
    const [activeTab, setActiveTab] = useState<ProfileTab>("account");

    const tabs: Array<{
        key: ProfileTab;
        label: string;
        badgeCount?: number;
        needsAttention?: boolean;
    }> = [
        { key: "account", label: "Account" },
        {
            key: "notes",
            label: "Notes Sharing",
            badgeCount: noteIncomingInvites.length,
            needsAttention: noteIncomingInvites.length > 0,
        },
        {
            key: "pantry",
            label: "Pantry Sharing",
            badgeCount: pantryIncomingInvites.length,
            needsAttention: pantryIncomingInvites.length > 0,
        },
        { key: "extension", label: "Chrome Extension" },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-zinc-900 leading-tight">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="bg-white py-6 sm:py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <section className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-100 via-rose-50 to-zinc-50 p-4 shadow-sm sm:p-6">
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                                            isActive
                                                ? "border-red-500 bg-red-500 text-white"
                                                : "border-red-200 bg-white text-red-700 hover:bg-red-100"
                                        }`}
                                    >
                                        {tab.label}
                                        {tab.badgeCount &&
                                        tab.badgeCount > 0 ? (
                                            <span
                                                className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold leading-none ${
                                                    tab.needsAttention
                                                        ? isActive
                                                            ? "bg-white text-red-700"
                                                            : "bg-red-500 text-white"
                                                        : isActive
                                                          ? "bg-white/90 text-red-700"
                                                          : "bg-red-100 text-red-700"
                                                }`}
                                                aria-label={`${tab.badgeCount} ${tab.label} items`}
                                            >
                                                {tab.badgeCount}
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {activeTab === "account" ? (
                        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            <div className="divide-y divide-red-200">
                                <div className="p-4 sm:p-8">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        className="max-w-xl"
                                    />
                                </div>

                                <div className="p-4 sm:p-8">
                                    <UpdatePasswordForm className="max-w-xl" />
                                </div>

                                <div className="p-4 sm:p-8">
                                    <DeleteUserForm className="max-w-xl" />
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {activeTab === "notes" ? (
                        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            <div className="divide-y divide-red-200">
                                <div className="p-4 sm:p-8">
                                    <NotesSharingForm
                                        className="max-w-xl"
                                        noteShares={noteShares}
                                        noteIncomingInvites={
                                            noteIncomingInvites
                                        }
                                        noteSharesReceived={noteSharesReceived}
                                    />
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {activeTab === "pantry" ? (
                        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            <div className="divide-y divide-red-200">
                                <div className="p-4 sm:p-8">
                                    <PantrySharingForm
                                        className="max-w-xl"
                                        pantryShares={pantryShares}
                                        pantryIncomingInvites={
                                            pantryIncomingInvites
                                        }
                                        pantrySharesReceived={
                                            pantrySharesReceived
                                        }
                                    />
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {activeTab === "extension" ? (
                        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                            <div className="divide-y divide-red-200">
                                <div className="p-4 sm:p-8">
                                    <ExtensionTokensForm
                                        className="max-w-2xl"
                                        initialTokens={extensionTokens}
                                    />
                                </div>
                            </div>
                        </section>
                    ) : null}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
