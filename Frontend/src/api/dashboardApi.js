import api from "./axios";

export const getDashboardData = async () => api.get('/admin/dashboard');
