'use client';
import { useState, useMemo } from 'react';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import  ProjectCard  from '@/components/projects/projectCard';
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
'use client';
import { useState, useMemo } from 'react';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import ProjectCard from '@/components/projects/projectCard';
import { Navbar } from '@/components/layout/navbar';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building, 
  DollarSign,
  Calendar,
  Grid3X3,
  List,
  SlidersHorizontal,
  X
} from 'lucide-react';

const FilterSection = ({ title, children, isOpen, onToggle }) => (
  <div className="border-b border-gray-200 pb-4">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
    >
      {title}
      <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
    {isOpen && <div className="space-y-2">{children}</div>}
  </div>
);

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, price, progress, date
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    priceRange: 'all',
    location: 'all',
    amenities: [],
    availability: 'all'
  });

  // Filter sections state
  const [filterSections, setFilterSections] = useState({
    status: true,
    price: true,
    location: true,
    amenities: false,
    availability: true
  });

  const toggleFilterSection = (section) => {
    setFilterSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const locations = [...new Set(Projects.map(p => p.location))];
    const allAmenities = [...new Set(Projects.flatMap(p => p.amenities || []))];
    
    return {
      locations,
      amenities: allAmenities,
      statuses: ['planning', 'under_construction', 'completed']
    };
  }, []);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = Projects.filter(project => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
                    project.location.toLowerCase().includes(searchLower) ||
          project.developer.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }

      // Location filter
      if (filters.location !== 'all' && project.location !== filters.location) {
        return false;
      }

      // Price range filter
      if (filters.priceRange !== 'all') {
        const projectUnits = Units.filter(unit => unit.projectId === project.id);
        const prices = projectUnits.map(unit => unit.price).filter(price => price > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        switch (filters.priceRange) {
          case 'under-500k':
            if (minPrice >= 500000) return false;
            break;
          case '500k-1m':
            if (maxPrice < 500000 || minPrice > 1000000) return false;
            break;
          case '1m-2m':
            if (maxPrice < 1000000 || minPrice > 2000000) return false;
            break;
          case 'over-2m':
            if (maxPrice < 2000000) return false;
            break;
        }
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity => 
          project.amenities && project.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      // Availability filter
      if (filters.availability !== 'all') {
        const projectUnits = Units.filter(unit => unit.projectId === project.id);
        const availableUnits = projectUnits.filter(unit => unit.status === 'available').length;
        
        switch (filters.availability) {
          case 'available':
            if (availableUnits === 0) return false;
            break;
          case 'limited':
            if (availableUnits === 0 || availableUnits > projectUnits.length * 0.3) return false;
            break;
          case 'sold-out':
            if (availableUnits > 0) return false;
            break;
        }
      }

      return true;
    });

    // Sort projects
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          const aUnits = Units.filter(unit => unit.projectId === a.id);
          const bUnits = Units.filter(unit => unit.projectId === b.id);
          const aPrices = aUnits.map(unit => unit.price).filter(price => price > 0);
          const bPrices = bUnits.map(unit => unit.price).filter(price => price > 0);
          aValue = aPrices.length > 0 ? Math.min(...aPrices) : 0;
          bValue = bPrices.length > 0 ? Math.min(...bPrices) : 0;
          break;
        case 'progress':
          const aTotalUnits = Units.filter(unit => unit.projectId === a.id).length;
          const aSoldUnits = Units.filter(unit => unit.projectId === a.id && (unit.status === 'sold' || unit.status === 'reserved')).length;
          const bTotalUnits = Units.filter(unit => unit.projectId === b.id).length;
          const bSoldUnits = Units.filter(unit => unit.projectId === b.id && (unit.status === 'sold' || unit.status === 'reserved')).length;
          aValue = aTotalUnits > 0 ? (aSoldUnits / aTotalUnits) : 0;
          bValue = bTotalUnits > 0 ? (bSoldUnits / bTotalUnits) : 0;
          break;
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [searchTerm, filters, sortBy, sortOrder]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      priceRange: 'all',
      location: 'all',
      amenities: [],
      availability: 'all'
    });
    setSearchTerm('');
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)
  ).length + (searchTerm ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Projects</h1>
          <p className="text-xl text-gray-600">
            Discover premium real estate developments across prime locations
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
                <option value="progress-desc">Most Sold</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.status !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Status: {filters.status.replace('_', ' ')}
                      <button
                        onClick={() => handleFilterChange('status', 'all')}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.location !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                      Location: {filters.location}
                      <button
                        onClick={() => handleFilterChange('location', 'all')}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.amenities.map(amenity => (
                    <span key={amenity} className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      {amenity}
                      <button
                        onClick={() => handleAmenityToggle(amenity)}
                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 bg-white rounded-lg shadow-sm border p-6 h-fit">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status Filter */}
                <FilterSection
                  title="Project Status"
                  isOpen={filterSections.status}
                  onToggle={() => toggleFilterSection('status')}
                >
                  <div className="space-y-2">
                    {['all', ...filterOptions.statuses].map(status => (
                      <label key={status} className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={filters.status === status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Price Range Filter */}
                <FilterSection
                  title="Price Range"
                  isOpen={filterSections.price}
                  onToggle={() => toggleFilterSection('price')}
                >
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Prices' },
                      { value: 'under-500k', label: 'Under $500K' },
                      { value: '500k-1m', label: '$500K - $1M' },
                      { value: '1m-2m', label: '$1M - $2M' },
                      { value: 'over-2m', label: 'Over $2M' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          value={option.value}
                          checked={filters.priceRange === option.value}
                          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Location Filter */}
                <FilterSection
                  title="Location"
                  isOpen={filterSections.location}
                  onToggle={() => toggleFilterSection('location')}
                >
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="location"
                        value="all"
                        checked={filters.location === 'all'}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">All Locations</span>
                    </label>
                    {filterOptions.locations.map(location => (
                      <label key={location} className="flex items-center">
                        <input
                          type="radio"
                          name="location"
                          value={location}
                          checked={filters.location === location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{location}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Availability Filter */}
                <FilterSection
                  title="Availability"
                  isOpen={filterSections.availability}
                  onToggle={() => toggleFilterSection('availability')}
                >
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Projects' },
                      { value: 'available', label: 'Units Available' },
                      { value: 'limited', label: 'Limited Availability' },
                      { value: 'sold-out', label: 'Sold Out' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="availability"
                          value={option.value}
                          checked={filters.availability === option.value}
                          onChange={(e) => handleFilterChange('availability', e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Amenities Filter */}
                <FilterSection
                  title="Amenities"
                  isOpen={filterSections.amenities}
                  onToggle={() => toggleFilterSection('amenities')}
                >
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.amenities.map(amenity => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              </div>
            </div>
          )}

          {/* Projects Grid/List */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredProjects.length} Project{filteredProjects.length !== 1 ? 's' : ''} Found
                </h2>
                {searchTerm && (
                  <p className="text-gray-600 mt-1">
                    Results for "{searchTerm}"
                  </p>
                )}
              </div>
            </div>

            {/* Projects Display */}
            {filteredProjects.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              }>
                {filteredProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters to find more projects.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

