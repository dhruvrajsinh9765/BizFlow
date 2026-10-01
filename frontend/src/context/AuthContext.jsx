import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";
import { setAccessToken } from "../services/api";


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessTokenState] = useState(null);
    const [loading, setLoading] = useState(true);


    const login = async (credentials) => {
        const data = await authService.login(credentials);

        setAccessToken(data.accessToken);
        setAccessTokenState(data.accessToken);
        setUser(data.user);

        return data;
    };


    const register = async (userData) => {
        return await authService.register(userData);
    };


    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setAccessToken(null);
            setAccessTokenState(null);
            setUser(null);
        }
    };


    const clearSession = () => {
        setAccessToken(null);
        setAccessTokenState(null);
        setUser(null);
    };


    const refreshSession = async () => {
        try {
            const data = await authService.refreshToken();

            setAccessToken(data.accessToken);
            setAccessTokenState(data.accessToken);

            const profile = await authService.getProfile();

            setUser(profile);

            return true;
        } catch {
            clearSession();

            return false;
        }
    };


    useEffect(() => {
        const initializeAuth = async () => {
            await refreshSession();
            setLoading(false);
        };

        initializeAuth();

        // refreshSession is intentionally called only during
        // authentication initialization.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const value = {
        user,
        accessToken,
        isAuthenticated: Boolean(accessToken),
        loading,
        login,
        register,
        logout,
        clearSession,
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within an AuthProvider"
        );
    }

    return context;
};

