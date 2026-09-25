import api from './axios'

// get all cashiers
export const getAllCashiers = async (params = {}, skipLoading = false) => api.get('/admin/cashier', { params, skipLoading })
// get one cashier
export const getOneCashier = async (id) => api.get(`/admin/cashier/${id}`)
// create cashier
export const createCashier = async (data) => api.post('/admin/cashier', data)
// delete cashier
export const deleteCashier = async (id) => api.delete(`/admin/cashier/${id}`)
// update cashier
export const updateCashier = async (id, data) => api.put(`/admin/cashier/${id}`, data)
// restore cashier
export const restoreCashier = async (id) => api.put(`/admin/cashier/${id}/restore`)
