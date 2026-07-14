const form = document.getElementById("settings-form");
const baseUrlInput = document.getElementById("baseUrl");
const tokenInput = document.getElementById("token");
const statusEl = document.getElementById("status");
const testButton = document.getElementById("test");
const disconnectButton = document.getElementById("disconnect");

const DEFAULT_BASE_URL = "https://recipes.andrewhuggins.com";

function normalizeBaseUrl(url) {
    return (url || "").trim().replace(/\/$/, "");
}

function setStatus(message, kind = "neutral") {
    statusEl.textContent = message;
    statusEl.className = `status ${kind}`;
}

async function loadSettings() {
    const { letsEatBaseUrl = "", letsEatToken = "" } =
        await chrome.storage.local.get(["letsEatBaseUrl", "letsEatToken"]);

    baseUrlInput.value = letsEatBaseUrl || DEFAULT_BASE_URL;
    tokenInput.value = letsEatToken;
}

async function saveSettings(event) {
    event.preventDefault();

    const letsEatBaseUrl = normalizeBaseUrl(baseUrlInput.value);
    const letsEatToken = tokenInput.value.trim();

    if (!letsEatToken) {
        setStatus("Token is required.", "error");
        return;
    }

    await chrome.storage.local.set({
        letsEatBaseUrl: letsEatBaseUrl || DEFAULT_BASE_URL,
        letsEatToken,
    });
    setStatus("Settings saved.", "success");
}

async function testConnection() {
    const letsEatBaseUrl =
        normalizeBaseUrl(baseUrlInput.value) || DEFAULT_BASE_URL;
    const letsEatToken = tokenInput.value.trim();

    if (!letsEatToken) {
        setStatus("Provide token first.", "error");
        return;
    }

    setStatus("Testing connection...", "loading");

    try {
        const response = await fetch(`${letsEatBaseUrl}/api/extension/me`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${letsEatToken}`,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || "Connection failed");
        }

        setStatus(
            `Connected as ${data.name || data.email || "user"}.`,
            "success",
        );
    } catch (error) {
        setStatus(
            error instanceof Error ? error.message : "Connection failed",
            "error",
        );
    }
}

async function disconnect() {
    await chrome.storage.local.remove(["letsEatToken"]);
    tokenInput.value = "";
    setStatus("Disconnected. Token removed from this browser.", "success");
}

form.addEventListener("submit", saveSettings);
testButton.addEventListener("click", testConnection);
disconnectButton.addEventListener("click", disconnect);

loadSettings();
