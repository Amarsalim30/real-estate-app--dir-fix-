import api from '../api';

export const unitsApi = {
  // Get all units
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/units', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch units');
    }
  },

  // Get unit by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/units/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unit');
    }
  },

  // Create new unit
  create: async (unitData) => {
    try {
      const response = await api.post('/units', unitData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create unit');
    }
  },

  // Update unit
  update: async (id, unitData) => {
    try {
      const response = await api.put(`/units/${id}`, unitData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update unit');
    }
  },

  // Delete unit
  delete: async (id) => {
    try {
      const response = await api.delete(`/units/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete unit');
    }
  },

  // Reserve unit
  reserve: async (id, reservationData) => {
    try {
      const response = await api.post(`/units/${id}/reserve`, reservationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reserve unit');
    }
  },

  // Purchase unit
  purchase: async (id, purchaseData) => {
    try {
      const response = await api.post(`/units/${id}/purchase`, purchaseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to purchase unit');
    }
  },

  // Cancel reservation
  cancelReservation: async (id) => {
    try {
      const response = await api.post(`/units/${id}/cancel-reservation`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel reservation');
    }
  },

  // Get available units
  getAvailable: async (params = {}) => {
    try {
      const response = await api.get('/units/available', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available units');
    }
  }
};
