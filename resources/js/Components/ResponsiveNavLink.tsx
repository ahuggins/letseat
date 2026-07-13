import { Link, InertiaLinkProps } from '@inertiajs/react';

export default function ResponsiveNavLink({ active = false, className = '', children, ...props }: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`w-full flex items-start ps-3 pe-4 py-2 border-l-4 ${
                active
                    ? 'border-red-400 text-red-800 bg-red-50 focus:text-red-900 focus:bg-red-100 focus:border-red-500'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-red-50 hover:border-red-200 focus:text-zinc-900 focus:bg-red-50 focus:border-red-200'
            } text-base font-medium focus:outline-none transition duration-150 ease-in-out ${className}`}
        >
            {children}
        </Link>
    );
}
