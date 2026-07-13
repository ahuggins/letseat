export default function Nutrition({ recipe }: any) {
    const nutrition = normalizeNutrition(recipe.nutrition);

    if (!nutrition || Object.keys(nutrition).length === 0) {
        return null;
    }

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
                        {Object.keys(nutrition)
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
                                        {nutrition[key]}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function normalizeNutrition(value: any): Record<string, any> | null {
    if (!value) {
        return null;
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return normalizeNutrition(parsed);
        } catch {
            return null;
        }
    }

    if (Array.isArray(value)) {
        const first = value[0];
        if (first && typeof first === "object") {
            return first;
        }

        return null;
    }

    if (typeof value === "object") {
        return value;
    }

    return null;
}

function camelCaseToWords(s: string) {
    const result = s.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
}
