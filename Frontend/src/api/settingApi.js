import api from "./axios";
// admin
export const getSettings = async (params = {}, skipLoading = false) => api.get('/admin/setting', { params, skipLoading });
export const getSetting = async () => api.get('/admin/setting/key-value');
export const getSettingKeyValue = async () => api.get('/admin/setting/key-value');
export const createSetting = async (data) => api.post('/admin/setting', data);
export const updateSetting = async (id, data) => api.put(`/admin/setting/${id}`, data);
export const deleteSetting = async (id) => api.delete(`/admin/setting/${id}`);

// cashier
export const getCashierSetting = async () => api.get('/cashier/setting');