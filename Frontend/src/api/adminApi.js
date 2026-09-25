import api from './axios'

// get all admins
export const getAllAdmins = async (params = {}, skipLoading = false) => api.get('/admin/admin', { params, skipLoading })
// get one admin
export const getOneAdmin = async (id) => api.get(`/admin/admin/${id}`)
// create admin
export const createAdmin = async (data) => api.post('/admin/admin', data)
// delete admin
export const deleteAdmin = async (id) => api.delete(`/admin/admin/${id}`)
// update admin
export const updateAdmin = async (id, data) => api.put(`/admin/admin/${id}`, data)
// restore admin
export const restoreAdmin = async (id) => api.put(`/admin/admin/${id}/restore`)
