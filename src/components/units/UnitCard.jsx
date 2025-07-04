'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { Buyers } from '@/data/buyers';
import { useBuyers } from '@/hooks';
import { formatPrice } from '@/lib/format';
import UnitStatusBadge from './UnitStatusBadge';

export default function UnitCard({ unit, project, showActions = false, onReserve, onSell }) {
  const router = useRouter();
  const { buyers:Buyers, loading: buyersLoading, error: buyersError } = useBuyers();
    const [imageError, setImageError] = useState(false);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


  const handleCardClick = () => {
    router.push(`/projects/${project.id}/units/${unit.id}`);
  };

  const handleReserve = (e) => {
    e.stopPropagation();
    if (onReserve) {
      onReserve(unit);
    }
  };

  const handleSell = (e) => {
    e.stopPropagation();
    if (onSell) {
      onSell(unit);
    }
  };

  // Get buyer information if unit is reserved or sold
  const reservedByBuyer = unit.reservedBy ? Buyers.find(b => b.id === unit.reservedBy) : null;
  const soldToBuyer = unit.soldTo ? Buyers.find(b => b.id === unit.soldTo) : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
      {/* Unit Image */}
      <div 
        className="aspect-w-16 aspect-h-9 bg-gray-200 cursor-pointer"
        onClick={handleCardClick}
      >{console.log(`${apiBaseUrl}/images/${unit.images[0]}`)}

        {unit.images && unit.images.length > 0 && !imageError ? (
          
          <img
            src={`${apiBaseUrl}/images/${unit.images[0]}`}
            alt={`Unit ${unit.unitNumber}`}
            className="w-full h-32 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl text-gray-400 mb-1">🏠</div>
              <div className="text-gray-500 text-xs">Unit {unit.unitNumber}</div>
            </div>
          </div>
        )}
      </div>

      {/* Unit Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Unit {unit.unitNumber}</h4>
            <p className="text-gray-600 text-sm">Floor {unit.floor}</p>
          </div>
          <UnitStatusBadge status={unit.status} />
        </div>

        {/* Unit Specifications */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div>
            <div className="font-semibold text-gray-900">{unit.bedrooms}</div>
            <div className="text-xs text-gray-500">Beds</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{unit.bathrooms}</div>
            <div className="text-xs text-gray-500">Baths</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{unit.sqft.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Sq Ft</div>
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-lg font-bold text-gray-900">{formatPrice(unit.price)}</div>
          <div className="text-sm text-gray-500">
            {formatPrice(Math.round(unit.price / unit.sqft))} per sq ft
          </div>
        </div>

        {/* Buyer Information (for admin) */}
        {unit.status === 'reserved' && reservedByBuyer && showActions && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
            <div className="text-xs text-blue-800">
              <div className="font-medium">Reserved by:</div>
              <div>{reservedByBuyer.firstName} {reservedByBuyer.lastName}</div>
              <div>{reservedByBuyer.email}</div>
            </div>
          </div>
        )}

        {unit.status === 'sold' && soldToBuyer && showActions && (
          <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
            <div className="text-xs text-green-800">
              <div className="font-medium">Sold to:</div>
              <div>{soldToBuyer.firstName} {soldToBuyer.lastName}</div>
              <div>{soldToBuyer.email}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleCardClick}
            className="w-full btn-secondary text-sm"
          >
            View Details
          </button>

          {showActions && (
            <div className="grid grid-cols-2 gap-2">
              {unit.status === 'available' && (
                <>
                  <button
                    onClick={handleReserve}
                    className="btn-secondary text-xs"
                  >
                    Reserve
                  </button>
                  <button
                    onClick={handleSell}
                    className="btn-primary text-xs"
                  >
                    Sell
                  </button>
                </>
              )}
              
              {unit.status === 'reserved' && (
                <button
                  onClick={handleSell}
                  className="col-span-2 btn-primary text-xs"
                >
                  Complete Sale
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
