'use client';
import { useState, useMemo } from 'react';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import ProjectCard from '@/components/projects/ProjectCard';
import Header from '@/components/layout/header';
import { useSession } from 'next-auth/react';

export default function ProjectsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    location: '',
    priceRange: 'all'
  });
  
  const { data: session } = useSession();

  const filteredProjects = useMemo(() => {
    return Projects.filter(project => {
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }
      
      if (filters.location && !project.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [filters]);

  const getProjectStats = (projectId) => {
    const projectUnits = Units.filter(unit => unit.projectId === projectId);
    return {
      total: projectUnits.length,
      available: projectUnits.filter(unit => unit.status === 'available').length,
      reserved: projectUnits.filter(unit => unit.status === 'reserved').length,
      sold: projectUnits.filter(unit => unit.status === 'sold').length,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Projects</h1>
          <p className="text-gray-600">Discover premium residential developments</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="under_construction">Under Construction</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Search by location..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="input-field"
              >
                <option value="all">All Prices</option>
                <option value="under_500k">Under $500K</option>
                <option value="500k_1m">$500K - $1M</option>
                <option value="over_1m">Over $1M</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              stats={getProjectStats(project.id)}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No projects found</div>
            <div className="text-gray-400 mt-2">Try adjusting your filters</div>
          </div>
        )}
      </div>
    </div>
  );
}
