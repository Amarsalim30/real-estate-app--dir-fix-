import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unitsApi } from '@/lib/api/units';

export const useUnitsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['units', params],
    queryFn: () => unitsApi.getAll(params),
    keepPreviousData: true,
  });
};

export const useUnitQuery = (id) => {
  return useQuery({
    queryKey: ['units', id],
    queryFn: () => unitsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateUnitMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: unitsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['units']);
      queryClient.invalidateQueries(['projects']);
    },
  });
};

export const useUpdateUnitMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => unitsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['units']);
      queryClient.invalidateQueries(['units', variables.id]);
      queryClient.invalidateQueries(['projects']);
    },
  });
};

export const useReserveUnitMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => unitsApi.reserve(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['units']);
      queryClient.invalidateQueries(['units', variables.id]);
      queryClient.invalidateQueries(['projects']);
    },
  });
};

export const usePurchaseUnitMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => unitsApi.purchase(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['units']);
      queryClient.invalidateQueries(['units', variables.id]);
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['invoices']);
    },
  });
};
