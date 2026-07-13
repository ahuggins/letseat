import { useEffect, FormEventHandler } from "react";
import Checkbox from "@/Components/Checkbox";
import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, router, useForm } from "@inertiajs/react";

const routeOr = (name: string, fallback: string) => {
    const routeFn = (globalThis as { route?: (routeName: string) => string })
        .route;

    return typeof routeFn === "function" ? routeFn(name) : fallback;
};

export default function Login({
    status,
    canResetPassword,
    environment,
}: {
    status?: string;
    canResetPassword: boolean;
    environment: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset("password");
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(routeOr("login", "/login"));
    };

    const loginLinkRoute = routeOr(
        "loginLinkLogin",
        "/laravel-login-link-login",
    );
    const recipesRoute = routeOr("recipes", "/recipes");
    const forgotPasswordRoute = routeOr("password.request", "/forgot-password");

    const loginAs = (email: string) => {
        router.post(loginLinkRoute, {
            email,
            key: null,
            redirect_url: recipesRoute,
            guard: null,
            user_attributes: null,
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                    Welcome back
                </p>
                <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900">
                    Log in to Let&apos;s Eat
                </h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Save recipes, comment, and pick up where you left off.
                </p>
            </div>

            {environment === "local" && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                        onClick={() => loginAs("andrewhuggins@gmail.com")}
                    >
                        Login as andrewhuggins@gmail.com
                    </button>

                    <button
                        type="button"
                        className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                        onClick={() => loginAs("nicolelane.168@gmail.com")}
                    >
                        Login as nicolelane.168@gmail.com
                    </button>
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Email"
                        className="text-zinc-800"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-xl border-red-200 bg-white/95 focus:border-red-500 focus:ring-red-500"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData("email", e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password"
                        value="Password"
                        className="text-zinc-800"
                    />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-xl border-red-200 bg-white/95 focus:border-red-500 focus:ring-red-500"
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>
                <div className="block mt-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-zinc-700">
                            Remember me
                        </span>
                    </label>
                </div>
                <div className="flex items-center justify-end mt-4">
                    {canResetPassword && (
                        <Link
                            href={forgotPasswordRoute}
                            className="rounded-md text-sm font-medium text-red-700 underline decoration-red-300 underline-offset-4 transition-colors hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton
                        className="ms-4 rounded-xl border-red-700 bg-red-600 text-white hover:bg-red-700 focus:bg-red-700 focus:ring-red-500 active:bg-red-800"
                        disabled={processing}
                    >
                        Log in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
