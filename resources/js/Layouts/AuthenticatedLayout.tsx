import { useState, PropsWithChildren, ReactNode, FormEvent } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, router } from "@inertiajs/react";
import { User } from "@/types";

export default function Authenticated({
    user,
    header,
    children,
}: PropsWithChildren<{ user: User; header?: ReactNode }>) {
    const searchParams = new URLSearchParams(window.location.search);
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const formValues = Object.fromEntries(formData.entries());

        router.replace("/search", { data: formValues });
    }

    return (
        <div className="min-h-screen bg-amber-50">
            <nav className="sticky top-0 z-40 border-b border-red-100 bg-white/95 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="shrink-0 flex items-center">
                                <Link href="/" className="inline-flex items-center gap-2">
                                    <ApplicationLogo className="block h-8 w-auto fill-current text-red-600" />
                                    <span className="font-serif text-xl font-bold text-red-700">
                                        LetsEat
                                    </span>
                                </Link>
                            </div>

                            <div className="hidden md:ms-6 md:flex md:items-center md:gap-6">
                                <NavLink
                                    href={route("recipes")}
                                    active={route().current("recipes")}
                                >
                                    Recipes
                                </NavLink>
                                <NavLink
                                    href={route("add-recipe")}
                                    active={route().current("add-recipe")}
                                >
                                    Add Recipe
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden md:flex md:flex-1 md:items-center md:justify-end md:gap-4">
                            <form onSubmit={handleSearchSubmit} className="w-full max-w-sm">
                                <input
                                    type="text"
                                    name="q"
                                    placeholder="Search recipes..."
                                    className="h-10 w-full rounded-full border border-red-200 bg-red-50 px-4 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                    defaultValue={searchParams?.get("q") || ""}
                                />
                            </form>

                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-full border border-red-200 bg-white px-3 py-2 text-sm font-medium leading-4 text-zinc-600 transition ease-in-out duration-150 hover:text-red-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route("profile.edit")}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center md:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 transition duration-150 ease-in-out hover:bg-red-100 hover:text-red-700 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " sm:hidden"
                    }
                >
                    <div className="space-y-3 border-t border-red-100 px-4 pb-4 pt-3">
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                name="q"
                                placeholder="Search recipes..."
                                className="h-10 w-full rounded-full border border-red-200 bg-red-50 px-4 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                                defaultValue={searchParams?.get("q") || ""}
                            />
                        </form>

                        <div className="space-y-1">
                        <ResponsiveNavLink
                            href={route("recipes")}
                            active={route().current("recipes")}
                        >
                            Recipes
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route("add-recipe")}
                            active={route().current("add-recipe")}
                        >
                            Add Recipe
                        </ResponsiveNavLink>
                        </div>
                    </div>

                    <div className="border-t border-red-100 pb-2 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-zinc-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-zinc-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route("profile.edit")}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}
