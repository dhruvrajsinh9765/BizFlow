import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Receipt,
    Users,
    Tags,
    BarChart3,
    Sparkles,
    Settings,
} from "lucide-react";

const navigationItems = [
    {
        name: "Overview",
        path: "/overview",
        icon: LayoutDashboard,
    },
    {
        name: "Transactions",
        path: "/transactions",
        icon: Receipt,
    },
    {
        name: "Contacts",
        path: "/contacts",
        icon: Users,
    },
    {
        name: "Categories",
        path: "/categories",
        icon: Tags,
    },
    {
        name: "Analytics",
        path: "/analytics",
        icon: BarChart3,
    },
    {
        name: "AI Analyst",
        path: "/ai-analyst",
        icon: Sparkles,
    },
    {
        name: "Settings",
        path: "/settings",
        icon: Settings,
    },
];

const BrandMark = () => {
    return (
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 shadow-lg shadow-indigo-950/30 ring-1 ring-white/10">
            <span className="font-['Space_Grotesk'] text-base font-bold tracking-[-0.04em] text-white">
                B
            </span>
            <span
                className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white/10 blur-[1px]"
                aria-hidden="true"
            />
        </div>
    );
};

const Sidebar = () => {
    return (
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl lg:block">
            {/* Brand */}
            <div className="flex h-16 items-center border-b border-slate-800/80 px-5">
                <div className="flex items-center gap-3">
                    <BrandMark />

                    <div className="min-w-0">
                        <h1 className="font-['Space_Grotesk'] text-[19px] font-bold leading-none tracking-[-0.025em] text-slate-100">
                            BizFlow
                        </h1>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
                            Finance workspace
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="px-3 py-5">
                <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Workspace
                </p>

                <div className="space-y-1">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${
                                        isActive
                                            ? "bg-indigo-500/10 text-slate-100 shadow-sm shadow-indigo-950/20 ring-1 ring-inset ring-indigo-400/10"
                                            : "text-slate-400 hover:bg-slate-800/55 hover:text-slate-100"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <span
                                                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgb(129_140_248/0.35)]"
                                                aria-hidden="true"
                                            />
                                        )}

                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                                                isActive
                                                    ? "bg-indigo-500/10"
                                                    : "bg-transparent group-hover:bg-slate-800/70"
                                            }`}
                                        >
                                            <Icon
                                                size={17}
                                                strokeWidth={isActive ? 2.15 : 1.9}
                                                className={
                                                    isActive
                                                        ? "text-indigo-400"
                                                        : "text-slate-500 transition-colors duration-200 group-hover:text-slate-300"
                                                }
                                            />
                                        </span>

                                        <span>{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800/70 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153/0.45)]" />
                    <span className="text-xs font-medium text-slate-500">
                        Workspace active
                    </span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
