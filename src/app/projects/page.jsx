'use client';
import { useState, useMemo } from 'react';
import ProjectCard from '@/components/projects/projectCard';
import { useProjects } from '@/hooks/useProjects';
import { useUnits } from '@/hooks/useUnits';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ROLES } from '@/lib/roles';
import { ConstructionStages, getConstructionProgressPercentage } from '@/lib/constructionStages';

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
  const { projects, loading: isLoading, error } = useProjects();
  const { units } = useUnits();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === ROLES.ADMIN;
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    priceRange: 'all',
    county: 'all',
    subCounty: 'all',
    amenities: [],
    availability: 'all',
    constructionStage: 'all'
  });

  // Filter sections state
  const [filterSections, setFilterSections] = useState({
    status: true,
    price: true,
    location: true,
    amenities: false,
    availability: true,
    progress: true,
    construction: true
  });

  const toggleFilterSection = (section) => {
    setFilterSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filterOptions = useMemo(() => {
    // Only process if projects is an array and not empty
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return {
        counties: [],
        subCounties: [],
        amenities: [],
        statuses: ['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED', 'ON_HOLD'],
        constructionStages: Object.keys(ConstructionStages)
      };
    }

    const counties = [...new Set(projects.map(p => p.county).filter(Boolean))];
    const subCounties = [...new Set(projects.map(p => p.subCounty).filter(Boolean))];
    const allAmenities = [...new Set(projects.flatMap(p => p.amenities || []))];
    
    return {
      counties,
      subCounties,
      amenities: allAmenities,
      statuses: ['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED', 'ON_HOLD'],
      constructionStages: Object.keys(ConstructionStages)
    };
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (!projects || !Array.isArray(projects)) {
      return [];
    }
    
    let filtered = projects.filter(project => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.address?.toLowerCase().includes(searchLower) ||
          project.county?.toLowerCase().includes(searchLower) ||
          project.subCounty?.toLowerCase().includes(searchLower) ||
          project.developerName?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }

      // County filter
      if (filters.county !== 'all' && project.county !== filters.county) {
        return false;
      }

      // Sub-county filter
      if (filters.subCounty !== 'all' && project.subCounty !== filters.subCounty) {
        return false;
      }

      // Price range filter using minPrice and maxPrice from project
      if (filters.priceRange !== 'all') {
        const minPrice = project.minPrice || 0;
        const maxPrice = project.maxPrice || 0;

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

      // Construction stage filter
      if (filters.constructionStage !== 'all') {
        const projectStage = project.currentConstructionStage || 'PLANNING';
        if (projectStage !== filters.constructionStage) return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity => 
          project.amenities && project.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      // Availability filter
      if (filters.availability !== 'all' && units && Array.isArray(units)) {
        const projectUnits = units.filter(unit => String(unit.projectId) === String(project.id));
        const availableUnits = projectUnits.filter(unit => unit.status === 'AVAILABLE').length;
        
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
          aValue = a.minPrice || 0;
          bValue = b.minPrice || 0;
          break;
        case 'progress':
          aValue = getConstructionProgressPercentage(a.currentConstructionStage || 'PLANNING');
          bValue = getConstructionProgressPercentage(b.currentConstructionStage || 'PLANNING');
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
  }, [searchTerm, filters, sortBy, sortOrder, projects, units]);

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
      county: 'all',
      subCounty: 'all',
      amenities: [],
      availability: 'all',
      constructionStage: 'all'
    });
    setSearchTerm('');
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)
  ).length + (searchTerm ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading ? (
        <p className="text-center py-8 text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center py-8 text-red-600">Something went wrong.</p>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Projects</h1>
            <p className="text-xl text-gray-600 mb-4">
              Discover premium real estate developments across prime locations
            </p>
            {isAdmin && ( 
              <div className="flex justify-end">
                <Link href="/projects/new" className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  <Building className="w-4 h-4 mr-2" />
                  Add New Project
                </Link>
              </div>
            )}
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
                  <option value="progress-desc">Most Complete</option>
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
                    {filters.county !== 'all' && (
                      <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        County: {filters.county}
                        <button
                          onClick={() => handleFilterChange('county', 'all')}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.subCounty !== 'all' && (
                      <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                        Sub-County: {filters.subCounty}
                        <button
                          onClick={() => handleFilterChange('subCounty', 'all')}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.constructionStage !== 'all' && (
                      <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                        Stage: {ConstructionStages[filters.constructionStage]?.label || filters.constructionStage}
                        <button
                          onClick={() => handleFilterChange('constructionStage', 'all')}
                          className="ml-2 text-orange-600 hover:text-orange-800"
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

                  {/* Construction Stage Filter */}
                  <FilterSection
                    title="Construction Stage"
                    isOpen={filterSections.construction}
                    onToggle={() => toggleFilterSection('construction')}
                  >
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="constructionStage"
                          value="all"
                          checked={filters.constructionStage === 'all'}
                          onChange={(e) => handleFilterChange('constructionStage', e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">All Stages</span>
                      </label>
                      {filterOptions.constructionStages.map(stage => (
                        <label key={stage} className="flex items-center">
                          <input
                            type="radio"
                            name="constructionStage"
                            value={stage}
                            checked={filters.constructionStage === stage}
                            onChange={(e) => handleFilterChange('constructionStage', e.target.value)}
                            className="mr-3 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {ConstructionStages[stage]?.label} ({ConstructionStages[stage]?.milestone}%)
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

                  {/* County Filter */}
                  <FilterSection
                    title="County"
                    isOpen={filterSections.location}
                    onToggle={() => toggleFilterSection('location')}
                  >
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="county"
                          value="all"
                          checked={filters.county === 'all'}
                          onChange={(e) => handleFilterChange('county', e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">All Counties</span>
                      </label>
                      {filterOptions.counties.map(county => (
                        <label key={county} className="flex items-center">
                          <input
                            type="radio"
                            name="county"
                            value={county}
                            checked={filters.county === county}
                            onChange={(e) => handleFilterChange('county', e.target.value)}
                            className="mr-3 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{county}</span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Sub-County Filter */}
                  <FilterSection
                    title="Sub-County"
                    isOpen={filterSections.location}
                    onToggle={() => toggleFilterSection('location')}
                  >
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="subCounty"
                          value="all"
                          checked={filters.subCounty === 'all'}
                          onChange={(e) => handleFilterChange('subCounty', e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">All Sub-Counties</span>
                      </label>
                      {filterOptions.subCounties.map(subCounty => (
                        <label key={subCounty} className="flex items-center">
                          <input
                            type="radio"
                            name="subCounty"
                            value={subCounty}
                            checked={filters.subCounty === subCounty}
                            onChange={(e) => handleFilterChange('subCounty', e.target.value)}
                            className="mr-3 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{subCounty}</span>
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
      )}
    </div>
  );
}
