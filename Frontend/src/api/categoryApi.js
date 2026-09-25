import api from "./axios";
// get all cates (admin)
export const getAllCategories = async (params = {}, skipLoading = false) => api.get('/admin/category', { params, skipLoading })
// get one cate
export const getOneCategory = async (id) => api.get(`/admin/category/${id}`)
// create cate
export const createCategory = async (data) => api.post('/admin/category', data)
// update cate
export const updateCategory = async (id, data) => api.put(`/admin/category/${id}`, data);
// delete cate (soft delete)
export const deleteCategory = async (id) => api.delete(`/admin/category/${id}`)
// restore cate
export const restoreCategory = async (id) => api.put(`/admin/category/${id}/restore`)

// get all cates (cashier)
export const getCashierCategories = async (params = {}) => api.get('/cashier/category', { params })