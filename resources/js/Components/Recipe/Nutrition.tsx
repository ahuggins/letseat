export default function Nutrition({ recipe }) {
    return (
        <ul>
            {Object.keys(recipe.nutrition).map((key) => (
                <div>
                    {key}: {recipe.nutrition[key]}
                </div>
            ))}
        </ul>
    );
}
