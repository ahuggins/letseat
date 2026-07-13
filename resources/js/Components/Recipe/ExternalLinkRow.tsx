import ExternalLink from "../Icons/ExternalLink";

export default function ExternalLinkRow({
    name,
    siteLink,
    originalLink,
    additional = null,
}: any) {
    return (
        <div
            className="my-3 flex flex-wrap gap-3"
            data-testid="external-link-row"
        >
            {siteLink && (
                <External link={siteLink} testId="external-link-site">
                    {name}
                </External>
            )}
            {originalLink && (
                <External link={originalLink} testId="external-link-original">
                    Original Recipe Link
                </External>
            )}
            {additional}
        </div>
    );
}

function External({ link, children, testId }: any) {
    if (!children) return null;
    return (
        <a
            href={link}
            target="_blank"
            rel="noreferrer"
            data-testid={testId}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 hover:text-red-900"
        >
            <ExternalLink /> {children}
        </a>
    );
}
