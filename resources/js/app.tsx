import "./bootstrap";
import "../css/app.css";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

const resolveInitialPage = () => {
    const appElement = document.getElementById("app");
    const pageFromDataset = appElement?.dataset?.page;

    if (pageFromDataset) {
        return JSON.parse(pageFromDataset);
    }

    const pageScript = document.querySelector<HTMLScriptElement>(
        'script[type="application/json"][data-page]',
    );

    if (pageScript?.textContent) {
        return JSON.parse(pageScript.textContent);
    }

    throw new Error("Inertia initial page data was not found in the DOM.");
};

createInertiaApp({
    page: resolveInitialPage(),
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
    },
});
