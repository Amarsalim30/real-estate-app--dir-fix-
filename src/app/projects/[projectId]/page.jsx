'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/header';
import UnitCard from '@/components/units/UnitCard';
import ProjectDetail from '@/components/projects/ProjectDetail';
import UnitFilters from '@/components/units/UnitFilters';
import { formatPrice } from '@/utils/format';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Building, 
  Users, 
  Star,
  Share2,
  Heart,
  Phone,
  Mail
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('units');
  const [unitFilters, setUnitFilters] = useState({
    status: 'all',
    type: 'all',
    priceRange: 'all',
    floor: 'all',
    bedrooms: 'all'
  });
  const [showContactModal, setShowContactModal] = useState(false);

  const project = Array.isArray(Projects) ? Projects.find(p => p.id === parseInt(params.projectId)) : null;
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
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

  const projectUnits = Array.isArray(Units) ? Units.filter(unit => unit.projectId === project.id) : [];
  
  const filteredUnits = useMemo(() => {
    return projectUnits.filter(unit => {
      if (unitFilters.status !== 'all' && unit.status !== unitFilters.status) {
        return false;
      }
      
      if (unitFilters.type !== 'all' && unit.type !== unitFilters.type) {
        return false;
      }

      if (unitFilters.bedrooms !== 'all' && unit.bedrooms !== parseInt(unitFilters.bedrooms)) {
        return false;
      }

      if (unitFilters.floor !== 'all' && unit.floor !== parseInt(unitFilters.floor)) {
        return false;
      }

      if (unitFilters.priceRange !== 'all') {
        const price = unit.price || 0;
        switch (unitFilters.priceRange) {
          case 'under_500k':
            return price < 500000;
          case '500k_1m':
            return price >= 500000 && price <= 1000000;
          case 'over_1m':
            return price > 1000000;
          default:
            return true;
        }
      }
      
      return true;
    });
  }, [projectUnits, unitFilters]);

  const projectStats = {
    total: projectUnits.length,
    available: projectUnits.filter(unit => unit.status === 'available').length,
    reserved: projectUnits.filter(unit => unit.status === 'reserved').length,
    sold: projectUnits.filter(unit => unit.status === 'sold').length,
  };

  const tabs = [
    { id: 'units', label: 'Units', count: projectStats.total },
    { id: 'details', label: 'Project Details' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'progress', label: 'Construction Progress' },
    { id: 'gallery', label: 'Gallery' },
  ];

  const handleUnitAction = (unit, action) => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    switch (action) {
      case 'reserve':
        router.push(`/projects/${project.id}/units/${unit.id}/reserve`);
        break;
      case 'purchase':
        router.push(`/projects/${project.id}/units/${unit.id}/purchase`);
        break;
      case 'details':
        router.push(`/projects/${project.id}/units/${unit.id}`);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-4 mb-8" aria-label="Breadcrumb">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{project.name}</span>
        </nav>

        {/* Project Hero */}
        <div className="bg-white rounded-xl shadow-sm border mb-8 overflow-hidden">
          {/* Project Image */}
          <div className="relative h-96 bg-gradient-to-r from-blue-500 to-purple-600">
            {project.images && project.images.length > 0 ? (
              <img
                src={project.images[0]}
                alt={project.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Building className="w-24 h-24 text-white opacity-50" />
              </div>
            )}
            
            {/* Overlay Actions */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="absolute bottom-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === "completed" ? "bg-green-100 text-green-800" :
                project.status === "under_construction" ? "bg-blue-100 text-blue-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {project.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
          </div>
          
          {/* Project Info */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.name}</h1>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    <span>{project.developer}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>Completion: {project.expectedCompletion?.toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {project.description}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{projectStats.total}</div>
                    <div className="text-sm text-gray-600">Total Units</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{projectStats.available}</div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{projectStats.sold}</div>
                    <div className="text-sm text-gray-600">Sold</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{project.constructionProgress || 0}%</div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
              </div>
              
              {/* Price and CTA */}
              <div className="lg:ml-8 mt-6 lg:mt-0">
                <div className="bg-gray-50 rounded-xl p-6 lg:w-80">
                  <div className="text-center mb-6">
                    <div className="text-sm text-gray-600 mb-2">Price Range</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {project.priceRange ? 
                        `${formatPrice(project.priceRange.min)} - ${formatPrice(project.priceRange.max)}` :
                        'Price on Request'
                      }
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Construction Progress</span>
                      <span className="font-medium">{project.constructionProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${project.constructionProgress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Contact Sales Team
                    </button>
                    <button
                      onClick={() => setActiveTab('units')}
                      className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      View Available Units
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'units' && (
              <div>
                {/* Unit Filters */}
                <UnitFilters
                  filters={unitFilters}
                  onFiltersChange={setUnitFilters}
                  units={projectUnits}
                />

                {/* Units Grid */}
                {filteredUnits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {filteredUnits.map(unit => (
                      <UnitCard
                        key={unit.id}
                        unit={unit}
                        project={project}
                        onReserve={(unit) => handleUnitAction(unit, 'reserve')}
                        onPurchase={(unit) => handleUnitAction(unit, 'purchase')}
                        onViewDetails={(unit) => handleUnitAction(unit, 'details')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <div className="text-xl font-medium text-gray-900 mb-2">No units found</div>
                    <div className="text-gray-500 mb-6">Try adjusting your filters to see more units</div>
                    <button
                      onClick={() => setUnitFilters({
                        status: 'all',
                        type: 'all',
                        priceRange: 'all',
                        floor: 'all',
                        bedrooms: 'all'
                      })}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <ProjectDetail project={project} />
            )}

            {activeTab === 'amenities' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Project Amenities</h3>
                {project.amenities && project.amenities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Amenity information will be available soon</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Construction Progress</h3>
                <div className="space-y-8">
                  {/* Overall Progress */}
                                  <div className="bg-gray-50 rounded-xl p-8">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xl font-semibold text-gray-900">Overall Progress</span>
                      <span className="text-3xl font-bold text-blue-600">{project.constructionProgress || 0}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-6 mb-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-6 rounded-full transition-all duration-500"
                        style={{ width: `${project.constructionProgress || 0}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Timeline */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-white border rounded-lg">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-medium">{project.startDate?.toLocaleDateString() || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white border rounded-lg">
                          <span className="text-gray-600">Expected Completion:</span>
                          <span className="font-medium">{project.expectedCompletion?.toLocaleDateString() || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white border rounded-lg">
                          <span className="text-gray-600">Current Status:</span>
                          <span className={`font-medium capitalize ${
                            project.status === 'completed' ? 'text-green-600' :
                            project.status === 'under_construction' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>
                            {project.status?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sales Progress */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Sales Progress</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-white border rounded-lg">
                          <span className="text-gray-600">Total Units:</span>
                          <span className="font-medium">{projectStats.total}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white border rounded-lg">
                          <span className="text-gray-600">Sold:</span>
                          <span className="font-medium text-green-600">{projectStats.sold}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white border rounded-lg">
                          <span className="text-gray-600">Reserved:</span>
                          <span className="font-medium text-blue-600">{projectStats.reserved}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white border rounded-lg">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium text-gray-900">{projectStats.available}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Project Gallery</h3>
                {project.images && project.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {project.images.map((image, index) => (
                      <div key={index} className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${project.name} - Image ${index + 1}`}
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-project.jpg';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Gallery images will be available soon</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Sales Team</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Call Us</div>
                    <div className="text-gray-600">+1-555-REAL-EST</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Email Us</div>
                    <div className="text-gray-600">sales@realestate.com</div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => window.open('tel:+1-555-REAL-EST')}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Call Now
                </button>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
