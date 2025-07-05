import { useState, useEffect } from 'react';
import { projectsApi } from '@/lib/api/projects';

export const useProjects = (params = {}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectsApi.getAll(params);
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [JSON.stringify(params)]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getAll(params);
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { projects, loading, error, refetch };
};

export const useProject = (id) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectsApi.getById(id);
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const refetch = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getById(id);
      setProject(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { project, loading, error, refetch };
};


export const useCreateProject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProject = async (projectData, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await projectsApi.create(projectData);
      
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
      setIsLoading(false);
    }
  };

  return { createProject, isLoading, error };
};
