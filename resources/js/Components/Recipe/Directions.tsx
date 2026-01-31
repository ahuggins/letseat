import Heading from "./Heading";

export default function Directions({ recipe }: any) {
    return (
        <>
            <Heading>Directions</Heading>
            {isMultiStep(recipe.directions) ? (
                <MultipleStepDirections recipe={recipe} />
            ) : (
                <ListDirections directions={recipe.directions} />
            )}
        </>
    );
}

function MultipleStepDirections({ recipe }: { recipe: any }) {
    if (!Array.isArray(recipe.directions)) return recipe.directions;
    return (
        <>
            {recipe.directions.map(
                (
                    section: {
                        name: string;
                        itemListElement?: any;
                        text?: string;
                    },
                    index: any
                ) => {
                    return (
                        <ListDirections
                            name={section.name}
                            key={index}
                            directions={section.itemListElement || section.text}
                        />
                    );
                }
            )}
        </>
    );
}

function ListDirections({
    directions,
    name = undefined,
}: {
    directions: any;
    name?: string;
}) {
    if (typeof directions === "string")
        return <p className="pb-4">{directions}</p>;
    if (!directions) return null;
    return (
        <>
            {name && <Heading>{name}</Heading>}
            <ol className="list-decimal p-6">
                {directions.map((direction: any, index: any) => (
                    <li key={index}>{direction.text}</li>
                ))}
            </ol>
        </>
    );
}

function isMultiStep(directions: any) {
    if (!Array.isArray(directions)) return false;
    return directions.some(
        (section: any) => section["@type"] === "HowToSection"
    );
}
