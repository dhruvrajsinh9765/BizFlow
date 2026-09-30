import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />

            <Topbar />

            <main className="ml-64 pt-16">
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;