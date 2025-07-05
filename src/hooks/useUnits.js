import { useState, useEffect } from 'react';
import { unitsApi } from '@/lib/api/units';

export const useUnits = (params = {}) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await unitsApi.getAll(params);
        setUnits(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [JSON.stringify(params)]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await unitsApi.getAll(params);
      setUnits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { units, loading, error, refetch };
};

export const useUnit = (id) => {
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchUnit = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await unitsApi.getById(id);
        setUnit(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [id]);

  const refetch = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await unitsApi.getById(id);
      setUnit(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { unit, loading, error, refetch };
};

export const useUpdateUnit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateUnit = async (id, unitData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const updated = await unitsApi.update(id, unitData);
      setSuccess(true);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUnit,
    loading,
    error,
    success
  };
};

  export const useCreateUnit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createUnit = async (unitData, options = {}) => {
    try {
      setIsLoading(true); // This should trigger the button state change
      setError(null);
      
      const data = await unitsApi.create(unitData);
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    } finally {
      setIsLoading(false); // This should reset the button state
    }
  };

  return { createUnit, isLoading, error };
};

