'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
// import { Projects } from '@/data/projects';
import { useProjectsQuery } from '@/hooks/queries/useProjectsQuery';
import { Units } from '@/data/units';
import { formatPrice } from '@/utils/format';
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
  DollarSign
} from 'lucide-react';

const UnitCard = ({ unit, project, viewMode = 'grid' }) => {
  const router = useRouter();

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building className="w-8 h-8 text-gray-400" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Unit {unit.unitNumber}
              </h3>
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
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {formatPrice(unit.price)}
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
              {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
            </span>
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
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
            {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          Unit {unit.unitNumber}
        </h3>
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
    const { data, isLoading, error } = useProjectsQuery();
    const Projects = data || [];
  

  const project = Projects.find(p => p.id === parseInt(params.projectId));

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
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const projectUnits = Units.filter(unit => unit.projectId === project.id);

  // Calculate project statistics
  const stats = useMemo(() => {
    const total = projectUnits.length;
    const available = projectUnits.filter(u => u.status === 'available').length;
    const reserved = projectUnits.filter(u => u.status === 'reserved').length;
    const sold = projectUnits.filter(u => u.status === 'sold').length;

    const prices = projectUnits.map(u => u.price).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

    const salesProgress = total > 0 ? ((sold + reserved) / total * 100) : 0;

    return {
      total,
      available,
      reserved,
      sold,
      minPrice,
      maxPrice,
      avgPrice,
      salesProgress
    };
  }, [projectUnits]);

  // Filter and sort units
  const filteredUnits = useMemo(() => {
    let filtered = projectUnits;

    if (unitsFilter !== 'all') {
      filtered = filtered.filter(unit => unit.status === unitsFilter);
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
        default:
          return 0;
      }
    });

    return filtered;
  }, [projectUnits, unitsFilter, unitsSortBy]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'under_construction':
        return Clock;
      case 'planning':
        return AlertCircle;
      default:
        return Building;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'under_construction':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatusIcon = getStatusIcon(project.status);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'units', label: `Units (${stats.total})` },
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
          Back to Projects
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
                    {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
                <div className="flex items-center text-lg mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  {project.location}
                </div>
                <p className="text-lg opacity-90 max-w-2xl">{project.description}</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
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
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.minPrice === stats.maxPrice ?
                formatPrice(stats.minPrice) :
                `${formatPrice(stats.minPrice)}`
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Developer</span>
                        <span className="font-medium text-gray-900">{project.developer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Units</span>
                        <span className="font-medium text-gray-900">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price Range</span>
                        <span className="font-medium text-gray-900">
                          {stats.minPrice === stats.maxPrice ?
                            formatPrice(stats.minPrice) :
                            `${formatPrice(stats.minPrice)} - ${formatPrice(stats.maxPrice)}`
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Price</span>
                        <span className="font-medium text-gray-900">{formatPrice(stats.avgPrice)}</span>
                      </div>
                      {project.expectedCompletion && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Completion</span>
                          <span className="font-medium text-gray-900">
                            {new Date(project.expectedCompletion).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {project.status === 'under_construction' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Construction Progress</span>
                          <span className="font-medium text-gray-900">{project.constructionProgress}%</span>
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
                              className="bg-yellow-50 rounded-lg"
                              style={{ transitionDuration: '300ms', width: `${(stats.reserved / stats.total * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Sold: {stats.sold}</span>
                          <span>Reserved: {stats.reserved}</span>
                          <span>Available: {stats.available}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{stats.sold}</div>
                          <div className="text-sm text-green-700">Sold</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
                          <div className="text-sm text-yellow-700otlin">Reserved</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{stats.available}</div>
                          <div className="text-sm text-blue-700">Available</div>
                        </div>
                      </div>
                    </div>
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
                      <option value="available">Available ({stats.available})</option>
                      <option value="reserved">Reserved ({stats.reserved})</option>
                      <option value="sold">Sold ({stats.sold})</option>
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
                          <div className="text-gray-600">{project.city}, {project.state} {project.zipCode}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Neighborhood</h4>
                    <p className="text-gray-600">
                      Located in the heart of {project.location}, this development offers easy access to
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