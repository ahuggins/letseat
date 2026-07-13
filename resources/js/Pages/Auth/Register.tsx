import { useEffect, FormEventHandler } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Register({
    featuredRecipe,
}: {
    featuredRecipe?: {
        id: number;
        name: string;
        image: string;
    } | null;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("register"));
    };

    return (
        <GuestLayout featuredRecipe={featuredRecipe}>
            <Head title="Register" />

            <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700/80">
                    Join the table
                </p>
                <h1 className="mt-1 font-serif text-3xl font-semibold text-zinc-900">
                    Create your account
                </h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Build your recipe list and keep everything in one place.
                </p>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel
                        htmlFor="name"
                        value="Name"
                        className="text-zinc-800"
                    />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full rounded-xl border-red-200 bg-white/95 focus:border-red-500 focus:ring-red-500"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData("name", e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
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
                        onChange={(e) => setData("email", e.target.value)}
                        required
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
                        autoComplete="new-password"
                        onChange={(e) => setData("password", e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-zinc-800"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full rounded-xl border-red-200 bg-white/95 focus:border-red-500 focus:ring-red-500"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center justify-end mt-4">
                    <Link
                        href={route("login")}
                        className="rounded-md text-sm font-medium text-red-700 underline decoration-red-300 underline-offset-4 transition-colors hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton
                        className="ms-4 rounded-xl border-red-700 bg-red-600 text-white hover:bg-red-700 focus:bg-red-700 focus:ring-red-500 active:bg-red-800"
                        disabled={processing}
                    >
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
