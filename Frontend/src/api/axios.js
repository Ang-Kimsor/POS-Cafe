import axios from "axios";
import { triggerGlobalShow, triggerGlobalHide, triggerGlobalForceHide } from "../context/LoadingContext";
import { triggerGlobalServerError, getIsGlobalServerErrorActive } from "../context/ServerErrorContext";
import { getCookie, removeCookie } from "../utils/cookieHelper";
import { router } from "../data/Router";

const target = import.meta.env.API_TARGET;
const basePath = import.meta.env.VITE_API_BASE;
const baseURL = import.meta.env.VITE_API_BASE_URL || `${target}${basePath}`;

const api = axios.create({
    baseURL: baseURL,
});

// Attach token and show loading
api.interceptors.request.use((config) => {
    // If server is down, stop any new requests immediately silently
    if (getIsGlobalServerErrorActive()) {
        return new Promise(() => {}); 
    }

    // If skipLoading is true, don't trigger global overlay
    if (!config.skipLoading) {
        triggerGlobalShow();
    }

    const token = getCookie("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    triggerGlobalHide();
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => {
        // Only hide if we actually triggered it or just hide always to be safe
        triggerGlobalHide();
        return response;
    },
    (error) => {
        // If already in server error state, swallow error to prevent other modals
        if (getIsGlobalServerErrorActive()) {
            return new Promise(() => {});
        }

        // Check for server down / network error
        if (error.code === 'ERR_NETWORK' || !error.response || error.response?.status >= 500) {
            triggerGlobalServerError();
            triggerGlobalForceHide(); // Stop the loading modal instantly
            return new Promise(() => {}); // Return an unresolved promise to prevent local error modals from popping up
        }

        triggerGlobalHide();

        // Simplify technical database errors for the UI
        if (error.response?.data?.message) {
            let msg = error.response.data.message;
            if (msg.includes("Duplicate entry")) {
                error.response.data.message = "This data already exists. Please use a unique name or value.";
            } else if (msg.includes("SQLSTATE") || msg.includes("Integrity constraint violation")) {
                error.response.data.message = "A server error occurred while processing your request. Please try again.";
            }
        }

        if (error.response?.status === 401) {
            removeCookie("token");
            removeCookie("user");
            removeCookie("role");
            localStorage.clear();
            window.dispatchEvent(new Event("auth:logout"));
            router.navigate("/login");
        }
        
        // If forbidden (e.g. role changed on backend), tell AuthContext to re-fetch user
        if (error.response?.status === 403) {
            window.dispatchEvent(new Event("auth:refetch"));
        }

        return Promise.reject(error);
    }
);

export default api;