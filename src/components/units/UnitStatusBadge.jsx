'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Units } from '@/data/units';
import { formatPrice } from '@/lib/format';

export default function ProjectCard({ project }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // Calculate project statistics
  const projectUnits = Units.filter(unit => unit.projectId === project.id);
  const soldUnits = projectUnits.filter(unit => unit.status === 'sold').length;
  const reservedUnits = projectUnits.filter(unit => unit.status === 'reserved').length;
  const availableUnits = projectUnits.filter(unit => unit.status === 'available').length;
  const totalUnits = projectUnits.length;
  
  const salesProgress = totalUnits > 0 ? ((soldUnits + reservedUnits) / totalUnits * 100) : 0;
  
  // Price range
  const prices = projectUnits.map(unit => unit.price).filter(price => price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const handleCardClick = () => {
    router.push(`/projects/${project.id}`);
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

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Project Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        {project.images && project.images.length > 0 && !imageError ? (
          <img
            src={project.images[0]}
            alt={project.name}
            className="w-full h-48 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl text-gray-400 mb-2">🏗️</div>
              <div className="text-gray-500 text-sm">No image available</div>
            </div>
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
            <p className="text-gray-600 text-sm">{project.location}</p>
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

        {/* Price Range */}
        {minPrice > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Price Range</div>
            <div className="font-semibold text-gray-900">
              {minPrice === maxPrice 
                ? formatPrice(minPrice)
                : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
              }
            </div>
          </div>
        )}

        {/* Unit Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{totalUnits}</div>
            <div className="text-xs text-gray-500">Total Units</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{soldUnits}</div>
            <div className="text-xs text-gray-500">Sold</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{availableUnits}</div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
        </div>

        {/* Sales Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Sales Progress</span>
            <span className="text-sm font-medium text-gray-900">{salesProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${salesProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Developer:</span>
            <span className="text-gray-900 font-medium">{project.developer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Completion:</span>
            <span className="text-gray-900 font-medium">
              {project.expectedCompletion.toLocaleDateString()}
            </span>
          </div>
          {project.constructionProgress !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-500">Construction:</span>
              <span className="text-gray-900 font-medium">{project.constructionProgress}%</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-full btn-primary"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
