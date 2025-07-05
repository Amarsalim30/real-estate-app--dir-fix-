import { useState, useEffect } from 'react';
import { invoicesApi } from '@/lib/api/invoices';

export const useInvoices = (params = {}) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await invoicesApi.getAll(params);
        setInvoices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [JSON.stringify(params)]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getAll(params);
      setInvoices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { invoices, loading, error, refetch };
};

export const useInvoice = (id) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await invoicesApi.getById(id);
        setInvoice(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const refetch = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getById(id);
      setInvoice(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { invoice, loading, error, refetch };
};
