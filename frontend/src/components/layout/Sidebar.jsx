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

const Sidebar = () => {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-800 bg-slate-950">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-slate-800 px-6">
                <h1 className="font-['Space_Grotesk'] text-xl font-bold text-white">
                    BizFlow
                </h1>
            </div>

            {/* Navigation */}
            <nav className="p-4">
                <div className="space-y-1">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-indigo-500/10 text-indigo-400"
                                            : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={19} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;