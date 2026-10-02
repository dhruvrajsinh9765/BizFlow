import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(formData);
            navigate("/overview");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_35%)]" />
            </div>

            <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid w-full overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/70 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="hidden min-h-[680px] flex-col justify-between border-r border-slate-800/80 bg-slate-950/40 p-10 lg:flex xl:p-14">
                        <div>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2.5"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
                                    <span className="font-['Space_Grotesk'] text-lg font-bold text-indigo-400">
                                        B
                                    </span>
                                </div>
                                <span className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.02em] text-slate-100">
                                    BizFlow
                                </span>
                            </Link>

                            <div className="mt-24 max-w-lg">
                                <div className="mb-5 inline-flex items-center rounded-full border border-indigo-400/15 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
                                    Smart finance management
                                </div>

                                <h1 className="font-['Space_Grotesk'] text-4xl font-semibold leading-tight tracking-[-0.035em] text-white xl:text-5xl">
                                    Run your business with more clarity.
                                </h1>

                                <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
                                    Track your finances, understand performance,
                                    and turn your business data into actionable
                                    insights.
                                </p>

                                <div className="mt-10 space-y-4">
                                    {[
                                        "Keep income and expenses organized",
                                        "See how your business is performing",
                                        "Get practical insights from your data",
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-3 text-sm text-slate-300"
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-400">
                                                ✓
                                            </span>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                                Your business, in one place
                            </p>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                                    <p className="text-xs text-slate-500">Income</p>
                                    <p className="mt-1 font-['Space_Grotesk'] text-lg font-semibold text-slate-100">
                                        ₹84.2K
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                                    <p className="text-xs text-slate-500">Expenses</p>
                                    <p className="mt-1 font-['Space_Grotesk'] text-lg font-semibold text-slate-100">
                                        ₹31.8K
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                                    <p className="text-xs text-slate-500">Balance</p>
                                    <p className="mt-1 font-['Space_Grotesk'] text-lg font-semibold text-emerald-400">
                                        ₹52.4K
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="flex min-h-[680px] items-center justify-center p-6 sm:p-10">
                        <div className="w-full max-w-md">
                            <div className="mb-8 lg:hidden">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2.5"
                                >
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
                                        <span className="font-['Space_Grotesk'] text-base font-bold text-indigo-400">
                                            B
                                        </span>
                                    </div>
                                    <span className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.02em] text-slate-100">
                                        BizFlow
                                    </span>
                                </Link>
                            </div>

                            <div className="mb-8">
                                <p className="mb-3 text-sm font-medium text-indigo-400">
                                    Welcome back
                                </p>
                                <h2 className="font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.03em] text-white">
                                    Sign in to your workspace
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    Enter your credentials to continue managing
                                    your business.
                                </p>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/15 bg-red-500/10 px-4 py-3.5"
                                >
                                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                                    <p className="text-sm leading-5 text-red-300">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-medium text-slate-300"
                                    >
                                        Email
                                    </label>

                                    <div className="relative">
                                        <Mail
                                            size={17}
                                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                                        />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            required
                                            autoComplete="email"
                                            className="w-full rounded-xl border border-slate-700/90 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-slate-300"
                                        >
                                            Password
                                        </label>
                                    </div>

                                    <div className="relative">
                                        <LockKeyhole
                                            size={17}
                                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                                        />
                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            required
                                            autoComplete="current-password"
                                            className="w-full rounded-xl border border-slate-700/90 bg-slate-950/80 py-3 pl-10 pr-12 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (previous) => !previous
                                                )
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-slate-800 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={17} />
                                            ) : (
                                                <Eye size={17} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/20 transition-all duration-200 hover:border-indigo-300/30 hover:bg-indigo-400 hover:shadow-indigo-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight
                                                size={17}
                                                className="transition-transform duration-200 group-hover:translate-x-0.5"
                                            />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-7 border-t border-slate-800/80 pt-6 text-center">
                                <p className="text-sm text-slate-500">
                                    Don't have an account?{" "}
                                    <Link
                                        to="/register"
                                        className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                                    >
                                        Create one
                                    </Link>
                                </p>
                            </div>

                            <p className="mt-6 text-center text-xs text-slate-600">
                                Manage your business finances with clarity.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Login;
