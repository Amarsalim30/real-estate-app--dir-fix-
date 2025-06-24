'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { useUnits } from '@/hooks/useUnits';
import { formatPrice } from '@/utils/format';
import { ConstructionStages, getConstructionStageColor, getConstructionProgressPercentage } from '@/lib/constructionStages';
import {
  ArrowLeft,
  MapPin,
  Building,
  Calendar,
  Users,
  Star,
  Share2,
  Heart,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  Grid3X3,
  List,
  Bed,
  Bath,
  Square,
  DollarSign,
  Award,
  Wrench,
  TrendingUp
} from 'lucide-react';

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
    router.push(`/projects/${project.id}/units/${unit.id}`);
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
              <p className="text-gray-600 text-sm mb-2">{unit.description}</p>
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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [unitsViewMode, setUnitsViewMode] = useState('grid');
  const [unitsFilter, setUnitsFilter] = useState('all');
  const [unitsSortBy, setUnitsSortBy] = useState('unitNumber');
  const { projects, loading: isLoading, error } = useProjects();
  const { units } = useUnits();

  const project = useMemo(() => {
    if (!projects || !Array.isArray(projects) || !params?.projectId) {
      return null;
    }
    return projects.find(p => p.id === parseInt(params.projectId));
  }, [projects, params?.projectId]);

  const projectUnits = useMemo(() => {
    if (!units || !Array.isArray(units) || !project?.id) {
      return [];
    }
    return units.filter(unit => unit.projectId === project.id);
  }, [units, project?.id]);

  // Calculate project statistics
  const stats = useMemo(() => {
    const total = projectUnits.length;
    const available = projectUnits.filter(u => u.status === 'AVAILABLE').length;
    const reserved = projectUnits.filter(u => u.status === 'RESERVED').length;
    const sold = projectUnits.filter(u => u.status === 'SOLD').length;
    const underConstruction = projectUnits.filter(u => u.status === 'UNDER_CONSTRUCTION').length;

    const prices = projectUnits.map(u => u.price).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

    const salesProgress = total > 0 ? ((sold + reserved) / total * 100) : 0;

    // Construction stage breakdown
    const stageBreakdown = projectUnits.reduce((acc, unit) => {
      if (unit.currentConstructionStage) {
        acc[unit.currentConstructionStage] = (acc[unit.currentConstructionStage] || 0) + 1;
      }
      return acc;
    }, {});

    // Overall project construction progress
    const projectConstructionProgress = project?.currentConstructionStage 
      ? getConstructionProgressPercentage(project.currentConstructionStage)
      : 0;

    return {
      total,
      available,
      reserved,
      sold,
      underConstruction,
      minPrice,
      maxPrice,
      avgPrice,
      salesProgress,
      stageBreakdown,
      projectConstructionProgress
    };
  }, [projectUnits, project]);

  // Filter and sort units
  const filteredUnits = useMemo(() => {
    let filtered = projectUnits;

    if (unitsFilter !== 'all') {
      if (unitsFilter === 'featured') {
        filtered = filtered.filter(unit => unit.isFeatured);
      } else {
        filtered = filtered.filter(unit => unit.status === unitsFilter);
      }
    }
    filtered.sort((a, b) => {
      switch (unitsSortBy) {
        case 'unitNumber':
          return a.unitNumber.localeCompare(b.unitNumber);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'size-asc':
          return a.sqft - b.sqft;
        case 'size-desc':
          return b.sqft - a.sqft;
        case 'floor-asc':
          return (a.floor || 0) - (b.floor || 0);
        case 'floor-desc':
          return (b.floor || 0) - (a.floor || 0);
        case 'featured':
          return b.isFeatured - a.isFeatured;
        case 'construction-progress':
          const aProgress = getConstructionProgressPercentage(a.currentConstructionStage || 'PLANNING');
          const bProgress = getConstructionProgressPercentage(b.currentConstructionStage || 'PLANNING');
          return bProgress - aProgress;
        default:
          return 0;
      }
    });

    return filtered;
  }, [projectUnits, unitsFilter, unitsSortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <button
            onClick={() => router.push('/projects')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return CheckCircle;
      case 'UNDER_CONSTRUCTION':
        return Clock;
      case 'PLANNING':
        return AlertCircle;
      case 'ON_HOLD':
        return AlertCircle;
      default:
        return Building;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'UNDER_CONSTRUCTION':
        return 'bg-blue-100 text-blue-800';
      case 'PLANNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ON_HOLD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatusIcon = getStatusIcon(project.status);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'units', label: `Units (${stats.total})` },
    { id: 'construction', label: 'Construction Progress' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'location', label: 'Location' },
    { id: 'gallery', label: 'Gallery' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to projects
        </button>

        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
          <div className="relative h-96">
            {project.images && project.images.length > 0 ? (
              <img
                src={project.images[0]}
                alt={project.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Building className="w-24 h-24 text-blue-400" />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-8 text-white">
                <div className="flex items-center mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white`}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    {project.status?.replace('_', ' ')}
                  </span>
                  {project.currentConstructionStage && (
                    <span className="ml-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                      <TrendingUp className="w-4 h-4 mr-2 inline" />
                      {ConstructionStages[project.currentConstructionStage]?.label} - {stats.projectConstructionProgress}%
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
                <div className="flex items-center text-lg mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  {project.address}, {project.subCounty}, {project.county}
                </div>
                <p className="text-lg opacity-90 max-w-2xl">{project.description}</p>
                {project.developerName && (
                  <div className="mt-4 text-sm opacity-75">
                    Developer: {project.developerName}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-6 right-6 flex space-x-3">
                <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
            <div className="text-gray-600">Total Units</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.available}</div>
            <div className="text-gray-600">Available</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.salesProgress.toFixed(0)}%</div>
            <div className="text-gray-600">Sold</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.projectConstructionProgress}%</div>
            <div className="text-gray-600">Construction</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {project.minPrice && project.maxPrice && project.minPrice === project.maxPrice ?
                formatPrice(project.minPrice) :
                formatPrice(project.minPrice || stats.minPrice)
              }
            </div>
            <div className="text-gray-600">Starting From</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Project Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h3>
                    <div className="space-y-4">
                      {project.developerName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Developer</span>
                          <span className="font-medium text-gray-900">{project.developerName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Units</span>
                        <span className="font-medium text-gray-900">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price Range</span>
                        <span className="font-medium text-gray-900">
                          {project.minPrice && project.maxPrice ? (
                            project.minPrice === project.maxPrice ?
                              formatPrice(project.minPrice) :
                              `${formatPrice(project.minPrice)} - ${formatPrice(project.maxPrice)}`
                          ) : (
                            stats.minPrice === stats.maxPrice ?
                              formatPrice(stats.minPrice) :
                              `${formatPrice(stats.minPrice)} - ${formatPrice(stats.maxPrice)}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Price</span>
                        <span className="font-medium text-gray-900">{formatPrice(stats.avgPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Construction Stage</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getConstructionStageColor(project.currentConstructionStage || 'PLANNING')}`}>
                          {ConstructionStages[project.currentConstructionStage || 'PLANNING']?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Construction Progress</span>
                        <span className="font-medium text-gray-900">{stats.projectConstructionProgress}%</span>
                      </div>
                      {project.startDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date</span>
                          <span className="font-medium text-gray-900">
                            {new Date(project.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {project.targetCompletionDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target Completion</span>
                          <span className="font-medium text-gray-900">
                            {new Date(project.targetCompletionDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {project.completionDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completed On</span>
                          <span className="font-medium text-gray-900">
                            {new Date(project.completionDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Sales Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Overall Progress</span>
                          <span className="font-medium text-gray-900">{stats.salesProgress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="flex h-3 rounded-full overflow-hidden">
                            <div
                              className="bg-green-500 transition-all duration-300"
                              style={{ width: `${(stats.sold / stats.total * 100)}%` }}
                            />
                            <div
                              className="bg-yellow-500 transition-all duration-300"
                              style={{ width: `${(stats.reserved / stats.total * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Sold: {stats.sold}</span>
                          <span>Reserved: {stats.reserved}</span>
                          <span>Available: {stats.available}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{stats.sold}</div>
                          <div className="text-sm text-green-700">Sold</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
                          <div className="text-sm text-yellow-700">Reserved</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{stats.available}</div>
                          <div className="text-sm text-blue-700">Available</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{stats.underConstruction}</div>
                          <div className="text-sm text-orange-700">Under Construction</div>
                        </div>
                      </div>
                    </div>

                    {/* Construction Stage Breakdown */}
                    {Object.keys(stats.stageBreakdown).length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-3">Unit Construction Stages</h4>
                        <div className="space-y-2">
                          {Object.entries(stats.stageBreakdown).map(([stage, count]) => (
                            <div key={stage} className="flex justify-between items-center">
                              <span className={`text-sm px-2 py-1 rounded-full ${getConstructionStageColor(stage)}`}>
                                {ConstructionStages[stage]?.label || stage.replace('_', ' ')}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{count} units</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">Sales Office</div>
                        <div className="text-gray-600">+1 (555) 123-4567</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">Email</div>
                        <div className="text-gray-600">sales@{project.name.toLowerCase().replace(/\s+/g, '')}.com</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Units Tab */}
            {activeTab === 'units' && (
              <div className="space-y-6">
                {/* Units Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <select
                      value={unitsFilter}
                      onChange={(e) => setUnitsFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Units ({stats.total})</option>
                      <option value="AVAILABLE">Available ({stats.available})</option>
                      <option value="RESERVED">Reserved ({stats.reserved})</option>
                      <option value="SOLD">Sold ({stats.sold})</option>
                      <option value="UNDER_CONSTRUCTION">Under Construction ({stats.underConstruction})</option>
                      <option value="featured">Featured Units</option>
                    </select>

                    <select
                      value={unitsSortBy}
                      onChange={(e) => setUnitsSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="unitNumber">Unit Number</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="size-asc">Size: Small to Large</option>
                      <option value="size-desc">Size: Large to Small</option>
                      <option value="floor-asc">Floor: Low to High</option>
                      <option value="floor-desc">Floor: High to Low</option>
                      <option value="construction-progress">Construction Progress</option>
                      <option value="featured">Featured First</option>
                    </select>
                  </div>

                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setUnitsViewMode('grid')}
                      className={`p-2 ${unitsViewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setUnitsViewMode('list')}
                      className={`p-2 ${unitsViewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Units Display */}
                {filteredUnits.length > 0 ? (
                  <div className={
                    unitsViewMode === 'grid'
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }>
                    {filteredUnits.map(unit => (
                      <UnitCard
                        key={unit.id}
                        unit={unit}
                        project={project}
                        viewMode={unitsViewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Units Found</h3>
                    <p className="text-gray-600">
                      No units match the selected filter criteria.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Construction Progress Tab */}
            {activeTab === 'construction' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Construction Progress Overview</h3>
                  
                  {/* Overall Project Progress */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Overall Project Progress</h4>
                        <p className="text-gray-600">Current stage: {ConstructionStages[project.currentConstructionStage || 'PLANNING']?.label}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{stats.projectConstructionProgress}%</div>
                        <div className="text-sm text-gray-600">Complete</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-white rounded-full h-4 mb-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${stats.projectConstructionProgress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Started</span>
                      <span>In Progress</span>
                      <span>Completed</span>
                    </div>
                  </div>

                  {/* Construction Stages Timeline */}
                  <div className="mb-8">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Construction Stages</h4>
                    <div className="space-y-4">
                      {Object.entries(ConstructionStages).map(([key, stage]) => {
                        const isCompleted = stats.projectConstructionProgress >= stage.milestone;
                        const isCurrent = project.currentConstructionStage === key;
                        
                        return (
                          <div key={key} className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                            isCurrent 
                              ? 'border-blue-500 bg-blue-50' 
                              : isCompleted 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-gray-200 bg-gray-50'
                          }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                              isCurrent 
                                ? 'bg-blue-500 text-white' 
                                : isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-300 text-gray-600'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : isCurrent ? (
                                <Clock className="w-5 h-5" />
                              ) : (
                                <span className="text-sm font-medium">{stage.milestone}</span>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className={`font-medium ${
                                  isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-700'
                                }`}>
                                  {stage.label}
                                </h5>
                                <span className={`text-sm px-2 py-1 rounded-full ${
                                  isCurrent 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : isCompleted 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {stage.milestone}% Milestone
                                </span>
                              </div>
                              
                              {isCurrent && (
                                <p className="text-sm text-blue-700 mt-1">Currently in progress</p>
                              )}
                              {isCompleted && !isCurrent && (
                                <p className="text-sm text-green-700 mt-1">Completed</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Unit Construction Breakdown */}
                  {Object.keys(stats.stageBreakdown).length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Unit Construction Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(stats.stageBreakdown).map(([stage, count]) => (
                          <div key={stage} className="bg-white border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getConstructionStageColor(stage)}`}>
                                {ConstructionStages[stage]?.label}
                              </span>
                              <span className="text-2xl font-bold text-gray-900">{count}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {((count / stats.total) * 100).toFixed(1)}% of total units
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(count / stats.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities Tab */}
            {activeTab === 'amenities' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Project Amenities</h3>
                {project.amenities && project.amenities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="font-medium text-gray-900">{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                                        <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Amenities Listed</h3>
                    <p className="text-gray-600">
                      Amenity information will be updated soon.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Location Details</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Address</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{project.address}</div>
                          <div className="text-gray-600">{project.subCounty}, {project.county}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Neighborhood</h4>
                    <p className="text-gray-600">
                      Located in {project.subCounty}, {project.county}, this development offers easy access to
                      shopping, dining, entertainment, and public transportation.
                    </p>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Interactive Map</h4>
                    <p className="text-gray-600">Map integration coming soon</p>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Project Gallery</h3>
                {project.images && project.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {project.images.map((image, index) => (
                      <div key={index} className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${project.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Building className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Images Available</h3>
                    <p className="text-gray-600">
                      Project images will be added soon.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Interested in {project.name}?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Contact our sales team to schedule a viewing, get more information, or reserve your unit today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Schedule Viewing
            </button>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Download Brochure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
