import api from "./api";

const getDashboardSummary = async () => {
    const response = await api.get("/dashboard");
    return response.data;
};

const getFinancialAnalytics = async (params) => {
    const response = await api.get("/dashboard/analytics", {
        params,
    });

    return response.data;
};

export default {
    getDashboardSummary,
    getFinancialAnalytics,
};