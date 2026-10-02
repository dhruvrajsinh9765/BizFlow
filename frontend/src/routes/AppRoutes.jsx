import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import BusinessGuard from "./BusinessGuard";

import DashboardLayout from "../components/layout/DashboardLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import BusinessSetup from "../pages/BusinessSetup";
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
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Authenticated routes */}
                <Route element={<ProtectedRoute />}>
                    {/* Business setup */}
                    <Route
                        path="/business-setup"
                        element={<BusinessSetup />}
                    />

                    {/* Routes that require a business */}
                    <Route element={<BusinessGuard />}>
                        <Route element={<DashboardLayout />}>
                            <Route
                                path="/overview"
                                element={<Overview />}
                            />

                            <Route
                                path="/transactions"
                                element={<Transactions />}
                            />

                            <Route
                                path="/contacts"
                                element={<Contacts />}
                            />

                            <Route
                                path="/categories"
                                element={<Categories />}
                            />

                            <Route
                                path="/analytics"
                                element={<Analytics />}
                            />

                            <Route
                                path="/ai-analyst"
                                element={<AIAnalyst />}
                            />

                            <Route
                                path="/settings"
                                element={<Settings />}
                            />
                        </Route>
                    </Route>
                </Route>

                {/* Unknown routes */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;