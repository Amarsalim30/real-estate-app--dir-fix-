import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/payments';

// Get all payments
export const usePaymentsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsApi.getAll(params),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get single payment
export const usePaymentQuery = (id) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentsApi.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Get payment statistics
export const usePaymentStatsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['payment-stats', params],
    queryFn: () => paymentsApi.getStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create payment mutation
export const useCreatePaymentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['payment-stats']);
    },
  });
};

// Update payment mutation
export const useUpdatePaymentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => paymentsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['payment', variables.id]);
      queryClient.invalidateQueries(['payment-stats']);
    },
  });
};

// Delete payment mutation
export const useDeletePaymentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: paymentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['payment-stats']);
    },
  });
};

// Refund payment mutation
export const useRefundPaymentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => paymentsApi.refund(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['payment', variables.id]);
      queryClient.invalidateQueries(['payment-stats']);
    },
  });
};

// Retry payment mutation
export const useRetryPaymentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: paymentsApi.retry,
    onSuccess: (data, paymentId) => {
      queryClient.invalidateQueries(['payments']);
      queryClient.invalidateQueries(['payment', paymentId]);
      queryClient.invalidateQueries(['payment-stats']);
    },
  });
};
