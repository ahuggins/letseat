import classnames from "classnames";
import { Head, Link } from "@inertiajs/react";

export default function Pagination({ paginated }: { paginated: any }) {
    return (
        <div className="bg-white text-slate-300 dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-b-lg flex items-center justify-between border-t border-slate-700 px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-slate-300">
                        Showing{" "}
                        <span className="font-medium">{paginated.from}</span> to{" "}
                        <span className="font-medium">{paginated.to}</span> of{" "}
                        <span className="font-medium">{paginated.total}</span>{" "}
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
                                    target="_blank"
                                    className={classnames(
                                        "relative inline-flex items-center px-2 py-2  ring-1 ring-inset ring-slate-700  focus:z-20 focus:outline-offset-0",
                                        {
                                            "rounded-l-md": index === 0,
                                            "bg-slate-500 text-blue-100":
                                                link.active,
                                            "rounded-r-md":
                                                index ===
                                                paginated.links.length - 1,
                                            "cursor-pointer hover:bg-slate-500 text-slate-200":
                                                link.url,
                                            "cursor-not-allowed text-gray-400":
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
