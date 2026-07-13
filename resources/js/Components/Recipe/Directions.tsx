export default function Directions({ recipe }: any) {
    return Object.keys(recipe.directions).map((key) => {
        if (!isNaN(parseInt(key))) {
            return (
                <p key={key} className="py-3">
                    {recipe.directions[key]}
                </p>
            );
        }
        return (
            <div key={key}>
                <h3 className="font-semibold text-lg">{key}</h3>
                {Array.isArray(recipe.directions[key]) ? (
                    <ol className="list-decimal list-inside pl-5">
                        {recipe.directions[key]?.map((d: any, index: any) => {
                            return (
                                <li key={`${key}-${index}`} className="py-3">
                                    {d}
                                </li>
                            );
                        })}
                    </ol>
                ) : (
                    recipe.directions[key]
                )}
            </div>
        );
    });
}
