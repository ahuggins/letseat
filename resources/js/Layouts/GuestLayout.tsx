import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";
import { PropsWithChildren } from "react";

type FeaturedRecipe = {
    id: number;
    name: string;
    image: string;
};

export default function Guest({
    children,
    featuredRecipe,
}: PropsWithChildren<{ featuredRecipe?: FeaturedRecipe | null }>) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-red-100 via-rose-50 to-zinc-100 px-4 py-8 sm:py-10">
            <div className="pointer-events-none absolute -left-20 top-10 h-52 w-52 rounded-full bg-red-200/60 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-amber-200/45 blur-3xl" />

            <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-red-200/80 bg-white/85 shadow-2xl shadow-red-200/45 backdrop-blur-sm">
                <div className="grid lg:grid-cols-2">
                    <div className="relative hidden min-h-[680px] lg:block">
                        {featuredRecipe ? (
                            <>
                                <img
                                    src={featuredRecipe.image}
                                    alt={featuredRecipe.name}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/65 via-zinc-800/45 to-red-900/35" />

                                <div className="absolute bottom-0 left-0 right-0 space-y-2 p-8 text-white">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-100/95">
                                        Featured Recipe
                                    </p>
                                    <p className="max-w-md font-serif text-3xl font-semibold leading-tight">
                                        {featuredRecipe.name}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-red-900" />
                        )}
                    </div>

                    <div className="relative min-h-[620px] bg-white/95 px-6 py-6 sm:px-10 sm:py-10 lg:flex lg:flex-col lg:justify-center">
                        {featuredRecipe && (
                            <div className="relative -mx-6 -mt-6 mb-6 h-44 overflow-hidden sm:-mx-10 sm:-mt-10 lg:hidden">
                                <img
                                    src={featuredRecipe.image}
                                    alt={featuredRecipe.name}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-zinc-900/20 to-transparent" />
                                <div className="absolute bottom-3 left-4 right-4 text-white">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-100/95">
                                        Featured Recipe
                                    </p>
                                    <p className="line-clamp-2 font-serif text-lg font-semibold leading-tight">
                                        {featuredRecipe.name}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mb-6 flex justify-center lg:justify-start">
                            <Link href="/">
                                <ApplicationLogo className="h-20 w-20 fill-current text-red-600" />
                            </Link>
                        </div>

                        {children}
                    </div>
                </div>
            </div>

            <footer className="relative mt-5 text-center text-xs text-zinc-600">
                <Link
                    href={route("privacy-policy")}
                    className="font-medium text-red-700 hover:text-red-800"
                >
                    Privacy Policy
                </Link>
            </footer>
        </div>
    );
}
