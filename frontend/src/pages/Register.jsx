import { useState } from "react";
import {
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

        if (error) {
            setError("");
        }
    };

    const validatePassword = (password) => {
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        };
    };

    const passwordChecks = validatePassword(formData.password);

    const passwordRequirements = [
        {
            key: "length",
            label: "8+ characters",
        },
        {
            key: "uppercase",
            label: "Uppercase letter",
        },
        {
            key: "lowercase",
            label: "Lowercase letter",
        },
        {
            key: "number",
            label: "Number",
        },
        {
            key: "special",
            label: "Special character",
        },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const passwordValid = Object.values(passwordChecks).every(Boolean);

        if (!passwordValid) {
            setError("Please meet all password requirements.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            navigate("/login");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to create account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
            {/* Background decoration */}
            <div
                className="pointer-events-none fixed inset-0"
                aria-hidden="true"
            >
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.03] blur-3xl" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/70 shadow-2xl shadow-black/40 backdrop-blur-xl">
                    <div className="grid min-h-[720px] lg:grid-cols-[0.95fr_1.05fr]">
                        {/* Left brand panel */}
                        <div className="relative hidden overflow-hidden border-r border-slate-800/80 bg-slate-950/60 p-10 lg:flex lg:flex-col lg:justify-between xl:p-12">
                            <div
                                className="pointer-events-none absolute inset-0"
                                aria-hidden="true"
                            >
                                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/[0.08] blur-3xl" />
                                <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-indigo-500/[0.05] blur-3xl" />
                            </div>

                            <div className="relative">
                                {/* Logo */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
                                        <span className="font-['Space_Grotesk'] text-lg font-bold text-indigo-400">
                                            B
                                        </span>
                                    </div>

                                    <span className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.03em] text-slate-100">
                                        BizFlow
                                    </span>
                                </div>

                                {/* Main message */}
                                <div className="mt-20 max-w-lg">
                                    <div className="mb-5 inline-flex items-center rounded-full border border-indigo-400/15 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
                                        Built for growing businesses
                                    </div>

                                    <h1 className="font-['Space_Grotesk'] text-4xl font-semibold leading-[1.1] tracking-[-0.035em] text-white xl:text-5xl">
                                        Start with a clearer view of your
                                        business.
                                    </h1>

                                    <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                                        Bring your transactions, contacts,
                                        categories, analytics, and business
                                        insights together in one focused
                                        workspace.
                                    </p>
                                </div>

                                {/* Feature cards */}
                                <div className="mt-10 space-y-3">
                                    <div className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                                            <Check
                                                size={19}
                                                strokeWidth={2}
                                            />
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-slate-200">
                                                Organize
                                            </p>
                                            <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                                Keep business activity in one
                                                place.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                                            <Check
                                                size={19}
                                                strokeWidth={2}
                                            />
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-slate-200">
                                                Understand
                                            </p>
                                            <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                                See trends and financial
                                                performance clearly.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                                            <Check
                                                size={19}
                                                strokeWidth={2}
                                            />
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-slate-200">
                                                Act
                                            </p>
                                            <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                                Turn business data into useful
                                                next steps.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative mt-10 border-t border-slate-800/70 pt-5">
                                <p className="text-xs leading-5 text-slate-600">
                                    A focused workspace for managing and
                                    understanding your business.
                                </p>
                            </div>
                        </div>

                        {/* Form panel */}
                        <div className="flex items-center bg-slate-900/50 p-6 sm:p-8 lg:p-10 xl:p-12">
                            <div className="mx-auto w-full max-w-md">
                                {/* Mobile logo */}
                                <div className="mb-10 flex items-center gap-3 lg:hidden">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
                                        <span className="font-['Space_Grotesk'] text-lg font-bold text-indigo-400">
                                            B
                                        </span>
                                    </div>

                                    <span className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.03em] text-slate-100">
                                        BizFlow
                                    </span>
                                </div>

                                {/* Heading */}
                                <div>
                                    <p className="text-sm font-medium text-indigo-400">
                                        Get started
                                    </p>

                                    <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.03em] text-white">
                                        Create your account
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-slate-400">
                                        Set up your workspace and start
                                        managing your business with clarity.
                                    </p>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div
                                        role="alert"
                                        className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300"
                                    >
                                        {error}
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-8 space-y-5"
                                >
                                    {/* Name */}
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-medium text-slate-300"
                                        >
                                            Full name
                                        </label>

                                        <div className="relative">
                                            <User
                                                size={18}
                                                strokeWidth={1.8}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                                            />

                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your name"
                                                autoComplete="name"
                                                required
                                                disabled={loading}
                                                className="w-full rounded-xl border border-slate-700/90 bg-slate-950/70 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-medium text-slate-300"
                                        >
                                            Email address
                                        </label>

                                        <div className="relative">
                                            <Mail
                                                size={18}
                                                strokeWidth={1.8}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                                            />

                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                required
                                                disabled={loading}
                                                className="w-full rounded-xl border border-slate-700/90 bg-slate-950/70 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-sm font-medium text-slate-300"
                                        >
                                            Password
                                        </label>

                                        <div className="relative">
                                            <LockKeyhole
                                                size={18}
                                                strokeWidth={1.8}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
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
                                                placeholder="Create a strong password"
                                                autoComplete="new-password"
                                                required
                                                disabled={loading}
                                                className="w-full rounded-xl border border-slate-700/90 bg-slate-950/70 py-3 pl-11 pr-12 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (prev) => !prev
                                                    )
                                                }
                                                disabled={loading}
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>

                                        {/* Password requirements */}
                                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                                            {passwordRequirements.map(
                                                (requirement) => {
                                                    const valid =
                                                        passwordChecks[
                                                            requirement.key
                                                        ];

                                                    return (
                                                        <div
                                                            key={
                                                                requirement.key
                                                            }
                                                            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                                                                valid
                                                                    ? "text-emerald-400"
                                                                    : "text-slate-500"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                                                    valid
                                                                        ? "border-emerald-400/30 bg-emerald-500/10"
                                                                        : "border-slate-700 bg-slate-800/60"
                                                                }`}
                                                            >
                                                                {valid && (
                                                                    <Check
                                                                        size={
                                                                            10
                                                                        }
                                                                        strokeWidth={
                                                                            2.5
                                                                        }
                                                                    />
                                                                )}
                                                            </span>

                                                            <span>
                                                                {
                                                                    requirement.label
                                                                }
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>

                                    {/* Confirm password */}
                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="mb-2 block text-sm font-medium text-slate-300"
                                        >
                                            Confirm password
                                        </label>

                                        <div className="relative">
                                            <LockKeyhole
                                                size={18}
                                                strokeWidth={1.8}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                                            />

                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    formData.confirmPassword
                                                }
                                                onChange={handleChange}
                                                placeholder="Re-enter your password"
                                                autoComplete="new-password"
                                                required
                                                disabled={loading}
                                                className="w-full rounded-xl border border-slate-700/90 bg-slate-950/70 py-3 pl-11 pr-12 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (prev) => !prev
                                                    )
                                                }
                                                disabled={loading}
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide confirm password"
                                                        : "Show confirm password"
                                                }
                                                className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/25 transition-all duration-200 hover:border-indigo-300/30 hover:bg-indigo-400 hover:shadow-xl hover:shadow-indigo-950/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                Create account
                                                <ArrowRight
                                                    size={17}
                                                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                                                />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Login link */}
                                <p className="mt-7 text-center text-sm text-slate-500">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="font-medium text-indigo-400 transition-colors hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                                    >
                                        Sign in
                                    </Link>
                                </p>

                                <p className="mt-8 text-center text-xs leading-5 text-slate-600">
                                    Create your account to access your BizFlow
                                    workspace.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;