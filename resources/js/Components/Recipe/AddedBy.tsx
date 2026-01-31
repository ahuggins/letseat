import { Link } from "@inertiajs/react";

export default function AddedBy({ recipe }: any) {
    return (
        <Link
            href={`/recipes?user=${recipe.user.id}`}
            className="bg-slate-100 inline-block p-2 rounded-lg text-sm"
        >
            Added by: {recipe.user.name}
        </Link>
    );
}
