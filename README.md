# LetsEat

A little fun app to play around with Laravel 12 and track recipes.

## Frontend Test IDs

To keep E2E and component tests stable, use `data-testid` attributes for key
UI elements.

### Naming convention

- Use lowercase kebab-case names: `recipes-page`, `search-results-grid`.
- Use page or component scope prefixes when possible:
	- `recipes-*`
	- `recipe-*`
	- `search-*`
	- `add-recipe-*`
	- `pagination-*`
- For repeated records, include a stable identifier:
	- `recipe-card-<id>`
	- `recipe-favorite-toggle-<id>`
	- `added-by-link-<userId>`

### Where to add test IDs

- Page container and hero/title area.
- Primary user actions (search, submit, toggles, filter controls).
- Lists/grids and empty states.
- Pagination wrapper and link items.
- Reusable components that tests interact with (external links, nutrition rows,
	directions blocks).

### Avoid

- Styling-based selectors in tests (`.text-red-500`, long class chains).
- Text-only selectors for dynamic content when a stable test ID is available.

## PR Checklist

- [ ] New or updated interactive UI includes stable `data-testid` attributes.