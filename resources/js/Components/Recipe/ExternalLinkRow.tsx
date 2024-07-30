import ExternalLink from "../Icons/ExternalLink";

export default function ExternalLinkRow({ siteLink, recipe, originalLink }) {
    return (
        <div className="flex gap-3 justify-between my-3">
            <External link={siteLink}>
                {recipe.content["@graph"][5].name}
            </External>
            <External link={originalLink}>Original Recipe Link</External>
        </div>
    );
}

function External({ link, children }) {
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
