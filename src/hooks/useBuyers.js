import { useState, useEffect } from 'react';
import { buyersApi } from '@/lib/api/buyers';

export const useBuyers = (params = {}) => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await buyersApi.getAll(params);
        setBuyers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, [JSON.stringify(params)]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await buyersApi.getAll(params);
      setBuyers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { buyers, loading, error, refetch };
};

export const useBuyer = (id) => {
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchBuyer = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await buyersApi.getById(id);
        setBuyer(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyer();
  }, [id]);

  const refetch = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await buyersApi.getById(id);
      setBuyer(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { buyer, loading, error, refetch };
};
export const useCreateBuyer = (buyerData) => {
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!buyerData) return;

    const createBuyer = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await buyersApi.create(buyerData);
        setBuyer(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  }, []);

};
