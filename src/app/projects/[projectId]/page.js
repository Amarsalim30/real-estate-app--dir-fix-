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
import { formatPrice } from '@/utils/formatPrice';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('units');
  const [unitFilters, setUnitFilters] = useState({
    status: 'all',
    type: 'all',
    priceRange: 'all',
    floor: 'all'
  });

  const project = Projects.find(p => p.id === parseInt(params.projectId));
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <button
            onClick={() => router.push('/projects')}
            className="btn-primary"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const projectUnits = Units.filter(unit => unit.projectId === project.id);
  
  const filteredUnits = useMemo(() => {
    return projectUnits.filter(unit => {
      if (unitFilters.status !== 'all' && unit.status !== unitFilters.status) {
        return false;
      }
      
      if (unitFilters.type !== 'all' && unit.type !== unitFilters.type) {
        return false;
      }
      
      // Add more filter logic as needed
      
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
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
                <p className="text-gray-600 mb-4">{project.location}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>Total Units: {projectStats.total}</span>
                  <span>Available: {projectStats.available}</span>
                  <span>Progress: {project.constructionProgress}%</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Price Range</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPrice(project.priceRange.min)} - {formatPrice(project.priceRange.max)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="px-6 pb-6">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.constructionProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
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

          <div className="p-6">
            {activeTab === 'units' && (
              <div>
                {/* Unit Filters */}
                <UnitFilters
                  filters={unitFilters}
                  onFiltersChange={setUnitFilters}
                  units={projectUnits}
                />

                {/* Units Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {filteredUnits.map(unit => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      project={project}
                      onReserve={(unit) => router.push(`/projects/${project.id}/units/${unit.id}/reserve`)}
                      onPurchase={(unit) => router.push(`/projects/${project.id}/units/${unit.id}/purchase`)}
                      onViewDetails={(unit) => router.push(`/projects/${project.id}/units/${unit.id}`)}
                    />
                  ))}
                </div>

                {filteredUnits.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">No units found</div>
                    <div className="text-gray-400 mt-2">Try adjusting your filters</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <ProjectDetail project={project} />
            )}

            {activeTab === 'amenities' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {project.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'progress' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Construction Progress</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium">Overall Progress</span>
                      <span className="text-2xl font-bold text-primary-600">{project.constructionProgress}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-primary-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${project.constructionProgress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Project Timeline</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-medium">{project.startDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Completion:</span>
                          <span className="font-medium">{project.expectedCompletion.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-medium capitalize ${
                            project.status === 'completed' ? 'text-green-600' :
                            project.status === 'under_construction' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Sales Progress</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Units:</span>
                          <span className="font-medium">{projectStats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sold:</span>
                          <span className="font-medium text-green-600">{projectStats.sold}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reserved:</span>
                          <span className="font-medium text-blue-600">{projectStats.reserved}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium text-gray-900">{projectStats.available}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
