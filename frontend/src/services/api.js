import axios from "axios";

let accessToken = null;
let refreshPromise = null;
let sessionExpiredHandler = null;

export const setSessionExpiredHandler = (handler) => {
    sessionExpiredHandler = handler;
};

export const setAccessToken = (token) => {
    accessToken = token;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            originalRequest?.url?.includes("/users/refresh-token") ||
            originalRequest?.url?.includes("/users/login") ||
            originalRequest?.url?.includes("/users/register") ||
            originalRequest?._retry
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = api
                    .post("/users/refresh-token")
                    .then((response) => {
                        const newAccessToken = response.data.accessToken;

                        setAccessToken(newAccessToken);

                        return newAccessToken;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newAccessToken = await refreshPromise;

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            refreshPromise = null;
            setAccessToken(null);

            if (sessionExpiredHandler) {
                sessionExpiredHandler();
            }

            return Promise.reject(refreshError);
        }
    }
);

export default api;