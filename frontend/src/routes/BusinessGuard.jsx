import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import businessService from "../services/businessService";

const BusinessGuard = () => {
    const [loading, setLoading] = useState(true);
    const [hasBusiness, setHasBusiness] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const checkBusiness = async () => {
            try {
                await businessService.getBusiness();
                setHasBusiness(true);
            } catch (error) {
                if (error.response?.status === 404) {
                    setHasBusiness(false);
                } else {
                    setError(
                        "Unable to verify your business profile. Please try again."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        checkBusiness();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center">
                <div>
                    <h2 className="text-lg font-semibold text-white">
                        Something went wrong
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        {error}
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!hasBusiness) {
        return <Navigate to="/business-setup" replace />;
    }

    return <Outlet />;
};

export default BusinessGuard;