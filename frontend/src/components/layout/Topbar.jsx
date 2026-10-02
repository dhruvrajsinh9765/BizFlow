import { LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const pageTitles = {
    "/overview": {
        title: "Overview",
        description: "A clear view of your business",
    },
    "/transactions": {
        title: "Transactions",
        description: "Manage your financial activity",
    },
    "/contacts": {
        title: "Contacts",
        description: "Manage customers and suppliers",
    },
    "/categories": {
        title: "Categories",
        description: "Organize your financial activity",
    },
    "/analytics": {
        title: "Analytics",
        description: "Understand business performance",
    },
    "/ai-analyst": {
        title: "AI Analyst",
        description: "Understand what is changing and why",
    },
    "/settings": {
        title: "Settings",
        description: "Manage your workspace",
    },
};

const BrandMark = () => {
    return (
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 shadow-md shadow-indigo-950/30 ring-1 ring-white/10">
            <span className="font-['Space_Grotesk'] text-sm font-bold tracking-[-0.04em] text-white">
                B
            </span>
        </div>
    );
};

const Topbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const userInitial =
        user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

    const currentPage = pageTitles[location.pathname] || {
        title: "BizFlow",
        description: "Business finance workspace",
    };

    return (
        <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/90 shadow-sm shadow-black/10 backdrop-blur-2xl lg:left-64">
            <div className="flex h-full items-center justify-between px-4 sm:px-6">
                {/* Page context */}
                <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                        <div className="lg:hidden">
                            <BrandMark />
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate font-['Space_Grotesk'] text-base font-semibold tracking-[-0.015em] text-slate-100 sm:text-[17px]">
                                {currentPage.title}
                            </h2>
                            <p className="hidden truncate text-[11px] leading-4 text-slate-500 sm:block">
                                {currentPage.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* User */}
                    <div className="flex items-center gap-2.5 rounded-xl border border-transparent px-1.5 py-1 transition-colors duration-200 hover:border-slate-800/80 hover:bg-slate-900/60 sm:px-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300 ring-1 ring-indigo-400/20">
                            {userInitial}
                        </div>

                        <div className="hidden min-w-0 sm:block">
                            <p className="max-w-36 truncate text-sm font-medium text-slate-100">
                                {user?.name || "User"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Business Owner
                            </p>
                        </div>
                    </div>

                    <div
                        className="hidden h-6 w-px bg-slate-800 sm:block"
                        aria-hidden="true"
                    />

                    {/* Logout */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        title="Logout"
                        aria-label="Logout"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-400 transition-all duration-200 hover:border-red-400/10 hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 active:scale-[0.97]"
                    >
                        <LogOut size={18} strokeWidth={1.9} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
