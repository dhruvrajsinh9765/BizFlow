import api from "./api";

const register = async (userData) => {
    const response = await api.post("/users/register", userData);
    return response.data;
};

const login = async (credentials) => {
    const response = await api.post("/users/login", credentials);
    return response.data;
};

const refreshToken = async () => {
    const response = await api.post("/users/refresh-token");
    return response.data;
};

const logout = async () => {
    const response = await api.post("/users/logout");
    return response.data;
};

const logoutAll = async () => {
    const response = await api.post("/users/logout-all");
    return response.data;
};

const getProfile = async () => {
    const response = await api.get("/users/profile");
    return response.data;
};

const updateProfile = async (userData) => {
    const response = await api.put("/users/profile", userData);
    return response.data;
};

export default {
    register,
    login,
    refreshToken,
    logout,
    logoutAll,
    getProfile,
    updateProfile,
};