'use client';
import { useState, useMemo } from 'react';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import ProjectCard from '@/components/projects/ProjectCard';
import Header from '@/components/layout/header';
import { useSession } from 'next-auth/react';
import { Search, Filter, MapPin, Building, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/utils/format';

export default function ProjectsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    location: '',
    priceRange: 'all',
    sortBy: 'name'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  const { data: session } = useSession();

  const filteredProjects = useMemo(() => {
    let filtered = Array.isArray(Projects) ? [...Projects] : [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.developer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(project => project.status === filters.status);
    }
    
    // Location filter
    if (filters.location) {
      filtered = filtered.filter(project => 
        project.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(project => {
        if (!project.priceRange) return false;
        const minPrice = project.priceRange.min;
        switch (filters.priceRange) {
          case 'under_500k':
            return minPrice < 500000;
          case '500k_1m':
            return minPrice >= 500000 && minPrice <= 1000000;
          case 'over_1m':
            return minPrice > 1000000;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price_low':
          return (a.priceRange?.min || 0) - (b.priceRange?.min || 0);
        case 'price_high':
          return (b.priceRange?.min || 0) - (a.priceRange?.min || 0);
        case 'progress':
          return (b.constructionProgress || 0) - (a.constructionProgress || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [filters, searchTerm]);

  const getProjectStats = (projectId) => {
    const projectUnits = Array.isArray(Units) ? Units.filter(unit => unit.projectId === projectId) : [];
    return {
      total: projectUnits.length,
      available: projectUnits.filter(unit => unit.status === 'available').length,
      reserved: projectUnits.filter(unit => unit.status === 'reserved').length,
      sold: projectUnits.filter(unit => unit.status === 'sold').length,
    };
  };

  const totalProjects = Array.isArray(Projects) ? Projects.length : 0;
  const totalUnits = Array.isArray(Units) ? Units.length : 0;
  const availableUnits = Array.isArray(Units) ? Units.filter(u => u.status === 'available').length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Projects</h1>
          <p className="text-xl text-gray-600 mb-6">Discover premium residential developments</p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalProjects}</div>
                  <div className="text-sm text-gray-600">Active Projects</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalUnits}</div>
                  <div className="text-sm text-gray-600">Total Units</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <MapPin className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{availableUnits}</div>
                  <div className="text-sm text-gray-600">Available Units</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects by name, location, or developer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                placeholder="Filter by location..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="under_500k">Under $500K</option>
                <option value="500k_1m">$500K - $1M</option>
                <option value="over_1m">Over $1M</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="progress">Construction Progress</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredProjects.length} of {totalProjects} projects
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="w-4 h-4 flex flex-col space-y-1">
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "space-y-6"
          }>
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                stats={getProjectStats(project.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-xl font-medium text-gray-900 mb-2">No projects found</div>
            <div className="text-gray-500 mb-6">Try adjusting your search criteria or filters</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  status: 'all',
                  location: '',
                  priceRange: 'all',
                  sortBy: 'name'
                });
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
