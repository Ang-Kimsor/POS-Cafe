import api from "./axios";
import Swal from "sweetalert2";

// Login
export const login = async (data) => {
    return await api.post('/login', data);
}

// Get current user (me)
export const getMe = async () => {
    return await api.get('/me');
}

import { removeCookie } from "../utils/cookieHelper";
import { router } from "../data/Router";

// Sign out
export const logout = async () => {
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "You will be logged out of your session.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Logout",
        cancelButtonText: "Cancel",
        reverseButtons: true,
    });

    if (result.isConfirmed) {
        removeCookie("token");
        removeCookie("user");
        removeCookie("role");
        localStorage.clear();
        window.dispatchEvent(new Event("auth:logout"));
        router.navigate("/login");
    }
}