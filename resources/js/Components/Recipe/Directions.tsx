export default function Directions({ recipe }) {
    return (
        <>
            <h3 className="text-xl font-medium mt-5">Directions</h3>
            <ol className="list-decimal p-6">
                {recipe.directions.map((direction, index) => (
                    <Direction direction={direction} />
                ))}
            </ol>
        </>
    );
}

function Direction({ direction }) {
    return <li>{direction.text}</li>;
}
