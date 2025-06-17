import React from 'react';
import PropTypes from 'prop-types';
import { MapPin, Bed, Bath, Square, Calendar, Edit, Trash2, Heart, MapPinHouse } from 'lucide-react';

const PropertyCard = ({
  property,
  edit,
  deleteProperty,
  visit,
  Cardclick }) => {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200" onClick={Cardclick}>
      {/* Image Section */}
      <div className="h-48 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110 "
        />
      </div>

      {/* Status Badge */}
      <div className="px-4 pt-3">
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${property.status === 'AVAILABLE'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {property.status}
        </span>
      </div>

      {/* Main Content Section */}
      <div className="px-4 py-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-gray-900">{property.title}</h3>
          <p className="text-lg font-bold text-blue-600">${property.price.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-1 mb-3">
          <MapPin size={16} className="text-gray-500"/>
        <p className="text-sm text-gray-600 ">{property.address}</p>
          </div>
                  {/* Property Features */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs border-t border-gray-100 pt-3">
          <div className='flex flex-col items-center space-y-1'>
            <p className="text-gray-500">{property.beds} Beds</p>
            <Bed size={18} className="text-gray-500"/>
          </div>
          <div className='flex flex-col items-center space-y-1'>
            <p className="text-gray-500">{property.baths} Baths</p>
                        <Bath size={18} className="text-gray-500"/>

          </div>
          <div className='flex flex-col items-center space-y-1'>
            <p className="text-gray-500">{property.sqft.toLocaleString()} Sqft</p>
            <Square size={18} className='text-gray-500'/>
          </div>
          <div>
            <p className="font-bold text-gray-900">{property.category}</p>
            <p className="text-gray-500"></p>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 mb-4">{property.description}</p>
          
        <div>{edit}</div>
        <div>{deleteProperty}</div>
        <div>{visit}</div>
      </div>
    </div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    address: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    beds: PropTypes.number.isRequired,
    baths: PropTypes.number.isRequired,
    sqft: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired
};

export default PropertyCard;