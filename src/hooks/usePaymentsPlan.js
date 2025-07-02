import { useEffect, useState } from 'react';
import api from '@/lib/api';

export const usePaymentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/payment-plans'); // update this to your real endpoint
        setPlans(response.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load payment plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return { plans, loading, error };
};
