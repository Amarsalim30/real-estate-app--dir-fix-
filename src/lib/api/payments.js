import  api  from '@/lib/api';

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

  // Get payment by ID with all related data
  getById: async (id) => {
    try {
      const response = await api.get(`/payments/${id}?include=buyer,unit,project,invoice`);
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

  // Refund payment
  refund: async (id, refundData) => {
    try {
      const response = await api.post(`/payments/${id}/refund`, refundData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to refund payment');
    }
  },

  // Retry failed payment
  retry: async (id) => {
    try {
      const response = await api.post(`/payments/${id}/retry`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to retry payment');
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
      throw new Error(error.response?.data?.message || 'Failed to get receipt');
    }
  },

  // Export payments
  export: async (params = {}) => {
    try {
      const response = await api.get('/payments/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export payments');
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
  getByBuyer: async (buyerId) => {
    try {
      const response = await api.get(`/payments/buyer/${buyerId}/history`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payments for buyer');
    }
  }
};
