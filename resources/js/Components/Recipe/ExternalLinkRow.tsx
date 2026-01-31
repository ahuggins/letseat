import ExternalLink from "../Icons/ExternalLink";

export default function ExternalLinkRow({
    name,
    siteLink,
    originalLink,
    additional = null,
}: any) {
    return (
        <div className="flex gap-3  my-3">
            {siteLink && <External link={siteLink}>{name}</External>}
            {originalLink && (
                <External link={originalLink}>Original Recipe Link</External>
            )}
            {additional}
        </div>
    );
}

function External({ link, children }: any) {
    if (!children) return null;
    return (
        <a
            href={link}
            target="_blank"
            className="text-blue-500 flex gap-2 items-center"
        >
            <ExternalLink /> {children}
        </a>
    );
}
