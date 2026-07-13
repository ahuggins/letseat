import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";
import { PropsWithChildren } from "react";

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-red-100 via-rose-50 to-zinc-100 px-4 py-8 sm:py-10">
            <div className="pointer-events-none absolute -left-20 top-10 h-52 w-52 rounded-full bg-red-200/60 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-amber-200/45 blur-3xl" />

            <div className="relative">
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-red-600" />
                </Link>
            </div>

            <div className="relative mt-6 w-full overflow-hidden rounded-2xl border border-red-200/80 bg-white/95 px-6 py-5 shadow-xl shadow-red-200/40 backdrop-blur-sm sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
