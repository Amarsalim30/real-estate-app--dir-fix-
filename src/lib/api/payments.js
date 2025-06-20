import api from '../api';

export const paymentsApi = {
  // Get all payments
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/payments', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payments');
    }
  },

  // Get payment by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment');
    }
  },

  // Create new payment
  create: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create payment');
    }
  },

  // Update payment
  update: async (id, paymentData) => {
    try {
      const response = await api.put(`/payments/${id}`, paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update payment');
    }
  },

  // Delete payment
  delete: async (id) => {
    try {
      const response = await api.delete(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete payment');
    }
  },

  // Process payment
  process: async (paymentData) => {
    try {
      const response = await api.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to process payment');
    }
  },

  // Refund payment
  refund: async (id, refundData) => {
    try {
      const response = await api.post(`/payments/${id}/refund`, refundData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to refund payment');
    }
  },

  // Get payment history for a buyer
  getByBuyer: async (buyerId, params = {}) => {
    try {
      const response = await api.get(`/payments/buyer/${buyerId}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch buyer payments');
    }
  },

  // Get payment history for an invoice
  getByInvoice: async (invoiceId, params = {}) => {
    try {
      const response = await api.get(`/payments/invoice/${invoiceId}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch invoice payments');
    }
  },

  // Get payment statistics
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/payments/stats', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment statistics');
    }
  },

  // Verify payment status
  verifyStatus: async (id) => {
    try {
      const response = await api.get(`/payments/${id}/verify`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify payment status');
    }
  },

  // Get payment receipt
  getReceipt: async (id) => {
    try {
      const response = await api.get(`/payments/${id}/receipt`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate payment receipt');
    }
  }
};
