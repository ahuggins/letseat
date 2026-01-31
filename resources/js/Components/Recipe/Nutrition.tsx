export default function Nutrition({ recipe }: any) {
    return (
        <>
            <div className="rounded-lg overflow-hidden max-w-sm mx-auto">
                <table className="w-full text-sm leading-5">
                    <thead className="bg-slate-100 text=slate-900 font-medium text-md">
                        <tr>
                            <th className="py-1.5 px-4 text-left">Nutrient</th>
                            <th className="py-1.5 px-4 text-left">
                                {/* Amount per Serving (100g) */}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(recipe.nutrition)
                            .filter((key) => {
                                return key != "@type";
                            })
                            .map((key) => (
                                <tr
                                    key={key}
                                    className="even:bg-slate-100 odd:bg-white"
                                >
                                    <td className="py-1.5 px-4 text-left font-medium text-slate-800">
                                        {camelCaseToWords(key)}
                                    </td>
                                    <td className="py-1.5 px-4 text-left">
                                        {recipe.nutrition[key]}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function camelCaseToWords(s: string) {
    const result = s.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
}
