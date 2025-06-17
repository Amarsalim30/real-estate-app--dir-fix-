'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import { Buyers } from '@/data/buyers';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/header';
import UnitStatusBadge from '@/components/units/UnitStatusBadge';
import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Building, 
  Calendar,
  Phone,
  Mail,
  Heart,
  Share2,
  Eye,
  CheckCircle,
  Star
} from 'lucide-react';

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const unit = Array.isArray(Units) ? Units.find(u => u.id === parseInt(params.unitId)) : null;
  const project = Array.isArray(Projects) ? Projects.find(p => p.id === parseInt(params.projectId)) : null;
  
  if (!unit || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
          <p className="text-gray-600 mb-6">The unit you're looking for doesn't exist or has been removed.</p>
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

  const reservedByBuyer = unit.reservedBy ? 
    (Array.isArray(Buyers) ? Buyers.find(b => b.id === unit.reservedBy) : null) : null;
  const soldToBuyer = unit.soldTo ? 
    (Array.isArray(Buyers) ? Buyers.find(b => b.id === unit.soldTo) : null) : null;

  const handleReserve = () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    setShowReserveModal(true);
  };

  const handlePurchase = () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    setShowPurchaseModal(true);
  };

  const canReserve = unit.status === 'available' && session?.user;
  const canPurchase = (unit.status === 'available' || unit.status === 'reserved') && session?.user;
  const isAdmin = session?.user?.role === ROLES.ADMIN;

  const unitImages = unit.images || [];
  const hasImages = unitImages.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-4 mb-8" aria-label="Breadcrumb">
          <button
            onClick={() => router.push('/projects')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Projects
          </button>
          <span className="text-gray-400">/</span>
          <button
            onClick={() => router.push(`/projects/${project.id}`)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {project.name}
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Unit {unit.unitNumber}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Unit Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="relative">
                {hasImages ? (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={unitImages[currentImageIndex]}
                      alt={`Unit ${unit.unitNumber} - Image ${currentImageIndex + 1}`}
                      className="w-full h-96 object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-unit.jpg';
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-100">
                    <Building className="w-24 h-24 text-gray-400" />
                  </div>
                )}
                
                {/* Image Navigation */}
                {unitImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-2">
                      {unitImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <UnitStatusBadge status={unit.status} />
                </div>
              </div>
              
              {/* Thumbnail Strip */}
              {unitImages.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex space-x-2 overflow-x-auto">
                    {unitImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                                                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-unit.jpg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Unit Details */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Unit {unit.unitNumber}
                  </h1>
                  <p className="text-gray-600 text-lg">{project.name} - Floor {unit.floor}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatPrice(unit.price)}
                  </div>
                  <div className="text-gray-600">
                    {formatPrice(Math.round(unit.price / unit.sqft))} per sq ft
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Bed className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Bath className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Square className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.sqft?.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{unit.floor}</div>
                  <div className="text-sm text-gray-600">Floor</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {unit.description || `Beautiful ${unit.bedrooms}-bedroom, ${unit.bathrooms}-bathroom unit located on the ${unit.floor}${unit.floor === 1 ? 'st' : unit.floor === 2 ? 'nd' : unit.floor === 3 ? 'rd' : 'th'} floor of ${project.name}. This spacious ${unit.sqft} sq ft unit offers modern living with premium finishes and stunning views.`}
                </p>
              </div>

              {/* Features */}
              {unit.features && unit.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {unit.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Floor Plan */}
              {unit.floorPlan && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Floor Plan</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <img
                      src={unit.floorPlan}
                      alt={`Unit ${unit.unitNumber} Floor Plan`}
                      className="w-full max-w-md mx-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Status Information for Admin */}
              {unit.status === 'reserved' && reservedByBuyer && isAdmin && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Reservation Information
                  </h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p><strong>Reserved by:</strong> {reservedByBuyer.firstName} {reservedByBuyer.lastName}</p>
                    <p><strong>Email:</strong> {reservedByBuyer.email}</p>
                    <p><strong>Phone:</strong> {reservedByBuyer.phone}</p>
                    <p><strong>Date:</strong> {unit.reservedDate?.toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {unit.status === 'sold' && soldToBuyer && isAdmin && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Sale Information
                  </h4>
                  <div className="text-sm text-green-800 space-y-2">
                    <p><strong>Sold to:</strong> {soldToBuyer.firstName} {soldToBuyer.lastName}</p>
                    <p><strong>Email:</strong> {soldToBuyer.email}</p>
                    <p><strong>Phone:</strong> {soldToBuyer.phone}</p>
                    <p><strong>Date:</strong> {unit.soldDate?.toLocaleDateString()}</p>
                    <p><strong>Sale Price:</strong> {formatPrice(unit.salePrice || unit.price)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPrice(unit.price)}
                </div>
                <div className="text-gray-600">
                  {formatPrice(Math.round(unit.price / unit.sqft))} per sq ft
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {canReserve && (
                  <button
                    onClick={handleReserve}
                    className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Reserve Unit
                  </button>
                )}
                
                {canPurchase && (
                  <button
                    onClick={handlePurchase}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Purchase Unit
                  </button>
                )}

                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Contact Agent
                </button>

                {!session?.user && (
                  <div className="text-center pt-4 border-t">
                    <p className="text-gray-600 mb-3 text-sm">Please log in to reserve or purchase</p>
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Log In
                    </button>
                  </div>
                )}

                {unit.status === 'sold' && (
                  <div className="text-center py-6 border-t">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <span className="text-green-600 font-medium">This unit has been sold</span>
                  </div>
                )}
              </div>
            </div>

            {/* Project Info Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-600 text-sm">Project:</span>
                  <div className="font-medium text-gray-900">{project.name}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Location:</span>
                  <div className="font-medium text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {project.location}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Developer:</span>
                  <div className="font-medium text-gray-900">{project.developer}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Completion:</span>
                  <div className="font-medium text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {project.expectedCompletion?.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Progress:</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.constructionProgress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {project.constructionProgress || 0}%
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => router.push(`/projects/${project.id}`)}
                className="w-full mt-6 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                View All Units in Project
              </button>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Call Us</div>
                    <div className="text-gray-600 text-sm">+1-555-REAL-EST</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Email Us</div>
                    <div className="text-gray-600 text-sm">info@realestate.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reserve Modal */}
        {showReserveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Reserve Unit {unit.unitNumber}</h3>
              <p className="text-gray-600 mb-6">
                You are about to reserve this unit. A reservation typically requires a deposit and will hold the unit for a specified period.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-bold text-gray-900">{formatPrice(unit.price)}</span>
                </div>
              </div>
                            <div className="flex space-x-3">
                <button
                  onClick={() => router.push(`/projects/${project.id}/units/${unit.id}/reserve`)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue to Reserve
                </button>
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Purchase Unit {unit.unitNumber}</h3>
              <p className="text-gray-600 mb-6">
                You are about to purchase this unit for {formatPrice(unit.price)}. This will begin the purchase process.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-bold text-gray-900">{formatPrice(unit.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Est. Taxes & Fees:</span>
                    <span className="font-medium text-gray-900">{formatPrice(unit.price * 0.08)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Estimate:</span>
                    <span className="font-bold text-gray-900">{formatPrice(unit.price * 1.08)}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push(`/projects/${project.id}/units/${unit.id}/purchase`)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue to Purchase
                </button>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Our Agent</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => window.open('tel:+1-555-REAL-EST')}>
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Call Now</div>
                    <div className="text-gray-600">+1-555-REAL-EST</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => window.open('mailto:info@realestate.com')}>
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Send Email</div>
                    <div className="text-gray-600">info@realestate.com</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full mt-6 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
