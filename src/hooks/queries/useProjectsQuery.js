import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';

export const useProjectsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.getAll(params).then((res) => res.data),
    keepPreviousData: true,
  });
};

export const useProjectQuery = (id) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    },
  });
};

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => projectsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['projects', variables.id]);
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    },
  });
};
