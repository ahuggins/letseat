type FormattedRecipe = {
    originalLink: string;
    siteLink: string;
    recipeLink: string;
    graph: object;
    jsonRecipe: object & { image: any };
    name: string;
    description: string;
    image?: string;
}

export function formatRecipe(recipe: any): FormattedRecipe {
    if(typeof recipe.content === 'string') {
        recipe.content = JSON.parse(recipe.content);
    }
    if(typeof recipe.nutrition === 'string' && recipe.nutrition !== ''){
        recipe.nutrition = JSON.parse(recipe.nutrition);
    }
    if(hasGraph(recipe)) {
        return formatGraphRecipe(recipe);
    }
    return formatRegularRecipe(recipe);
}

// if there is no "@graph" key.
function formatRegularRecipe(recipe: any): FormattedRecipe {
    // console.log({ parsed: JSON.parse(recipe.content) });
    return {
        originalLink: recipe.content.url,
        siteLink: recipe.content.url ? new URL(recipe.content.url).origin : new URL(recipe.url).origin,
        recipeLink: `/recipe/${recipe.slug}`,
        graph:  recipe.content,
        jsonRecipe: recipe.content,
        name: recipe?.content?.author?.name,
        description: recipe.content.description,
    };
}

// If the scraped data has a "@graph" key
function formatGraphRecipe(recipe:any): FormattedRecipe {
    const graph = recipe.content["@graph"];
    const image = graph.find((node: any) => node["@type"] === "ImageObject").contentUrl;
    return {
        originalLink: graph[1]["@id"],
        siteLink: graph[4].url,
        recipeLink: `/recipe/${recipe.slug}`,
        graph:  graph["@graph"],
        jsonRecipe: graph.find((node: any) => node["@type"] === "Recipe"),
        name: graph[5]?.name,
        description: graph[1].description,
        image,
    };
}

function hasGraph(recipe:any) {
    return recipe.content.hasOwnProperty("@graph");
}