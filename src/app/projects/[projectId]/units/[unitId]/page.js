'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import { Buyers } from '@/data/buyers';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/header';
import UnitStatusBadge from '@/components/units/UnitStatusBadge';
import { formatPrice } from '@/utils/formatPrice';
import { ROLES } from '@/lib/roles';

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const unit = Units.find(u => u.id === parseInt(params.unitId));
  const project = Projects.find(p => p.id === parseInt(params.projectId));
  
  if (!unit || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
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

  const reservedByBuyer = unit.reservedBy ? Buyers.find(b => b.id === unit.reservedBy) : null;
  const soldToBuyer = unit.soldTo ? Buyers.find(b => b.id === unit.soldTo) : null;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <button
                onClick={() => router.push('/projects')}
                className="text-gray-500 hover:text-gray-700"
              >
                Projects
              </button>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <button
                onClick={() => router.push(`/projects/${project.id}`)}
                className="text-gray-500 hover:text-gray-700"
              >
                {project.name}
              </button>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium">Unit {unit.unitNumber}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Unit Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {unit.images && unit.images.length > 0 ? (
                  <img
                    src={unit.images[0]}
                    alt={`Unit ${unit.unitNumber}`}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-unit.jpg';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              
              {/* Unit Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Unit {unit.unitNumber}
                    </h1>
                    <p className="text-gray-600">{project.name} - Floor {unit.floor}</p>
                  </div>
                  <UnitStatusBadge status={unit.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{unit.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{unit.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{unit.sqft.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{unit.floor}</div>
                    <div className="text-sm text-gray-600">Floor</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600">{unit.description}</p>
                </div>

                {unit.features && unit.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {unit.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-600 rounded-full" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Information */}
                {unit.status === 'reserved' && reservedByBuyer && isAdmin && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-900 mb-2">Reserved Information</h4>
                    <div className="text-sm text-blue-800">
                      <p>Reserved by: {reservedByBuyer.firstName} {reservedByBuyer.lastName}</p>
                      <p>Email: {reservedByBuyer.email}</p>
                      <p>Date: {unit.reservedDate?.toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {unit.status === 'sold' && soldToBuyer && isAdmin && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-green-900 mb-2">Sale Information</h4>
                    <div className="text-sm text-green-800">
                      <p>Sold to: {soldToBuyer.firstName} {soldToBuyer.lastName}</p>
                      <p>Email: {soldToBuyer.email}</p>
                      <p>Date: {unit.soldDate?.toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
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
                    className="w-full btn-secondary"
                  >
                    Reserve Unit
                  </button>
                )}
                
                {canPurchase && (
                  <button
                    onClick={handlePurchase}
                    className="w-full btn-primary"
                  >
                    Purchase Unit
                  </button>
                )}

                {!session?.user && (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">Please log in to reserve or purchase</p>
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full btn-primary"
                    >
                      Log In
                    </button>
                  </div>
                )}

                {unit.status === 'sold' && (
                  <div className="text-center py-4">
                    <span className="text-red-600 font-medium">This unit has been sold</span>
                  </div>
                )}
              </div>
            </div>

            {/* Project Info Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Project:</span>
                  <span className="ml-2 font-medium">{project.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 font-medium">{project.location}</span>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2 font-medium">{project.address}</span>
                </div>
                <div>
                  <span className="text-gray-600">Developer:</span>
                  <span className="ml-2 font-medium">{project.developer}</span>
                </div>
                <div>
                  <span className="text-gray-600">Completion:</span>
                  <span className="ml-2 font-medium">{project.expectedCompletion.toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Progress:</span>
                  <span className="ml-2 font-medium">{project.constructionProgress}%</span>
                </div>
              </div>
              
              <button
                onClick={() => router.push(`/projects/${project.id}`)}
                className="w-full mt-4 btn-secondary"
              >
                View All Units in Project
              </button>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-sm">📞</span>
                  </div>
                  <div>
                    <div className="font-medium">Call Us</div>
                    <div className="text-gray-600 text-sm">+1-555-REAL-EST</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-sm">✉️</span>
                  </div>
                  <div>
                    <div className="font-medium">Email Us</div>
                    <div className="text-gray-600 text-sm">info@realestate.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>




    </div>
  );
}
