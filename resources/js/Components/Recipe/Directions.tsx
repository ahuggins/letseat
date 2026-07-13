export default function Directions({ recipe }: any) {
    const directions = recipe?.directions || {};

    return Object.keys(directions).map((key) => {
        if (!isNaN(parseInt(key))) {
            return (
                <p key={key} className="py-3 leading-7 text-zinc-700">
                    {directions[key]}
                </p>
            );
        }

        return (
            <div key={key} className="py-2">
                <h3 className="font-serif text-xl font-semibold text-zinc-900">
                    {key}
                </h3>
                {Array.isArray(directions[key]) ? (
                    <ol className="mt-2 list-decimal space-y-2 pl-5 text-zinc-700 marker:text-red-500">
                        {directions[key]?.map((d: any, index: any) => {
                            return (
                                <li
                                    key={`${key}-${index}`}
                                    className="leading-7"
                                >
                                    {d}
                                </li>
                            );
                        })}
                    </ol>
                ) : (
                    <p className="mt-2 leading-7 text-zinc-700">
                        {directions[key]}
                    </p>
                )}
            </div>
        );
    });
}
