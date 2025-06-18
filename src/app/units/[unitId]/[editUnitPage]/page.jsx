"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Units } from '@/data/units';
import { Projects } from '@/data/projects';

export default function EditUnitPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = parseInt(params.id);
  
  const unit = Units.find(u => u.id === unitId);
  
  const [formData, setFormData] = useState({
    unitNumber: unit?.unitNumber || '',
    projectId: unit?.projectId || '',
    floor: unit?.floor || '',
    type: unit?.type || '',
    bedrooms: unit?.bedrooms || '',
    bathrooms: unit?.bathrooms || '',
    sqft: unit?.sqft || '',
    price: unit?.price || '',
    status: unit?.status || 'available',
    description: unit?.description || '',
    features: unit?.features?.join(', ') || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!unit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
          <p className="text-gray-600 mb-4">The unit you're trying to edit doesn't exist.</p>
          <Link href="/units" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Back to Units
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Updated unit data:', {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        price: parseFloat(formData.price),
        sqft: parseInt(formData.sqft),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        floor: parseInt(formData.floor),
        projectId: parseInt(formData.projectId)
      });
      
      setIsSubmitting(false);
      router.push(`/units/${unitId}`);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/units" className="hover:text-blue-600">Units</Link>
          <span>/</span>
          <Link href={`/units/${unitId}`} className="hover:text-blue-600">Unit {unit.unitNumber}</Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Edit Unit {unit.unitNumber}
        </h1>
        <p className="text-gray-600">Update unit information and details</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Number *
                  </label>
                  <input
                    type="text"
                    name="unitNumber"
                    value={formData.unitNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project *
                  </label>
                  <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Project</option>
                    {Projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor *
                  </label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Studio">Studio</option>
                    <option value="1BR">1 Bedroom</option>
                    <option value="2BR">2 Bedroom</option>
                    <option value="3BR">3 Bedroom</option>
                    <option value="4BR">4 Bedroom</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.5"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Square Feet *
                  </label>
                  <input
                    type="number"
                    name="sqft"
                    value={formData.sqft}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="1000"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Description and Features */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description & Features</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter unit description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter features separated by commas (e.g., Balcony, Hardwood Floors, Stainless Appliances)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate multiple features with commas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                
                <Link
                  href={`/units/${unitId}`}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors text-center block"
                >
                  Cancel
                </Link>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price/sq ft:</span>
                  <span className="font-medium">
                    {formData.price && formData.sqft ? 
                      `$${Math.round(formData.price / formData.sqft).toLocaleString()}` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="font-medium">
                    {formData.price ? 
                      `$${parseInt(formData.price).toLocaleString()}` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">
                    {formData.sqft ? `${parseInt(formData.sqft).toLocaleString()} sq ft` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Layout:</span>
                  <span className="font-medium">
                    {formData.bedrooms && formData.bathrooms ? 
                      `${formData.bedrooms}BR/${formData.bathrooms}BA` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

