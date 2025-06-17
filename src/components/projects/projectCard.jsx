'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Units } from '@/data/units';
import { formatPrice } from '@/utils/format';
import { 
  MapPin, 
  Building, 
  Users, 
  Calendar, 
  TrendingUp,
  Eye,
  Heart,
  Share2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function ProjectCard({ project }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

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

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: project.name,
        text: project.description,
        url: `${window.location.origin}/projects/${project.id}`,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/projects/${project.id}`);
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

  const StatusIcon = getStatusIcon(project.status);

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        {!imageError && project.images && project.images.length > 0 ? (
          <img
            src={project.images[0]}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <Building className="w-16 h-16 text-blue-400" />
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleLike}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>

        {/* Progress Bar */}
        {project.status === 'under_construction' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-3">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>Construction Progress</span>
              <span>{project.constructionProgress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div 
                className="bg-white rounded-full h-1.5 transition-all duration-300"
                style={{ width: `${project.constructionProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{project.location}</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Price Range */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Price Range</span>
            <span className="text-lg font-bold text-gray-900">
              {minPrice > 0 && maxPrice > 0 ? (
                minPrice === maxPrice ? 
                  formatPrice(minPrice) : 
                  `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
              ) : (
                'Price on Request'
              )}
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Building className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-lg font-bold text-gray-900">{totalUnits}</span>
            </div>
            <span className="text-xs text-gray-600">Total Units</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-lg font-bold text-gray-900">{availableUnits}</span>
            </div>
            <span className="text-xs text-gray-600">Available</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-lg font-bold text-gray-900">{salesProgress.toFixed(0)}%</span>
            </div>
            <span className="text-xs text-gray-600">Sold</span>
          </div>
        </div>

        {/* Sales Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Sales Progress</span>
            <span className="font-medium text-gray-900">{soldUnits + reservedUnits}/{totalUnits}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 transition-all duration-300"
                style={{ width: `${totalUnits > 0 ? (soldUnits / totalUnits * 100) : 0}%` }}
              />
              <div 
                className="bg-yellow-500 transition-all duration-300"
                style={{ width: `${totalUnits > 0 ? (reservedUnits / totalUnits * 100) : 0}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Sold: {soldUnits}</span>
            <span>Reserved: {reservedUnits}</span>
            <span>Available: {availableUnits}</span>
          </div>
        </div>

        {/* Amenities */}
        {project.amenities && project.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {project.amenities.slice(0, 3).map((amenity, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {amenity}
                </span>
              ))}
              {project.amenities.length > 3 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                  +{project.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            <span>
              {project.status === 'completed' ? 'Completed' : 
               project.expectedCompletion ? 
                 `Est. ${new Date(project.expectedCompletion).getFullYear()}` : 
                 'TBD'}
            </span>
          </div>
          <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
