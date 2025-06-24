'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUnits } from '@/hooks/useUnits';
import { useProjects } from '@/hooks/useProjects';
import { formatPrice } from '@/utils/format';
import { ConstructionStages, getConstructionStageColor } from '@/lib/constructionStages';
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
  X,
  Bed,
  Bath,
  Square,
  Award,
  Heart,
  Share2,
  Eye,
  TrendingUp,
  Wrench
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

const UnitCard = ({ unit, project, viewMode = 'grid' }) => {
  const router = useRouter();

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800';
      case 'SOLD':
        return 'bg-red-100 text-red-800';
      case 'UNDER_CONSTRUCTION':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUnitTypeDisplay = (unitType) => {
    switch (unitType) {
      case 'STUDIO':
        return 'Studio';
      case 'ONE_BEDROOM':
        return '1 Bedroom';
      case 'TWO_BEDROOM':
        return '2 Bedroom';
      case 'THREE_BEDROOM':
        return '3 Bedroom';
      case 'FOUR_BEDROOM':
        return '4 Bedroom';
      case 'PENTHOUSE':
        return 'Penthouse';
      default:
        return unitType?.replace('_', ' ') || 'Unknown';
    }
  };

  const handleUnitClick = () => {
    router.push(`/units/${unit.id}`);
  };

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleUnitClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center relative">
              <Building className="w-8 h-8 text-gray-400" />
              {unit.isFeatured && (
                <div className="absolute -top-1 -right-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Unit {unit.unitNumber}
                </h3>
                {unit.isFeatured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2">{project?.name || 'Unknown Project'}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  {unit.bedrooms} bed
                </span>
                <span className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  {unit.bathrooms} bath
                </span>
                <span className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  {unit.sqft} sq ft
                </span>
                <span className="text-blue-600 font-medium">
                  {getUnitTypeDisplay(unit.unitType)}
                </span>
              </div>
              {unit.floor && (
                <div className="text-sm text-gray-500 mt-1">
                  Floor {unit.floor}
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {formatPrice(unit.price)}
            </div>
            <div className="flex flex-col gap-1">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
                {unit.status?.replace('_', ' ')}
              </span>
              {unit.currentConstructionStage && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getConstructionStageColor(unit.currentConstructionStage)}`}>
                  {ConstructionStages[unit.currentConstructionStage]?.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleUnitClick}
    >
      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
        <Building className="w-16 h-16 text-gray-400" />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
            {unit.status?.replace('_', ' ')}
          </span>
          {unit.currentConstructionStage && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConstructionStageColor(unit.currentConstructionStage)}`}>
              <Wrench className="w-3 h-3 inline mr-1" />
              {ConstructionStages[unit.currentConstructionStage]?.label}
            </span>
          )}
        </div>
        {unit.isFeatured && (
          <div className="absolute top-4 left-4">
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-medium flex items-center">
              <Award className="w-3 h-3 mr-1" />
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            Unit {unit.unitNumber}
          </h3>
          <span className="text-sm text-blue-600 font-medium">
            {getUnitTypeDisplay(unit.unitType)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-2">{project?.name || 'Unknown Project'}</p>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{unit.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            {unit.bedrooms}
          </span>
          <span className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            {unit.bathrooms}
          </span>
          <span className="flex items-center">
            <Square className="w-4 h-4 mr-1" />
            {unit.sqft} sq ft
          </span>
          {unit.floor && (
            <span className="text-xs text-gray-500">
              Floor {unit.floor}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">
            {formatPrice(unit.price)}
          </div>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const FeaturedUnitsHero = ({ featuredUnits, projects }) => {
  const router = useRouter();

  if (!featuredUnits || featuredUnits.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Featured Units</h2>
          <p className="text-blue-100 text-lg">
            Discover our handpicked selection of premium units
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredUnits.slice(0, 3).map(unit => {
            const project = projects?.find(p => p.id === unit.projectId);
            return (
              <div
                key={unit.id}
                onClick={() => router.push(`/units/${unit.id}`)}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-medium flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    Featured
                  </span>
                  <span className="text-blue-100 text-sm">
                    {unit.status?.replace('_', ' ')}
                  </span>
                </div>
                
                                <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-200 transition-colors">
                  Unit {unit.unitNumber}
                </h3>
                <p className="text-blue-100 text-sm mb-4">{project?.name || 'Unknown Project'}</p>
                
                <div className="flex items-center justify-between text-sm text-blue-100 mb-4">
                  <span className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    {unit.bedrooms}
                  </span>
                  <span className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    {unit.bathrooms}
                  </span>
                  <span className="flex items-center">
                    <Square className="w-4 h-4 mr-1" />
                    {unit.sqft} sq ft
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {formatPrice(unit.price)}
                  </div>
                  <button className="text-yellow-200 hover:text-white text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {featuredUnits.length > 3 && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                // Scroll to units section and apply featured filter
                document.getElementById('units-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              View All {featuredUnits.length} Featured Units
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function UnitsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('unitNumber');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const { units, loading: unitsLoading, error: unitsError } = useUnits();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    unitType: 'all',
    project: 'all',
    priceRange: 'all',
    bedrooms: 'all',
    bathrooms: 'all',
    featured: 'all',
    constructionStage: 'all'
  });

  // Filter sections state
  const [filterSections, setFilterSections] = useState({
    featured: true,
    status: true,
    type: true,
    project: true,
    price: true,
    rooms: true,
    construction: false
  });

  const toggleFilterSection = (section) => {
    setFilterSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get filter options
  const filterOptions = useMemo(() => {
    if (!units || !Array.isArray(units) || !projects || !Array.isArray(projects)) {
      return {
        unitTypes: [],
        projects: [],
        bedroomOptions: [],
        bathroomOptions: [],
        constructionStages: []
      };
    }

    const unitTypes = [...new Set(units.map(u => u.unitType).filter(Boolean))];
    const bedroomOptions = [...new Set(units.map(u => u.bedrooms).filter(b => b > 0))].sort((a, b) => a - b);
    const bathroomOptions = [...new Set(units.map(u => u.bathrooms).filter(b => b > 0))].sort((a, b) => a - b);
    const constructionStages = [...new Set(units.map(u => u.currentConstructionStage).filter(Boolean))];

    return {
      unitTypes,
      projects,
      bedroomOptions,
      bathroomOptions,
      constructionStages
    };
  }, [units, projects]);

  // Get featured units
  const featuredUnits = useMemo(() => {
    if (!units || !Array.isArray(units)) return [];
    return units.filter(unit => unit.isFeatured);
  }, [units]);

  // Filter and sort units
  const filteredUnits = useMemo(() => {
    if (!units || !Array.isArray(units)) return [];
    
    let filtered = units.filter(unit => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const project = projects?.find(p => p.id === unit.projectId);
        const matchesSearch = 
          unit.unitNumber.toLowerCase().includes(searchLower) ||
          unit.description?.toLowerCase().includes(searchLower) ||
          unit.unitType?.toLowerCase().includes(searchLower) ||
          project?.name?.toLowerCase().includes(searchLower) ||
          project?.address?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && unit.status !== filters.status) {
        return false;
      }

      // Unit type filter
      if (filters.unitType !== 'all' && unit.unitType !== filters.unitType) {
        return false;
      }

      // Project filter
      if (filters.project !== 'all' && unit.projectId !== parseInt(filters.project)) {
        return false;
      }

      // Price range filter
      if (filters.priceRange !== 'all') {
        const price = unit.price || 0;
        switch (filters.priceRange) {
          case 'under-500k':
            if (price >= 500000) return false;
            break;
          case '500k-1m':
            if (price < 500000 || price > 1000000) return false;
            break;
          case '1m-2m':
            if (price < 1000000 || price > 2000000) return false;
            break;
          case 'over-2m':
            if (price < 2000000) return false;
            break;
        }
      }

      // Bedrooms filter
      if (filters.bedrooms !== 'all' && unit.bedrooms !== parseInt(filters.bedrooms)) {
        return false;
      }

      // Bathrooms filter
      if (filters.bathrooms !== 'all' && unit.bathrooms !== parseInt(filters.bathrooms)) {
        return false;
      }

      // Featured filter
      if (filters.featured !== 'all') {
        if (filters.featured === 'featured' && !unit.isFeatured) return false;
        if (filters.featured === 'regular' && unit.isFeatured) return false;
      }

      // Construction stage filter
      if (filters.constructionStage !== 'all' && unit.currentConstructionStage !== filters.constructionStage) {
        return false;
      }

      return true;
    });

    // Sort units
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'unitNumber':
          aValue = a.unitNumber;
          bValue = b.unitNumber;
          break;
        case 'price-asc':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'price-desc':
          aValue = b.price || 0;
          bValue = a.price || 0;
          break;
        case 'size-asc':
          aValue = a.sqft || 0;
          bValue = b.sqft || 0;
          break;
        case 'size-desc':
          aValue = b.sqft || 0;
          bValue = a.sqft || 0;
          break;
        case 'bedrooms':
          aValue = a.bedrooms || 0;
          bValue = b.bedrooms || 0;
          break;
        case 'featured':
          aValue = b.isFeatured ? 1 : 0;
          bValue = a.isFeatured ? 1 : 0;
          break;
        case 'newest':
          aValue = new Date(b.createdAt);
          bValue = new Date(a.createdAt);
          break;
        default:
          aValue = a.unitNumber;
          bValue = b.unitNumber;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' 
        ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
        : (aValue > bValue ? -1 : aValue < bValue ? 1 : 0);
    });

    return filtered;
  }, [searchTerm, filters, sortBy, sortOrder, units, projects]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      unitType: 'all',
      project: 'all',
      priceRange: 'all',
      bedrooms: 'all',
      bathrooms: 'all',
      featured: 'all',
      constructionStage: 'all'
    });
    setSearchTerm('');
  };

  const getProjectForUnit = (projectId) => {
    return projects?.find(p => p.id === projectId);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all'
  ).length + (searchTerm ? 1 : 0);

  const isLoading = unitsLoading || projectsLoading;
  const error = unitsError || projectsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">We couldn't load the units. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Available Units</h1>
          <p className="text-xl text-gray-600 mb-4">
            Find your perfect home from our collection of premium units
          </p>
        </div>

        {/* Featured Units Hero */}
        <FeaturedUnitsHero featuredUnits={featuredUnits} projects={projects} />

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search units, projects, or locations..."
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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="unitNumber">Unit Number</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="size-asc">Size: Small to Large</option>
                <option value="size-desc">Size: Large to Small</option>
                <option value="bedrooms">Bedrooms</option>
                <option value="featured">Featured First</option>
                <option value="newest">Newest First</option>
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
                  {filters.unitType !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                      Type: {filters.unitType.replace('_', ' ')}
                      <button
                        onClick={() => handleFilterChange('unitType', 'all')}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.project !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                      Project: {projects?.find(p => p.id === parseInt(filters.project))?.name || 'Unknown'}
                      <button
                        onClick={() => handleFilterChange('project', 'all')}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.featured !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      {filters.featured === 'featured' ? 'Featured Only' : 'Regular Only'}
                      <button
                        onClick={() => handleFilterChange('featured', 'all')}
                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
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

        <div className="flex gap-8" id="units-section">
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
                {/* Featured Filter */}
                <FilterSection
                  title="Featured Units"
                  isOpen={filterSections.featured}
                  onToggle={() => toggleFilterSection('featured')}
                >
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Units' },
                      { value: 'featured', label: `Featured Only (${featuredUnits.length})` },
                      { value: 'regular', label: 'Regular Units' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="featured"
                          value={option.value}
                          checked={filters.featured === option.value}
                          onChange={(e) => handleFilterChange('featured', e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Status Filter */}
                <FilterSection
                  title="Availability Status"
                  isOpen={filterSections.status}
                  onToggle={() => toggleFilterSection('status')}
                >
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Status' },
                      { value: 'AVAILABLE', label: 'Available' },
                      { value: 'RESERVED', label: 'Reserved' },
                      { value: 'SOLD', label: 'Sold' },
                      { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={filters.status === option.value}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Unit Type Filter */}
                <FilterSection
                  title="Unit Type"
                  isOpen={filterSections.type}
                  onToggle={() => toggleFilterSection('type')}
                >
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="unitType"
                        value="all"
                        checked={filters.unitType === 'all'}
                        onChange={(e) => handleFilterChange('unitType', e.target.value)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">All Types</span>
                    </label>
                    {filterOptions.unitTypes.map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="unitType"
                          value={type}
                          checked={filters.unitType === type}
                          onChange={(e) => handleFilterChange('unitType', e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {type?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Project Filter */}
                <FilterSection
                  title="Project"
                  isOpen={filterSections.project}
                  onToggle={() => toggleFilterSection('project')}
                >
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="project"
                        value="all"
                        checked={filters.project === 'all'}
                        onChange={(e) => handleFilterChange('project', e.target.value)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">All Projects</span>
                    </label>
                    {filterOptions.projects.map(project => (
                      <label key={project.id} className="flex items-center">
                        <input
                          type="radio"
                          name="project"
                          value={project.id.toString()}
                          checked={filters.project === project.id.toString()}
                          onChange={(e) => handleFilterChange('project', e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{project.name}</span>
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

                {/* Bedrooms & Bathrooms Filter */}
                <FilterSection
                  title="Bedrooms & Bathrooms"
                  isOpen={filterSections.rooms}
                  onToggle={() => toggleFilterSection('rooms')}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="bedrooms"
                            value="all"
                            checked={filters.bedrooms === 'all'}
                            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                            className="mr-3 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Any</span>
                        </label>
                        {filterOptions.bedroomOptions.map(count => (
                          <label key={count} className="flex items-center">
                            <input
                              type="radio"
                              name="bedrooms"
                              value={count.toString()}
                              checked={filters.bedrooms === count.toString()}
                              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                              className="mr-3 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{count} bed{count > 1 ? 's' : ''}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="bathrooms"
                            value="all"
                            checked={filters.bathrooms === 'all'}
                            onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                            className="mr-3 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Any</span>
                        </label>
                        {filterOptions.bathroomOptions.map(count => (
                          <label key={count} className="flex items-center">
                            <input
                              type="radio"
                              name="bathrooms"
                              value={count.toString()}
                              checked={filters.bathrooms === count.toString()}
                              onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                              className="mr-3 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{count} bath{count > 1 ? 's' : ''}</span>
                          </label>
                        ))}
                      </div>
                    </div>
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
                          {ConstructionStages[stage]?.label || stage.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              </div>
            </div>
          )}

          {/* Units Grid/List */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredUnits.length} Unit{filteredUnits.length !== 1 ? 's' : ''} Found
                </h2>
                {searchTerm && (
                  <p className="text-gray-600 mt-1">
                    Results for "{searchTerm}"
                  </p>
                )}
              </div>
            </div>

            {/* Units Display */}
            {filteredUnits.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              }>
                {filteredUnits.map(unit => {
                  const project = getProjectForUnit(unit.projectId);
                  return (
                    <UnitCard 
                      key={unit.id} 
                      unit={unit}
                      project={project}
                      viewMode={viewMode}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Units Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters to find more units.
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

        {/* CTA Section */}
        {filteredUnits.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Find Your Dream Home?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Browse through our premium collection of units and find the perfect home that matches your lifestyle and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Schedule Site Visit
              </button>
              <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Contact Sales Team
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
