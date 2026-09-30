import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="fixed left-64 right-0 top-0 z-10 h-16 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
            <div className="flex h-full items-center justify-between px-6">
                {/* Page area */}
                <div>
                    <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-white">
                        Business Dashboard
                    </h2>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white"
                    >
                        <Bell size={20} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-400">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-white">
                                {user?.name || "User"}
                            </p>

                            <p className="text-xs text-slate-500">
                                Business Owner
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        title="Logout"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;