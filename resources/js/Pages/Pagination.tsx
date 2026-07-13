import classnames from "classnames";
import { Link } from "@inertiajs/react";

export default function Pagination({ paginated }: { paginated: any }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-red-200 bg-white px-4 py-3 text-zinc-600 shadow-sm sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-zinc-600">
                        Showing{" "}
                        <span className="font-semibold text-zinc-900">{paginated.from}</span> to{" "}
                        <span className="font-semibold text-zinc-900">{paginated.to}</span> of{" "}
                        <span className="font-semibold text-zinc-900">{paginated.total}</span>{" "}
                        results
                    </p>
                </div>
                <div>
                    <nav
                        aria-label="Pagination"
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    >
                        {paginated.links.map((link: any, index: any) => {
                            return (
                                <Link
                                    key={`link-${index}`}
                                    href={
                                        link.url
                                            ? mergeSearchParams(
                                                  new URL(link.url)
                                              )
                                            : ""
                                    }
                                    className={classnames(
                                        "relative inline-flex items-center px-3 py-2 text-sm ring-1 ring-inset ring-red-200 focus:z-20 focus:outline-offset-0",
                                        {
                                            "rounded-l-md": index === 0,
                                            "bg-red-500 text-white":
                                                link.active,
                                            "rounded-r-md":
                                                index ===
                                                paginated.links.length - 1,
                                            "cursor-pointer bg-white text-zinc-700 hover:bg-red-100":
                                                link.url,
                                            "cursor-not-allowed bg-red-50/60 text-zinc-400":
                                                !link.url,
                                        }
                                    )}
                                >
                                    <span className="sr-only">
                                        {link.label}
                                    </span>
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    ></span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}

function mergeSearchParams(url: URL) {
    let params = new URLSearchParams(window.location.search);

    Array.from(params.keys()).forEach((key) => {
        if (!url?.searchParams.get(key)) {
            url?.searchParams.append(key, params.get(key) ?? "");
        }
    });

    return url ? url.href : "";
}
