import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />

            <Topbar />

            <main className="pt-16 lg:ml-64">
                <div className="px-4 py-5 sm:px-6 sm:py-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;