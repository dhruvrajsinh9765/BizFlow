import api from "./api";

const createBusiness = async (businessData) => {
    const response = await api.post("/business", businessData);
    return response.data;
};

const getBusiness = async () => {
    const response = await api.get("/business");
    return response.data;
};

const updateBusiness = async (businessData) => {
    const response = await api.put("/business", businessData);
    return response.data;
};

export default {
    createBusiness,
    getBusiness,
    updateBusiness,
};