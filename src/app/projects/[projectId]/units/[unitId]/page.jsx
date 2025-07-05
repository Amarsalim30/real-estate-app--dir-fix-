'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/utils/format';

import { useBuyers } from '@/hooks/useBuyers';
import { useProjects } from '@/hooks/useProjects';
import { useUnits } from '@/hooks/useUnits';

import {
  ArrowLeft,
  Building,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  User,
  Phone,
  Mail,
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Download,
  Calculator,
  Award,
  Wrench,
  Home,
  Layers,
  TrendingUp
} from 'lucide-react';

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const { projects, loading: isLoading, error } = useProjects();
  const { buyers } = useBuyers();
  const { units } = useUnits();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const unit = useMemo(() => {
    if (!units || !Array.isArray(units) || !params?.unitId) return null;
    return units.find(u => u.id === parseInt(params.unitId));
  }, [units, params?.unitId]);

  const project = useMemo(() => {
    if (!projects || !Array.isArray(projects) || !params?.projectId) return null;
    return projects.find(p => p.id === parseInt(params.projectId));
  }, [projects, params?.projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!unit || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return CheckCircle;
      case 'RESERVED':
        return Clock;
      case 'SOLD':
        return AlertCircle;
      case 'UNDER_CONSTRUCTION':
        return Wrench;
      default:
        return Building;
    }
  };

  const getConstructionStageColor = (stage) => {
    switch (stage) {
      case 'FOUNDATION':
        return 'bg-orange-100 text-orange-800';
      case 'STRUCTURE':
        return 'bg-blue-100 text-blue-800';
      case 'ROOFING':
        return 'bg-purple-100 text-purple-800';
      case 'INTERIOR':
        return 'bg-indigo-100 text-indigo-800';
      case 'FINISHING':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800';
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

  const StatusIcon = getStatusIcon(unit.status);

  // Find buyer information - using the buyer relationship from the Unit model
  const buyer = unit?.buyer || null;

  const handleReserve = () => {
    if (!session?.user) {
      router.push(`/auth/login?redirect=/projects/${project.id}/units/${unit.id}/reserve`);
      return;
    }
    router.push(`/projects/${project.id}/units/${unit.id}/reserve`);
  };

  const handlePurchase = () => {
    if (!session) {
      router.push(`/auth/login?redirect=/projects/${project.id}/units/${unit.id}/purchase`);
    } else {
    router.push(`/projects/${project.id}/units/${unit.id}/purchase`);
    }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => router.push('/projects')}
            className="hover:text-gray-900 transition-colors"
          >
            Projects
          </button>
          <span>/</span>
          <button
            onClick={() => router.push(`/projects/${project.id}`)}
            className="hover:text-gray-900 transition-colors"
          >
            {project.name}
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Unit {unit.unitNumber}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="relative h-96">
                {unit.images && unit.images.length > 0 ? (
                  <img
                    src={`${apiBaseUrl}/images/${unit.images[activeImageIndex]}`}
                    alt={`Unit ${unit.unitNumber}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : 
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Building className="w-24 h-24 text-gray-400" />
                </div>
}
                {/* Status and Featured Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    {unit.status?.replace('_', ' ')}
                  </span>
                  {unit.isFeatured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 text-white">
                      <Award className="w-4 h-4 mr-2" />
                      Featured
                    </span>
                  )}
                  {unit.currentStage && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getConstructionStageColor(unit.currentStage)}`}>
                      <Wrench className="w-3 h-3 mr-1" />
                      {unit.currentStage?.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {unit.images && unit.images.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex space-x-2 overflow-x-auto">
                    {unit.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${activeImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                      >
                        <img
                          src={`${apiBaseUrl}/images/${image}`}
                          alt={`Unit ${unit.unitNumber} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Unit Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      Unit {unit.unitNumber}
                    </h1>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                      {getUnitTypeDisplay(unit.unitType)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    {project.name}, {project.subCounty}, {project.county}
                  </div>
                  <p className="text-gray-600 text-lg">{unit.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(unit.price)}
                  </div>
                  <div className="text-gray-600">
                    {formatPrice(Math.round(unit.price / unit.sqft))}/sq ft
                  </div>
                </div>
              </div>

              {/* Unit Specifications */}
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

              {/* Features */}
              {unit.features && unit.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.from(unit.features).map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Construction Information */}
              {unit.currentStage && (
                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Wrench className="w-5 h-5 mr-2 text-blue-600" />
                    Construction Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div>
                      <div className="text-sm text-gray-600 mb-1">Current Stage</div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConstructionStageColor(unit.currentStage)}`}>
                        {unit.currentStage?.replace('_', ' ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Unit Status</div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {unit.status?.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Buyer Information (if sold/reserved) */}
              {buyer && (unit.status === 'SOLD' || unit.status === 'RESERVED') && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {unit.status === 'SOLD' ? 'Sold To' : 'Reserved By'}
                  </h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {buyer.firstName} {buyer.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {buyer.email}
                      </div>
                      <div className="text-sm text-gray-600">
                        {unit.status === 'SOLD' ? 'Purchase Date' : 'Reservation Date'}: {' '}
                        {unit.status === 'SOLD' && unit.soldDate ?
                          new Date(unit.soldDate).toLocaleDateString() :
                          unit.reservedDate ? new Date(unit.reservedDate).toLocaleDateString() : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Information */}
              {unit.invoice && (
                <div className="bg-green-50 rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Invoice Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Invoice Number</div>
                      <div className="font-medium text-gray-900">#{unit.invoice.invoiceNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                      <div className="font-medium text-gray-900">{formatPrice(unit.invoice.totalAmount)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Status</div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        unit.invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        unit.invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {unit.invoice.status}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Due Date</div>
                      <div className="font-medium text-gray-900">
                        {unit.invoice.dueDate ? new Date(unit.invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floor Plan */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Floor Plan</h3>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Floor Plan</h4>
                  <p className="text-gray-600">Interactive floor plan coming soon</p>
                </div>
              </div>
            </div>

            {/* Unit Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Unit Timeline</h3>
              <div className="space-y-4">
                {unit.createdAt && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
                    <div>
                      <div className="font-medium text-gray-900">Unit Listed</div>
                      <div className="text-sm text-gray-600">
                        {new Date(unit.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
                {unit.reservedDate && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-4"></div>
                    <div>
                      <div className="font-medium text-gray-900">Unit Reserved</div>
                      <div className="text-sm text-gray-600">
                        {new Date(unit.reservedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
                {unit.soldDate && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                    <div>
                      <div className="font-medium text-gray-900">Unit Sold</div>
                      <div className="text-sm text-gray-600">
                        {new Date(unit.soldDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
                {unit.updatedAt && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-4"></div>
                    <div>
                      <div className="font-medium text-gray-900">Last Updated</div>
                      <div className="text-sm text-gray-600">
                        {new Date(unit.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6 top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPrice(unit.price)}
                </div>
                <div className="text-gray-600">
                  {formatPrice(Math.round(unit.price / unit.sqft))}/sq ft
                </div>
                <div className="text-sm text-blue-600 font-medium mt-2">
                  {getUnitTypeDisplay(unit.unitType)}
                </div>
              </div>

              {unit.status === 'AVAILABLE' && (
                <div className="space-y-3">
                  <button
                    onClick={handlePurchase}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Purchase Now
                  </button>
                  <button
                    onClick={handleReserve}
className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all shadow-sm"
                  >
                    Reserve Unit
                  </button>

                </div>
              )}

              {unit.status === 'RESERVED' && (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
                    <Clock className="w-4 h-4 mr-2" />
                    Reserved
                  </div>
                  <p className="text-gray-600 text-sm">
                    This unit is currently reserved. Contact us to be notified if it becomes available.
                  </p>
                  {unit.reservedDate && (
                    <p className="text-gray-500 text-xs mt-2">
                      Reserved on {new Date(unit.reservedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {unit.status === 'SOLD' && (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-4">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Sold
                  </div>
                  <p className="text-gray-600 text-sm">
                    This unit has been sold. Browse other available units in this project.
                  </p>
                  {unit.soldDate && (
                    <p className="text-gray-500 text-xs mt-2">
                      Sold on {new Date(unit.soldDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {unit.status === 'UNDER_CONSTRUCTION' && (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                    <Wrench className="w-4 h-4 mr-2" />
                    Under Construction
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    This unit is currently under construction.
                  </p>
                  {unit.currentStage && (
                    <div className="text-center mb-4">
                      <div className="text-sm text-gray-600 mb-1">Current Stage</div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConstructionStageColor(unit.currentStage)}`}>
                        {unit.currentStage?.replace('_', ' ')}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleReserve}
                    className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Reserve for Future
                  </button>
                </div>
              )}

              <div className="border-t pt-6 mt-6">
                <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center mb-3">
                  <Download className="w-5 h-5 mr-2" />
                  Download Brochure
                </button>
                <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Schedule Viewing
                </button>
              </div>
            </div>

            {/* Mortgage Calculator */}
            {showCalculator && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mortgage Calculator</h3>
                <MortgageCalculator unitPrice={unit.price} />
              </div>
            )}

            {/* Unit Highlights */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Highlights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Unit Type</span>
                  <span className="font-medium text-gray-900">{getUnitTypeDisplay(unit.unitType)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Floor</span>
                  <span className="font-medium text-gray-900">{unit.floor || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price per sq ft</span>
                  <span className="font-medium text-gray-900">{formatPrice(Math.round(unit.price / unit.sqft))}</span>
                </div>
                {unit.isFeatured && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Featured Unit</span>
                    <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      <Award className="w-3 h-3 mr-1" />
                      Yes
                    </span>
                  </div>
                )}
                {unit.currentStage && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Construction Stage</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConstructionStageColor(unit.currentStage)}`}>
                      {unit.currentStage?.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Sales Team</h3>
              <div className="space-y-4">
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
                    <div className="text-gray-600">sales@example.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About {project.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Developer</span>
                  <span className="font-medium text-gray-900">{project.developerName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-900">{project.subCounty}, {project.county}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status?.replace('_', ' ')}
                  </span>
                </div>
                {project.targetCompletionDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Target Completion</span>
                    <span className="font-medium text-gray-900">
                      {new Date(project.targetCompletionDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push(`/projects/${project.id}`)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View Project Details →
              </button>
            </div>

            {/* Similar Units */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Units</h3>
              <SimilarUnits currentUnit={unit} project={project} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Similar Units Component
const SimilarUnits = ({ currentUnit, project }) => {
  const { units } = useUnits();
  const router = useRouter();

  const similarUnits = useMemo(() => {
    if (!units || !Array.isArray(units)) return [];
    
    return units
      .filter(unit => 
        unit.projectId === project.id && 
        unit.id !== currentUnit.id &&
        (unit.unitType === currentUnit.unitType || 
         unit.bedrooms === currentUnit.bedrooms ||
         Math.abs(unit.price - currentUnit.price) < currentUnit.price * 0.2)
      )
      .slice(0, 3);
  }, [units, currentUnit, project]);

  if (similarUnits.length === 0) {
    return (
      <div className="text-center py-4">
        <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">No similar units found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {similarUnits.map(unit => (
        <div
          key={unit.id}
          onClick={() => router.push(`/projects/${project.id}/units/${unit.id}`)}
          className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-gray-900">Unit {unit.unitNumber}</div>
            <div className="text-sm font-bold text-gray-900">{formatPrice(unit.price)}</div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Bed className="w-3 h-3 mr-1" />
                {unit.bedrooms}
              </span>
              <span className="flex items-center">
                <Bath className="w-3 h-3 mr-1" />
                {unit.bathrooms}
              </span>
              <span className="flex items-center">
                <Square className="w-3 h-3 mr-1" />
                {unit.sqft}
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
              unit.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
              unit.status === 'SOLD' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {unit.status?.replace('_', ' ')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Mortgage Calculator Component
const MortgageCalculator = ({ unitPrice }) => {
  const [loanAmount, setLoanAmount] = useState(unitPrice * 0.8); // 80% LTV
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [downPayment, setDownPayment] = useState(unitPrice * 0.2);

  const calculateMonthlyPayment = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return monthlyPayment;
  };

  const monthlyPayment = calculateMonthlyPayment();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Home Price
        </label>
        <input
          type="text"
          value={formatPrice(unitPrice)}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Down Payment
        </label>
        <input
          type="number"
          value={downPayment}
          onChange={(e) => {
            const dp = parseFloat(e.target.value) || 0;
            setDownPayment(dp);
            setLoanAmount(unitPrice - dp);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="text-xs text-gray-500 mt-1">
          {((downPayment / unitPrice) * 100).toFixed(1)}% of home price
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interest Rate (%)
        </label>
        <input
          type="number"
          step="0.1"
          value={interestRate}
          onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loan Term (years)
        </label>
        <select
          value={loanTerm}
          onChange={(e) => setLoanTerm(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={15}>15 years</option>
          <option value={20}>20 years</option>
          <option value={25}>25 years</option>
          <option value={30}>30 years</option>
        </select>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Monthly Payment:</span>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(monthlyPayment)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          <span>Total Interest:</span>
          <span>{formatPrice((monthlyPayment * loanTerm * 12) - loanAmount)}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total Cost:</span>
          <span>{formatPrice((monthlyPayment * loanTerm * 12) + downPayment)}</span>
        </div>
      </div>
    </div>
  );
};

