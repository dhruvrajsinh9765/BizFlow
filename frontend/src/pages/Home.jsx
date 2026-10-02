import { useState } from "react";

import {

    ArrowRight,

    BarChart3,

    CheckCircle2,

    ChevronRight,

    Menu,

    Receipt,

    Sparkles,

    TrendingUp,

    WalletCards,

    X,

} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";



const Home = () => {

    const { isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



    return (

        <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">

            {/* Background atmosphere */}

            <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

                <div className="absolute left-1/2 top-[-280px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="absolute right-[-200px] top-[45%] h-[420px] w-[420px] rounded-full bg-indigo-500/5 blur-3xl" />

            </div>



            {/* Navigation */}
            <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link
                            to="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
                                <span className="font-['Space_Grotesk'] text-base font-bold text-indigo-400">
                                    B
                                </span>
                            </div>

                            <span className="font-['Space_Grotesk'] text-xl font-bold tracking-[-0.02em] text-slate-100">
                                BizFlow
                            </span>
                        </Link>

                        {/* Desktop navigation */}
                        <nav className="hidden items-center gap-8 md:flex">
                            <a
                                href="#features"
                                className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-100"
                            >
                                Features
                            </a>

                            <a
                                href="#analytics"
                                className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-100"
                            >
                                Analytics
                            </a>

                            <a
                                href="#ai"
                                className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-100"
                            >
                                AI Analyst
                            </a>
                        </nav>

                        {/* Desktop actions */}
                        <div className="hidden items-center gap-2.5 md:flex">
                            {isAuthenticated ? (
                                <Link
                                    to="/overview"
                                    className="group inline-flex min-h-9 items-center gap-2 rounded-lg border border-indigo-400/20 bg-indigo-500 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-950/20 transition-all duration-200 hover:bg-indigo-400 hover:shadow-md hover:shadow-indigo-950/30"
                                >
                                    Dashboard
                                    <ArrowRight
                                        size={15}
                                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                                    />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="inline-flex min-h-9 items-center rounded-lg px-3.5 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
                                    >
                                        Sign in
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="group inline-flex min-h-9 items-center gap-2 rounded-lg border border-indigo-400/20 bg-indigo-500 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-950/20 transition-all duration-200 hover:bg-indigo-400 hover:shadow-md hover:shadow-indigo-950/30"
                                    >
                                        Get Started
                                        <ArrowRight
                                            size={15}
                                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                                        />
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            aria-label={
                                mobileMenuOpen
                                    ? "Close navigation menu"
                                    : "Open navigation menu"
                            }
                            aria-expanded={mobileMenuOpen}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 text-slate-400 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 md:hidden"
                        >
                            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
                        </button>
                    </div>

                    {/* Mobile navigation */}
                    {mobileMenuOpen && (
                        <div className="border-t border-slate-800/80 py-4 md:hidden">
                            <nav className="flex flex-col gap-1">
                                <a
                                    href="#features"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
                                >
                                    Features
                                </a>

                                <a
                                    href="#analytics"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
                                >
                                    Analytics
                                </a>

                                <a
                                    href="#ai"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
                                >
                                    AI Analyst
                                </a>

                                <div className="my-2 h-px bg-slate-800/80" />

                                {isAuthenticated ? (
                                    <Link
                                        to="/overview"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-400/20 bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-indigo-400"
                                    >
                                        Dashboard
                                        <ArrowRight size={15} />
                                    </Link>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
                                        >
                                            Sign in
                                        </Link>

                                        <Link
                                            to="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-400/20 bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-indigo-400"
                                        >
                                            Get Started
                                            <ArrowRight size={15} />
                                        </Link>
                                    </div>
                                )}
                            </nav>
                        </div>
                    )}
                </div>
            </header>



            <main className="relative z-10">

                {/* Hero */}

                <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-32">
                    <div
                        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-indigo-500/[0.06] blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative mx-auto max-w-7xl">

                        <div className="mx-auto max-w-4xl text-center">

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/15 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-medium text-indigo-300 shadow-sm shadow-indigo-950/20">

                                <Sparkles size={14} />

                                <span>Smart finance management for modern businesses</span>

                            </div>



                            <h1 className="font-['Space_Grotesk'] text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">

                                Know where your business stands.

                                <span className="block text-indigo-400">

                                    Know what to do next.

                                </span>

                            </h1>



                            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">

                                Manage transactions, understand your financial

                                performance, and turn business data into clear

                                next steps — all from one focused workspace.

                            </p>



                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

                                <Link

                                    to={isAuthenticated ? "/overview" : "/register"}

                                    className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/20 transition-all duration-200 hover:bg-indigo-400 hover:shadow-indigo-950/30"

                                >

                                    {isAuthenticated

                                        ? "Open Dashboard"

                                        : "Start for Free"}



                                    <ArrowRight

                                        size={17}

                                        className="transition-transform duration-200 group-hover:translate-x-0.5"

                                    />

                                </Link>



                                <a

                                    href="#features"

                                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/70 px-5 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white"

                                >

                                    Explore features

                                </a>

                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-600">

                                <span>Transactions</span>

                                <span className="h-1 w-1 rounded-full bg-slate-700" />

                                <span>Analytics</span>

                                <span className="h-1 w-1 rounded-full bg-slate-700" />

                                <span>AI Insights</span>

                            </div>

                        </div>



                        {/* Product preview */}

                        <div className="relative mx-auto mt-16 max-w-6xl sm:mt-20">

                            <div className="absolute -inset-6 rounded-[28px] bg-indigo-500/5 blur-2xl" />



                            <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/50">

                                {/* Browser chrome */}

                                <div className="flex h-11 items-center gap-2 border-b border-slate-800 bg-slate-950/80 px-4">

                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />

                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />

                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />



                                    <div className="mx-auto hidden h-6 w-1/2 rounded-md border border-slate-800 bg-slate-900 sm:block" />

                                </div>



                                {/* Dashboard preview */}

                                <div className="grid min-h-[430px] grid-cols-[150px_1fr] bg-slate-950/60">

                                    <div className="hidden border-r border-slate-800/80 p-4 sm:block">

                                        <div className="mb-7 flex items-center gap-2">

                                            <div className="h-6 w-6 rounded-md bg-indigo-500/20" />

                                            <div className="h-3 w-16 rounded bg-slate-700" />

                                        </div>



                                        <div className="space-y-2">

                                            {[1, 2, 3, 4, 5, 6].map((item) => (

                                                <div

                                                    key={item}

                                                    className={`h-8 rounded-lg ${

                                                        item === 1

                                                            ? "bg-indigo-500/10"

                                                            : ""

                                                    }`}

                                                />

                                            ))}

                                        </div>

                                    </div>



                                    <div className="p-5 sm:p-7">

                                        <div className="flex items-center justify-between">

                                            <div>

                                                <div className="h-5 w-32 rounded bg-slate-700" />

                                                <div className="mt-2 h-3 w-48 rounded bg-slate-800" />

                                            </div>



                                            <div className="hidden h-8 w-24 rounded-lg bg-slate-800 sm:block" />

                                        </div>



                                        <div className="mt-7 grid gap-3 sm:grid-cols-3">

                                            {[

                                                ["Revenue", "₹2,84,500"],

                                                ["Expenses", "₹1,67,200"],

                                                ["Profit", "₹1,17,300"],

                                            ].map(([label, value], index) => (

                                                <div

                                                    key={label}

                                                    className="rounded-xl border border-slate-800 bg-slate-900 p-4"

                                                >

                                                    <div className="flex items-center justify-between">

                                                        <span className="text-[11px] text-slate-500">

                                                            {label}

                                                        </span>



                                                        <span

                                                            className={`h-6 w-6 rounded-md ${

                                                                index === 2

                                                                    ? "bg-emerald-500/10"

                                                                    : "bg-indigo-500/10"

                                                            }`}

                                                        />

                                                    </div>



                                                    <p className="mt-3 font-['Space_Grotesk'] text-xl font-semibold text-slate-100">

                                                        {value}

                                                    </p>



                                                    <div className="mt-2 h-2 w-16 rounded-full bg-slate-800" />

                                                </div>

                                            ))}

                                        </div>



                                        <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">

                                            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

                                                <div className="flex items-center justify-between">

                                                    <div>

                                                        <div className="h-3 w-28 rounded bg-slate-700" />

                                                        <div className="mt-2 h-2.5 w-40 rounded bg-slate-800" />

                                                    </div>



                                                    <div className="h-7 w-16 rounded-md bg-slate-800" />

                                                </div>



                                                <div className="mt-7 flex h-40 items-end gap-2">

                                                    {[35, 48, 42, 65, 55, 76, 68, 84, 72, 92, 80, 96].map(

                                                        (height, index) => (

                                                            <div

                                                                key={index}

                                                                className="flex-1 rounded-t bg-indigo-500/40"

                                                                style={{

                                                                    height: `${height}%`,

                                                                }}

                                                            />

                                                        )

                                                    )}

                                                </div>

                                            </div>



                                            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

                                                <div className="flex items-center gap-2">

                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">

                                                        <Sparkles size={14} />

                                                    </div>



                                                    <div className="h-3 w-24 rounded bg-slate-700" />

                                                </div>



                                                <div className="mt-5 space-y-2">

                                                    <div className="h-2.5 w-full rounded bg-slate-800" />

                                                    <div className="h-2.5 w-[90%] rounded bg-slate-800" />

                                                    <div className="h-2.5 w-[76%] rounded bg-slate-800" />

                                                </div>



                                                <div className="mt-5 h-8 w-24 rounded-lg bg-indigo-500/10" />

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>



                {/* Core features */}

                <section

                    id="features"

                    className="border-y border-slate-800/70 bg-slate-900/30 px-4 py-20 sm:px-6 lg:px-8"

                >

                    <div className="mx-auto max-w-7xl">

                        <div className="max-w-2xl">

                            <p className="text-sm font-medium text-indigo-400">

                                Everything in one place

                            </p>



                            <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">

                                Built around the way your business actually

                                works.

                            </h2>



                            <p className="mt-4 text-base leading-7 text-slate-400">

                                Keep everyday financial management simple while

                                still having the depth to understand what is

                                happening in your business.

                            </p>

                        </div>



                        <div className="mt-12 grid gap-4 md:grid-cols-3">

                            {[

                                {

                                    icon: Receipt,

                                    title: "Track transactions",

                                    description:

                                        "Record income and expenses, organize them by category, and keep your financial activity in one place.",

                                },

                                {

                                    icon: BarChart3,

                                    title: "Understand performance",

                                    description:

                                        "See revenue, expenses, profit, trends, payment methods, and category performance without digging through spreadsheets.",

                                },

                                {

                                    icon: Sparkles,

                                    title: "Get actionable insights",

                                    description:

                                        "Turn your business data into explanations, risks, opportunities, and practical next steps.",

                                },

                            ].map((feature) => {

                                const Icon = feature.icon;



                                return (

                                    <div

                                        key={feature.title}

                                        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900"

                                    >

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/10 text-indigo-400">

                                            <Icon

                                                size={20}

                                                strokeWidth={1.8}

                                            />

                                        </div>



                                        <h3 className="mt-5 font-['Space_Grotesk'] text-lg font-semibold text-slate-100">

                                            {feature.title}

                                        </h3>



                                        <p className="mt-2 text-sm leading-6 text-slate-400">

                                            {feature.description}

                                        </p>

                                    </div>

                                );

                            })}

                        </div>

                    </div>

                </section>



                {/* Analytics */}

                <section

                    id="analytics"

                    className="px-4 py-20 sm:px-6 lg:px-8"

                >

                    <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">

                        <div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/10 text-indigo-400">

                                <TrendingUp size={21} />

                            </div>



                            <p className="mt-6 text-sm font-medium text-indigo-400">

                                Clear financial visibility

                            </p>



                            <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">

                                Stop looking at numbers without context.

                            </h2>



                            <p className="mt-4 text-base leading-7 text-slate-400">

                                BizFlow turns your financial activity into

                                meaningful comparisons so you can see what

                                changed and understand the direction of your

                                business.

                            </p>



                            <div className="mt-7 space-y-4">

                                {[

                                    "Compare performance across different periods.",

                                    "Identify changes in revenue, expenses, and profit.",

                                    "Break down activity by category and payment method.",

                                ].map((item) => (

                                    <div

                                        key={item}

                                        className="flex items-start gap-3"

                                    >

                                        <CheckCircle2

                                            size={18}

                                            className="mt-0.5 shrink-0 text-emerald-400"

                                        />



                                        <span className="text-sm leading-6 text-slate-300">

                                            {item}

                                        </span>

                                    </div>

                                ))}

                            </div>

                        </div>



                        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20 sm:p-6">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm font-medium text-slate-200">

                                        Financial performance

                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">

                                        Last 6 months

                                    </p>

                                </div>



                                <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">

                                    6M

                                </div>

                            </div>



                            <div className="mt-7 flex h-52 items-end gap-3">

                                {[42, 51, 47, 65, 72, 88].map(

                                    (height, index) => (

                                        <div

                                            key={index}

                                            className="flex flex-1 flex-col items-center gap-2"

                                        >

                                            <div

                                                className="w-full max-w-12 rounded-t-lg bg-indigo-500/45 transition-all duration-300"

                                                style={{

                                                    height: `${height}%`,

                                                }}

                                            />



                                            <span className="text-[10px] text-slate-600">

                                                {

                                                    [

                                                        "May",

                                                        "Jun",

                                                        "Jul",

                                                        "Aug",

                                                        "Sep",

                                                        "Oct",

                                                    ][index]

                                                }

                                            </span>

                                        </div>

                                    )

                                )}

                            </div>



                            <div className="mt-6 grid grid-cols-2 gap-3">

                                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

                                    <p className="text-xs text-slate-500">

                                        Revenue growth

                                    </p>

                                    <p className="mt-2 font-['Space_Grotesk'] text-xl font-semibold text-emerald-400">

                                        +18.4%

                                    </p>

                                </div>



                                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

                                    <p className="text-xs text-slate-500">

                                        Profit margin

                                    </p>

                                    <p className="mt-2 font-['Space_Grotesk'] text-xl font-semibold text-slate-100">

                                        41.2%

                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>



                {/* AI Analyst */}

                <section

                    id="ai"

                    className="border-y border-slate-800/70 bg-slate-900/30 px-4 py-20 sm:px-6 lg:px-8"

                >

                    <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">

                        <div className="order-2 lg:order-1">

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/20 sm:p-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-400/10">

                                        <Sparkles size={19} />

                                    </div>



                                    <div>

                                        <p className="text-sm font-semibold text-slate-100">

                                            AI Analyst

                                        </p>



                                        <p className="text-xs text-slate-500">

                                            Business intelligence

                                        </p>

                                    </div>

                                </div>



                                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4">

                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">

                                        Insight

                                    </p>



                                    <p className="mt-3 text-sm leading-6 text-slate-300">

                                        Expenses increased this month, mainly

                                        due to higher operating costs. Revenue

                                        remained stable, so your profit margin

                                        narrowed compared with the previous

                                        period.

                                    </p>

                                </div>



                                <div className="mt-3 rounded-xl border border-indigo-400/10 bg-indigo-500/5 p-4">

                                    <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">

                                        Recommended action

                                    </p>



                                    <p className="mt-2 text-sm leading-6 text-slate-300">

                                        Review the categories with the largest

                                        month-over-month increase and identify

                                        expenses that can be reduced.

                                    </p>

                                </div>

                            </div>

                        </div>



                        <div className="order-1 lg:order-2">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/10 text-indigo-400">

                                <Sparkles size={21} />

                            </div>



                            <p className="mt-6 text-sm font-medium text-indigo-400">

                                AI-powered business intelligence

                            </p>



                            <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">

                                Numbers tell you what happened.

                                <span className="block text-slate-400">

                                    AI helps explain why.

                                </span>

                            </h2>



                            <p className="mt-4 text-base leading-7 text-slate-400">

                                AI Analyst turns your business data into

                                understandable insights so you can move from

                                simply tracking finances to making informed

                                decisions.

                            </p>



                            <Link

                                to={isAuthenticated ? "/ai-analyst" : "/register"}

                                className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 transition-colors hover:text-indigo-300"

                            >

                                {isAuthenticated

                                    ? "Open AI Analyst"

                                    : "Explore BizFlow"}



                                <ChevronRight

                                    size={16}

                                    className="transition-transform duration-200 group-hover:translate-x-0.5"

                                />

                            </Link>

                        </div>

                    </div>

                </section>



                {/* Final CTA */}

                <section className="px-4 py-20 sm:px-6 lg:px-8">

                    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/70 px-6 py-14 text-center shadow-xl shadow-black/20 sm:px-10">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/15 bg-indigo-500/10 text-indigo-400">

                            <WalletCards size={23} />

                        </div>



                        <h2 className="mt-6 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">

                            Bring your business finances into focus.

                        </h2>



                        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">

                            Track your money, understand your performance, and

                            make your next business decision with more clarity.

                        </p>



                        <Link

                            to={isAuthenticated ? "/overview" : "/register"}

                            className="group mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/20 transition-all duration-200 hover:bg-indigo-400 hover:shadow-indigo-950/30"

                        >

                            {isAuthenticated

                                ? "Open Dashboard"

                                : "Get Started"}



                            <ArrowRight

                                size={17}

                                className="transition-transform duration-200 group-hover:translate-x-0.5"

                            />

                        </Link>

                    </div>

                </section>

            </main>



            {/* Footer */}

            <footer className="border-t border-slate-800/70 px-4 py-8 sm:px-6 lg:px-8">

                <div className="mx-auto flex max-w-7xl flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

                    <div className="flex items-center justify-center gap-2 sm:justify-start">

                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10">

                            <span className="font-['Space_Grotesk'] text-xs font-bold text-indigo-400">

                                B

                            </span>

                        </div>



                        <span className="font-['Space_Grotesk'] text-sm font-semibold text-slate-300">

                            BizFlow

                        </span>

                    </div>



                    <p className="text-xs text-slate-600">

                        Smart finance management for modern businesses.

                    </p>

                </div>

            </footer>

        </div>

    );

};



export default Home;