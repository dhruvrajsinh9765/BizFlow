import api from "./api";

const getInsights = async () => {
    const response = await api.get("/insights");
    return response.data;
};

export default {
    getInsights,
};