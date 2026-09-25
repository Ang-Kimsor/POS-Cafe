import api from "./axios";

// get all sizes
export const getAllSizes = async (params = {}, skipLoading = false) => api.get('/admin/size', { params, skipLoading })

// get one size
export const getOneSize = async (id) => api.get(`/admin/size/${id}`)

// create size
export const createSize = async (data) => api.post('/admin/size', data)

// update size
export const updateSize = async (id, data) => api.put(`/admin/size/${id}`, data)

// delete size
export const deleteSize = async (id) => api.delete(`/admin/size/${id}`)

// restore size
export const restoreSize = async (id) => api.put(`/admin/size/${id}/restore`)
