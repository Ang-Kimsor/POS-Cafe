import api from "./axios";
// get all products (admin)
export const getAllProducts = async (params = {}, skipLoading = false) => api.get('/admin/product', { params, skipLoading })
// get count
export const getProductCount = async () => api.get('/admin/product/count')
// get one product
export const getOneProduct = async (id) => api.get(`/admin/product/${id}`)
// create product
export const createProduct = async (data) => api.post('/admin/product', data)
// update product
export const updateProduct = async (id, data) => api.post(`/admin/product/${id}`, data);
// delete product (soft delete)
export const deleteProduct = async (id) => api.delete(`/admin/product/${id}`)
// restore product
export const restoreProduct = async (id) => api.put(`/admin/product/${id}/restore`)

// get all products (cashier)
export const getCashierProducts = async (params = {}) => api.get('/cashier/product', { params })