import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Overview from "../pages/Overview";
import Transactions from "../pages/Transactions";
import Contacts from "../pages/Contacts";
import Categories from "../pages/Categories";
import Analytics from "../pages/Analytics";
import AIAnalyst from "../pages/AIAnalyst";
import Settings from "../pages/Settings";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Navigate to="/overview" replace />} />
                    <Route path="/overview" element={<Overview />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/ai-analyst" element={<AIAnalyst />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Unknown routes */}
                <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;