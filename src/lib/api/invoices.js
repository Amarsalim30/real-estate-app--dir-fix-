import api from '../api';

export const invoicesApi = {
  // Get all invoices
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/invoices', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
    }
  },

  // Get invoice by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch invoice');
    }
  },

  // Create new invoice
  create: async (invoiceData) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create invoice');
    }
  },

  // Update invoice
  update: async (id, invoiceData) => {
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update invoice');
    }
  },

  // Delete invoice
  delete: async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete invoice');
    }
  },

  // Mark invoice as paid
  markAsPaid: async (id, paymentData) => {
    try {
      const response = await api.post(`/invoices/${id}/mark-paid`, paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark invoice as paid');
    }
  },

  // Cancel invoice
  cancel: async (id, reason) => {
    try {
      const response = await api.post(`/invoices/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel invoice');
    }
  },

  // Send invoice reminder
  sendReminder: async (id) => {
    try {
      const response = await api.post(`/invoices/${id}/send-reminder`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send invoice reminder');
    }
  },

  // Get invoice PDF
  getPdf: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate invoice PDF');
    }
  },

  // Get overdue invoices
  getOverdue: async (params = {}) => {
    try {
      const response = await api.get('/invoices/overdue', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch overdue invoices');
    }
  }
};
