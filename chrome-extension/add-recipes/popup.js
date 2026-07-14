const elements = {
    configWarning: document.getElementById("config-warning"),
    url: document.getElementById("url"),
    previewCard: document.getElementById("preview-card"),
    previewStatus: document.getElementById("preview-status"),
    previewContent: document.getElementById("preview-content"),
    previewImage: document.getElementById("preview-image"),
    previewName: document.getElementById("preview-name"),
    previewSite: document.getElementById("preview-site"),
    previewMeta: document.getElementById("preview-meta"),
    addButton: document.getElementById("add"),
    refreshButton: document.getElementById("refresh"),
    resultCard: document.getElementById("result-card"),
    resultText: document.getElementById("result-text"),
    resultLink: document.getElementById("result-link"),
};

let state = {
    url: "",
    baseUrl: "",
    token: "",
    parseable: false,
};

const DEFAULT_BASE_URL = "https://recipes.andrewhuggins.com";

async function getStorage(keys) {
    return chrome.storage.local.get(keys);
}

function normalizeBaseUrl(url) {
    return (url || "").trim().replace(/\/$/, "");
}

function authHeaders(token) {
    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };
}

function setStatus(text, kind = "neutral") {
    elements.previewStatus.textContent = text;
    elements.previewStatus.className = `status ${kind}`;
}

function resetPreview() {
    state.parseable = false;
    elements.addButton.disabled = true;
    elements.previewContent.hidden = true;
    elements.previewName.textContent = "";
    elements.previewSite.textContent = "";
    elements.previewMeta.textContent = "";
    elements.previewImage.hidden = true;
    elements.previewImage.src = "";
}

async function getActiveTabUrl() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0]?.url || "";
}

function renderCurrentUrl(url) {
    elements.url.value = url;
}

function renderPreview(preview) {
    elements.previewContent.hidden = false;
    elements.previewName.textContent = preview.name || "Untitled recipe";
    elements.previewSite.textContent =
        preview.site_name || preview.site_domain || "";

    const meta = [];
    if (preview.ingredient_count) {
        meta.push(`${preview.ingredient_count} ingredients`);
    }
    if (preview.cook_time) {
        meta.push(preview.cook_time);
    }
    if (preview.category) {
        meta.push(preview.category);
    }

    elements.previewMeta.textContent = meta.join(" • ");

    if (preview.image) {
        elements.previewImage.src = preview.image;
        elements.previewImage.hidden = false;
    }
}

function setResult(message, linkHref = "") {
    elements.resultCard.hidden = false;
    elements.resultText.textContent = message;

    if (linkHref) {
        elements.resultLink.href = linkHref;
        elements.resultLink.hidden = false;
    } else {
        elements.resultLink.hidden = true;
        elements.resultLink.href = "#";
    }
}

async function previewUrl() {
    resetPreview();
    elements.resultCard.hidden = true;

    if (!state.baseUrl || !state.token) {
        elements.configWarning.hidden = false;
        setStatus("Missing token. Add your LetsEat extension token.", "error");
        return;
    }

    elements.configWarning.hidden = true;

    if (!state.url) {
        setStatus("No active tab URL found.", "error");
        return;
    }

    setStatus("Checking parseability...", "loading");

    try {
        const response = await fetch(
            `${state.baseUrl}/api/extension/recipe/preview`,
            {
                method: "POST",
                headers: authHeaders(state.token),
                body: JSON.stringify({ url: state.url }),
            },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || "Preview failed");
        }

        if (!data.parseable) {
            setStatus(
                data.message || "This page does not look parseable.",
                "error",
            );
            return;
        }

        state.parseable = true;
        elements.addButton.disabled = false;
        setStatus("This looks parseable.", "success");
        renderPreview(data.preview || {});
    } catch (error) {
        setStatus(
            error instanceof Error ? error.message : "Preview failed",
            "error",
        );
    }
}

async function importUrl() {
    if (!state.parseable) {
        return;
    }

    elements.addButton.disabled = true;
    setStatus("Importing recipe...", "loading");

    try {
        const response = await fetch(
            `${state.baseUrl}/api/extension/recipe/import`,
            {
                method: "POST",
                headers: authHeaders(state.token),
                body: JSON.stringify({ url: state.url }),
            },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || "Import failed");
        }

        setStatus("Recipe imported successfully.", "success");

        const recipeUrl = data.recipe_url || "";
        setResult("Recipe added to your LetsEat account.", recipeUrl);
    } catch (error) {
        setStatus(
            error instanceof Error ? error.message : "Import failed",
            "error",
        );
    } finally {
        elements.addButton.disabled = false;
    }
}

async function init() {
    const { letsEatBaseUrl = "", letsEatToken = "" } = await getStorage([
        "letsEatBaseUrl",
        "letsEatToken",
    ]);

    state.baseUrl = normalizeBaseUrl(letsEatBaseUrl) || DEFAULT_BASE_URL;
    state.token = (letsEatToken || "").trim();
    state.url = await getActiveTabUrl();

    renderCurrentUrl(state.url);

    const urlScheme = state.url.split(":")[0];
    if (!["http", "https"].includes(urlScheme)) {
        setStatus("Only http(s) pages are supported.", "error");
        return;
    }

    await previewUrl();
}

elements.refreshButton.addEventListener("click", previewUrl);
elements.addButton.addEventListener("click", importUrl);

init();
