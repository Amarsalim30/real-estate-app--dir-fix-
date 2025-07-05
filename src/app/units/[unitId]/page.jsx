'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUnits } from '@/hooks/useUnits';
import { useProjects } from '@/hooks/useProjects';
import { formatPrice } from '@/utils/format';
import { ConstructionStages, getConstructionStageColor } from '@/lib/constructionStages';
import {
  ArrowLeft,
  Building,
  MapPin,
  Bed,
  Bath,
  Square,
  Award,
  Heart,
  Share2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench,
  Eye,
  Home,
  Layers
} from 'lucide-react';

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { units, loading: unitsLoading } = useUnits();
  const { projects, loading: projectsLoading } = useProjects();

  const unit = useMemo(() => {
    if (!units || !Array.isArray(units) || !params?.unitId) {
      return null;
    }
    return units.find(u => u.id === parseInt(params.unitId));
  }, [units, params?.unitId]);

  const project = useMemo(() => {
    if (!projects || !Array.isArray(projects) || !unit?.projectId) {
      return null;
    }
    return projects.find(p => p.id === unit.projectId);
  }, [projects, unit?.projectId]);

  const isLoading = unitsLoading || projectsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
          <button
            onClick={() => router.push('/units')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Units
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/units')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Units
        </button>

        {/* Unit Header */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
          <div className="relative h-96">
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Building className="w-24 h-24 text-blue-400" />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-8 text-white">
                              <div className="flex items-center mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white`}>
                    {unit.status?.replace('_', ' ')}
                  </span>
                  {unit.isFeatured && (
                    <span className="ml-3 px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-medium flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      Featured
                    </span>
                  )}
                  {unit.currentConstructionStage && (
                    <span className="ml-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                      <Wrench className="w-4 h-4 mr-2 inline" />
                      {ConstructionStages[unit.currentConstructionStage]?.label}
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl font-bold mb-2">Unit {unit.unitNumber}</h1>
                <div className="text-xl text-blue-100 mb-2">{getUnitTypeDisplay(unit.unitType)}</div>
                
                {project && (
                  <div className="flex items-center text-lg mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    {project.name}, {project.subCounty}, {project.county}
                  </div>
                )}
                
                <p className="text-lg opacity-90 max-w-2xl">{unit.description}</p>
                
                <div className="mt-4 text-3xl font-bold">
                  {formatPrice(unit.price)}
                  <span className="text-lg font-normal text-blue-200 ml-2">
                    ({formatPrice(Math.round(unit.price / unit.sqft))}/sq ft)
                  </span>
                </div>
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

        {/* Unit Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Unit Specifications */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Unit Specifications</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bath className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Square className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.sqft}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Layers className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.floor || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Floor</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Unit Type</span>
                  <span className="font-medium text-gray-900">{getUnitTypeDisplay(unit.unitType)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
                    {unit.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Price per Sq Ft</span>
                  <span className="font-medium text-gray-900">{formatPrice(Math.round(unit.price / unit.sqft))}</span>
                </div>
                {unit.currentConstructionStage && (
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Construction Stage</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConstructionStageColor(unit.currentConstructionStage)}`}>
                      {ConstructionStages[unit.currentConstructionStage]?.label}
                    </span>
                  </div>
                )}
                {unit.floor && (
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Floor Level</span>
                    <span className="font-medium text-gray-900">Floor {unit.floor}</span>
                  </div>
                )}
                <div className="flex justify-between py-3">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-900">
                    {new Date(unit.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Project Information */}
            {project && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Information</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Project Name</span>
                    <span className="font-medium text-gray-900">{project.name}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium text-gray-900">{project.subCounty}, {project.county}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Address</span>
                    <span className="font-medium text-gray-900">{project.address}</span>
                  </div>
                  {project.developerName && (
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Developer</span>
                      <span className="font-medium text-gray-900">{project.developerName}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3">
                    <span className="text-gray-600">Project Status</span>
                    <span className="font-medium text-gray-900">{project.status?.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Full Project Details
                  </button>
                </div>
              </div>
            )}

            {/* Amenities */}
            {project?.amenities && project.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-medium text-gray-900">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interested in this unit?</h3>
              <p className="text-gray-600 mb-6">
                Contact our sales team for more information, schedule a viewing, or make an offer.
              </p>
              
              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Purchase Now
                </button>
                <button
                  className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all shadow-sm">
                  Reserve 
                </button>
                {/* {unit.status === 'AVAILABLE' && (
                  <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    Make a
                  </button>
                )} */}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center mb-3">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Sales Office</div>
                    <div className="text-gray-600">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">sales@realestate.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium text-gray-900">{formatPrice(unit.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per Sq Ft</span>
                  <span className="font-medium text-gray-900">{formatPrice(Math.round(unit.price / unit.sqft))}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Price</span>
                    <span className="font-bold text-xl text-gray-900">{formatPrice(unit.price)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Final pricing may vary based on selected finishes and customizations.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit ID</span>
                  <span className="font-medium text-gray-900">#{unit.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(unit.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {unit.isFeatured && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Featured Unit</span>
                    <span className="flex items-center text-yellow-600 font-medium">
                      <Award className="w-4 h-4 mr-1" />
                      Yes
                    </span>
                  </div>
                )}
                                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium text-gray-900">
                    {Math.floor(Math.random() * 100) + 50} {/* Placeholder for view count */}
                  </span>
                </div>
              </div>
            </div>

            {/* Similar Units */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Units</h3>
              
              <div className="space-y-4">
                {units
                  ?.filter(u => 
                    u.id !== unit.id && 
                    u.projectId === unit.projectId && 
                    u.unitType === unit.unitType
                  )
                  .slice(0, 3)
                  .map(similarUnit => (
                    <div 
                      key={similarUnit.id}
                      onClick={() => router.push(`/units/${similarUnit.id}`)}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <Building className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Unit {similarUnit.unitNumber}</div>
                        <div className="text-sm text-gray-600">
                          {similarUnit.bedrooms} bed • {similarUnit.bathrooms} bath • {similarUnit.sqft} sq ft
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {formatPrice(similarUnit.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                
                {units?.filter(u => 
                  u.id !== unit.id && 
                  u.projectId === unit.projectId && 
                  u.unitType === unit.unitType
                ).length === 0 && (
                  <p className="text-gray-500 text-sm">No similar units available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Make This Your Home?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Don't miss out on this opportunity. Contact our sales team today to schedule a viewing or get more information about financing options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Schedule Viewing
            </button>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Get Financing Info
            </button>
            {/* {unit.status === 'AVAILABLE' && (
              <button className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
                Reserve Now
              </button>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

