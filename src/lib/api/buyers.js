
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = {
  get: async (url, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  post: async (url, data, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

export const buyersApi = {
  // Get all buyers
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/buyers${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      
      // Handle both direct array and wrapped response
      return response.data || response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch buyers');
    }
  },

  // Get buyer by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/buyers/${id}`);
      return response.data || response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch buyer');
    }
  },

  // Create new buyer
  create: async (buyerData) => {
    try {
      const response = await api.post('/buyers', buyerData);
      return response.data || response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create buyer');
    }
  },

  // Update buyer
  update: async (id, buyerData) => {
    try {
      const response = await api.put(`/buyers/${id}`, buyerData);
      return response.data || response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update buyer');
    }
  },

  // Delete buyer
  delete: async (id) => {
    try {
      const response = await api.delete(`/buyers/${id}`);
      return response.data || response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete buyer');
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
