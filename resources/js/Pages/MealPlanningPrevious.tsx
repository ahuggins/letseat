import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import Pagination from "./Pagination";

type PreviousMealPlan = {
    id: number;
    name?: string | null;
    week_start?: string | null;
    week_end?: string | null;
    recipes_count: number;
    created_at: string;
};

export default function MealPlanningPrevious({
    auth,
    plans,
}: {
    auth: any;
    plans: {
        data: PreviousMealPlan[];
        from?: number | null;
        to?: number | null;
        total?: number;
        links?: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
}) {
    const planList = plans?.data ?? [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Previous Meal Plans
                </h2>
            }
        >
            <Head title="Previous Meal Plans" />

            <div className="bg-white py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section className="mb-8 rounded-3xl border border-red-200 bg-gradient-to-br from-red-100 via-rose-50 to-zinc-50 p-8 shadow-sm sm:p-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                            Meal Planning
                        </p>
                        <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                            Previous Plans
                        </h1>
                        <p className="mt-3 max-w-3xl text-lg text-zinc-600">
                            Reopen a week you loved and shop that list again.
                        </p>
                    </section>

                    {planList.length ? (
                        <section
                            className="space-y-3"
                            data-testid="meal-planning-previous-list"
                        >
                            {planList.map((plan) => (
                                <article
                                    key={plan.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-sm"
                                    data-testid={`meal-planning-previous-plan-${plan.id}`}
                                >
                                    <div className="min-w-0">
                                        <h3 className="truncate font-serif text-xl font-semibold text-zinc-900">
                                            {plan.name || "Saved meal list"}
                                        </h3>
                                        <p className="mt-1 text-sm text-zinc-600">
                                            {formatWeekRange(
                                                plan.week_start,
                                                plan.week_end,
                                            )}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {plan.recipes_count} meal
                                            {plan.recipes_count === 1
                                                ? ""
                                                : "s"}{" "}
                                            • Created{" "}
                                            {formatCreatedDate(plan.created_at)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={route(
                                                "meal-planning.edit",
                                                plan.id,
                                            )}
                                            className="shrink-0 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                            data-testid={`meal-planning-edit-previous-plan-${plan.id}`}
                                        >
                                            Edit plan
                                        </Link>
                                        <Link
                                            href={route(
                                                "meal-planning.list",
                                                plan.id,
                                            )}
                                            className="shrink-0 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                                            data-testid={`meal-planning-open-previous-plan-${plan.id}`}
                                        >
                                            Open list
                                        </Link>
                                    </div>
                                </article>
                            ))}

                            <div className="pt-2">
                                <Pagination paginated={plans} />
                            </div>
                        </section>
                    ) : (
                        <section
                            className="rounded-2xl border border-red-200 bg-white p-8 text-center"
                            data-testid="meal-planning-previous-empty"
                        >
                            <p className="text-zinc-700">
                                No previous plans yet.
                            </p>
                            <Link
                                href={route("meal-planning")}
                                className="mt-3 inline-flex rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                                Start Meal Planning
                            </Link>
                        </section>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function formatWeekRange(start?: string | null, end?: string | null): string {
    if (!start || !end) {
        return "Week range unavailable";
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return "Week range unavailable";
    }

    const startLabel = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
    }).format(startDate);
    const endLabel = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(endDate);

    return `${startLabel} to ${endLabel}`;
}

function formatCreatedDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "unknown";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}
