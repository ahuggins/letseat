import { Link } from "@inertiajs/react";

export default function AddedBy({ recipe }: any) {
    return (
        <Link
            href={`/recipes?user=${recipe.user.id}`}
            data-testid={`added-by-link-${recipe.user.id}`}
            className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-red-100 hover:text-red-700"
        >
            Added by: {recipe.user.name}
        </Link>
    );
}
