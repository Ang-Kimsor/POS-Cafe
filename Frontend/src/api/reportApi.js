import api from "./axios";

export const getSalesReport = async (params = {}, skipGlobal = false) => {
  return api.get('/admin/reports/sales', {
    params,
    skipLoading: skipGlobal
  });
};

export const exportSalesReport = async (params = {}) => {
  return api.get('/admin/reports/sales/export', {
    params,
    responseType: 'blob'
  });
};

export const getProductReport = async (params = {}, skipGlobal = false) => {
  return api.get('/admin/reports/products', {
    params,
    skipLoading: skipGlobal
  });
};

export const exportProductReport = async (params = {}) => {
  return api.get('/admin/reports/products/export', {
    params,
    responseType: 'blob'
  });
};
