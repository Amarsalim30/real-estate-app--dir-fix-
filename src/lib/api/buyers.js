import api from '../api';

export const buyersApi = {
  // Get all buyers
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/buyers', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch buyers');
    }
  },

  // Get buyer by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/buyers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch buyer');
    }
  },

  // Create new buyer
  create: async (buyerData) => {
    try {
      const response = await api.post('/buyers', buyerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create buyer');
    }
  },

  // Update buyer
  update: async (id, buyerData) => {
    try {
      const response = await api.put(`/buyers/${id}`, buyerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update buyer');
    }
  },

  // Delete buyer
  delete: async (id) => {
    try {
      const response = await api.delete(`/buyers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete buyer');
    }
  },

  // Get buyer's units
  getUnits: async (id) => {
    try {
      const response = await api.get(`/buyers/${id}/units`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch buyer units');
    }
  },

  // Get buyer's invoices
  getInvoices: async (id, params = {}) => {
    try {
      const response = await api.get(`/buyers/${id}/invoices`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch buyer invoices');
    }
  },

  // Get buyer's payments
  getPayments: async (id, params = {}) => {
    try {
      const response = await api.get(`/buyers/${id}/payments`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch buyer payments');
    }
  },

  // Get buyer's statement
  getStatement: async (id, params = {}) => {
    try {
      const response = await api.get(`/buyers/${id}/statement`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch buyer statement');
    }
  }
};
