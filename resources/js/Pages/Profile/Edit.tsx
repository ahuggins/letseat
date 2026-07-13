import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DeleteUserForm from "./Partials/DeleteUserForm";
import NotesSharingForm from "./Partials/NotesSharingForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";

export default function Edit({
    auth,
    mustVerifyEmail,
    status,
    noteShares,
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    noteShares: Array<{
        id: number;
        viewer_id: number;
        viewer_name: string;
        viewer_email: string;
        created_at: string;
    }>;
}>) {
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
                    <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-8">
                        <NotesSharingForm
                            className="max-w-xl"
                            noteShares={noteShares}
                        />
                    </div>

                    <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
