import DangerButton from "@/Components/DangerButton";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import axios from "axios";
import { useMemo, useState } from "react";

type ExtensionToken = {
    id: number;
    name: string;
    abilities: string[];
    last_used_at: string | null;
    created_at: string;
};

function formatDate(value: string | null): string {
    if (!value) {
        return "Never";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleString();
}

function shortName(name: string): string {
    return name.replace(/^chrome-extension:/, "");
}

export default function ExtensionTokensForm({
    className = "",
    initialTokens,
}: {
    className?: string;
    initialTokens: ExtensionToken[];
}) {
    const [tokens, setTokens] = useState<ExtensionToken[]>(initialTokens);
    const [tokenLabel, setTokenLabel] = useState("");
    const [creating, setCreating] = useState(false);
    const [revokingId, setRevokingId] = useState<number | null>(null);
    const [status, setStatus] = useState("");
    const [statusTone, setStatusTone] = useState<
        "neutral" | "error" | "success"
    >("neutral");
    const [newToken, setNewToken] = useState("");

    const hasTokens = useMemo(() => tokens.length > 0, [tokens.length]);

    async function refreshTokens() {
        const response = await axios.get(
            route("profile.extension-tokens.index"),
        );
        setTokens(response.data.tokens ?? []);
    }

    async function createToken() {
        setCreating(true);
        setStatus("");
        setNewToken("");

        try {
            const response = await axios.post(
                route("profile.extension-tokens.store"),
                {
                    name: tokenLabel.trim() || undefined,
                },
            );

            setNewToken(response.data.token ?? "");
            setStatus(
                "Token created. Copy it now; it will not be shown again.",
            );
            setStatusTone("success");
            setTokenLabel("");
            await refreshTokens();
        } catch (error) {
            setStatus("Could not create token. Please try again.");
            setStatusTone("error");
        } finally {
            setCreating(false);
        }
    }

    async function revokeToken(tokenId: number) {
        setRevokingId(tokenId);
        setStatus("");

        try {
            await axios.delete(
                route("profile.extension-tokens.destroy", tokenId),
            );
            setStatus("Token revoked.");
            setStatusTone("success");
            setTokens((current) =>
                current.filter((token) => token.id !== tokenId),
            );
        } catch {
            setStatus("Could not revoke token. Please try again.");
            setStatusTone("error");
        } finally {
            setRevokingId(null);
        }
    }

    async function copyToken() {
        if (!newToken) {
            return;
        }

        try {
            await navigator.clipboard.writeText(newToken);
            setStatus("Token copied to clipboard.");
            setStatusTone("success");
        } catch {
            setStatus(
                "Could not copy token automatically. Please copy it manually.",
            );
            setStatusTone("error");
        }
    }

    return (
        <section
            className={className}
            data-testid="profile-extension-tokens-section"
        >
            <header>
                <h2 className="text-lg font-medium text-zinc-900">
                    Chrome Extension Tokens
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                    Create a revokable token for the LetsEat Chrome extension.
                    Keep it private and revoke it anytime.
                </p>
            </header>

            <div className="mt-6 space-y-4">
                <div>
                    <InputLabel
                        htmlFor="extension_token_label"
                        value="Token label (optional)"
                    />
                    <TextInput
                        id="extension_token_label"
                        className="mt-1 block w-full rounded-xl border-red-200 bg-red-50 text-zinc-900 placeholder:text-zinc-500 focus:border-red-400 focus:ring-red-200"
                        value={tokenLabel}
                        onChange={(event) => setTokenLabel(event.target.value)}
                        placeholder="Chrome on MacBook"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <PrimaryButton
                        type="button"
                        onClick={createToken}
                        disabled={creating}
                        className="rounded-full bg-red-500 px-5 py-2 text-white hover:bg-red-600 focus:bg-red-600 active:bg-red-700 focus:ring-red-300"
                        data-testid="profile-extension-tokens-create"
                    >
                        {creating ? "Creating..." : "Create Token"}
                    </PrimaryButton>
                </div>

                {newToken ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-800">
                            Copy this token now
                        </p>
                        <p className="mt-1 break-all rounded-lg border border-emerald-200 bg-white p-2 text-sm text-zinc-800">
                            {newToken}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                            <SecondaryButton
                                type="button"
                                onClick={copyToken}
                                className="rounded-full border border-emerald-200 px-4 py-2 text-xs normal-case tracking-normal text-emerald-800"
                                data-testid="profile-extension-tokens-copy"
                            >
                                Copy Token
                            </SecondaryButton>
                            <SecondaryButton
                                type="button"
                                onClick={() => setNewToken("")}
                                className="rounded-full border border-zinc-200 px-4 py-2 text-xs normal-case tracking-normal text-zinc-700"
                            >
                                Hide
                            </SecondaryButton>
                        </div>
                    </div>
                ) : null}

                {status ? (
                    <p
                        className={`text-sm ${
                            statusTone === "error"
                                ? "text-amber-700"
                                : statusTone === "success"
                                  ? "text-emerald-700"
                                  : "text-zinc-600"
                        }`}
                        data-testid="profile-extension-tokens-status"
                    >
                        {status}
                    </p>
                ) : null}
            </div>

            <div className="mt-6">
                {hasTokens ? (
                    <ul
                        className="space-y-2"
                        data-testid="profile-extension-tokens-list"
                    >
                        {tokens.map((token) => (
                            <li
                                key={token.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/50 px-3 py-3"
                                data-testid={`profile-extension-token-item-${token.id}`}
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-zinc-800">
                                        {shortName(token.name)}
                                    </p>
                                    <p className="truncate text-xs text-zinc-600">
                                        Created: {formatDate(token.created_at)}
                                    </p>
                                    <p className="truncate text-xs text-zinc-600">
                                        Last used:{" "}
                                        {formatDate(token.last_used_at)}
                                    </p>
                                </div>
                                <DangerButton
                                    type="button"
                                    onClick={() => revokeToken(token.id)}
                                    disabled={revokingId === token.id}
                                    className="rounded-full px-4 py-2 text-xs normal-case tracking-normal"
                                    data-testid={`profile-extension-token-revoke-${token.id}`}
                                >
                                    {revokingId === token.id
                                        ? "Revoking..."
                                        : "Revoke"}
                                </DangerButton>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p
                        className="text-sm text-zinc-500"
                        data-testid="profile-extension-tokens-empty"
                    >
                        No extension tokens yet.
                    </p>
                )}
            </div>
        </section>
    );
}
