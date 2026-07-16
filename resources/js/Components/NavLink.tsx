import { Link, InertiaLinkProps } from "@inertiajs/react";

export default function NavLink({
    active = false,
    className = "",
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none " +
                (active
                    ? "border-red-500 text-red-700 focus:border-red-500"
                    : "border-transparent text-zinc-600 hover:border-red-300 hover:text-red-700 focus:border-red-300 focus:text-red-700 ") +
                className
            }
        >
            {children}
        </Link>
    );
}
