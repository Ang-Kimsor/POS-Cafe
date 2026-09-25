import api from "./axios";
// get all orders
export const getAllOrders = async (params = {}, skipLoading = false) => api.get('/admin/order', { params, skipLoading })
// get one order
export const getOneOrder = async (id) => api.get(`/admin/order/${id}`)
// create order (admin)
export const createOrder = async (data) => api.post('/admin/order', data)
// delete order (admin)
export const deleteOrder = async (id) => api.delete(`/admin/order/${id}`)
// mark paid (admin)
export const markOrderPaid = async (id) => api.put(`/admin/order/${id}/pay`)
// mark pending (admin)
export const markOrderPending = async (id) => api.put(`/admin/order/${id}/pending`)
// export orders (admin)
export const exportAdminOrders = async (params = {}) => api.get('/admin/order/export', { params, responseType: 'blob' })
// Bakong Payment (Admin)
export const generateAdminKHQR = async (data) => api.post('/admin/payment/generate-khqr', data)
export const checkAdminKHQRPayment = async (data) => api.post('/admin/payment/check', data, { skipLoading: true })


// get all orders (cashier)
export const getCashierOrders = async (params = {}, skipLoading = false) => api.get('/cashier/order', { params, skipLoading })
// create order (cashier)
export const createCashierOrder = async (data) => api.post('/cashier/order', data)
// get one order (cashier)
export const getOneCashierOrder = async (id) => api.get(`/cashier/order/${id}`)
// export orders (cashier)
export const exportCashierOrders = async (params = {}) => api.get('/cashier/order/export', { params, responseType: 'blob' })
// Bakong Payment (Cashier)
export const generateKHQR = async (data) => api.post('/cashier/payment/generate-khqr', data)
export const checkKHQRPayment = async (data) => api.post('/cashier/payment/check', data, { skipLoading: true })

