"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { useCreateUnit } from '@/hooks/useUnits';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function NewUnitPage() {
  const router = useRouter();
  const { projects, loading } = useProjects();
  const { createUnit, isLoading: createLoading } = useCreateUnit();
  
  const [formData, setFormData] = useState({
    unitNumber: '',
    projectId: '',
    floor: '',
    type: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    price: '',
    status: 'AVAILABLE',
    description: '',
    features: '',
  });

  const [errors, setErrors] = useState({});

  if (loading || createLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors = {};

    if (!formData.unitNumber.trim()) {
      newErrors.unitNumber = 'Unit number is required';
    }
    if (!formData.projectId) {
      newErrors.projectId = 'Project selection is required';
    }
    if (!formData.floor || parseInt(formData.floor) < 1) {
      newErrors.floor = 'Valid floor number is required';
    }
    if (!formData.type) {
      newErrors.type = 'Unit type is required';
    }
    if (!formData.bedrooms || parseInt(formData.bedrooms) < 0) {
      newErrors.bedrooms = 'Valid number of bedrooms is required';
    }
    if (!formData.bathrooms || parseFloat(formData.bathrooms) < 1) {
      newErrors.bathrooms = 'Valid number of bathrooms is required';
    }
    if (!formData.sqft || parseInt(formData.sqft) < 1) {
      newErrors.sqft = 'Valid square footage is required';
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    toast.error('Please fix the form errors');
    return;
  }

  const unitData = {
    ...formData,
    projectId: parseInt(formData.projectId),
    floor: parseInt(formData.floor),
    bedrooms: parseInt(formData.bedrooms),
    bathrooms: parseFloat(formData.bathrooms),
    sqft: parseInt(formData.sqft),
    price: parseFloat(formData.price),
    features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
  };

  await createUnit(unitData, {
    onSuccess: (data) => {
      toast.success('Unit created successfully!');
      router.push(`/units`);
    },
    onError: (error) => {
      console.error('Error creating unit:', error);
      
      if (error.message?.includes('409') || error.message?.includes('Conflict')) {
        toast.error('Unit number already exists in this project. Please choose a different unit number.');
      } else {
        toast.error(error.message || 'Failed to create unit');
      }
    }
  });
};


  const selectedProject = projects?.find(p => p.id === parseInt(formData.projectId));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
                  <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to dashboard
          </button>
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">

          <Link href="/units" className="hover:text-blue-600">Units</Link>
          <span>/</span>
          <span className="text-gray-900">New Unit</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Unit</h1>
        <p className="text-gray-600">Add a new unit to your project inventory</p>
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
                    className={`placeholder-gray-500 text-gray-600 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.unitNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 101, A-201"
                  />
                  {errors.unitNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.unitNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project *
                  </label>
                  <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleInputChange}
                    className={`placeholder-gray-500 text-gray-600 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.projectId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Project</option>
                    {projects && Array.isArray(projects) && projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
                  )}
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
                    min="1"
                    className={`placeholder-gray-500 text-gray-600 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.floor ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1"
                  />
                  {errors.floor && (
                    <p className="mt-1 text-sm text-red-600">{errors.floor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`placeholder-gray-500 text-gray-600 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Type</option>
                    <option value="Studio">Studio</option>
                    <option value="ONE_BR">1 Bedroom</option>
                    <option value="TWO_BR">2 Bedroom</option>
                    <option value="THREE_BR">3 Bedroom</option>
                    <option value="FOUR_BR">4 Bedroom</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                  {errors.type && (
                    <p className="placeholder-gray-500 mt-1 text-sm text-red-600">{errors.type}</p>
                  )}
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
                    min="0"
                    className={`placeholder-gray-500 text-gray-600 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bedrooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="2"
                  />
                  {errors.bedrooms && (
                    <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>
                  )}
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
                    min="1"
                    step="0.5"
                    className={`placeholder-gray-500 text-gray-600 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="2"
                  />
                  {errors.bathrooms && (
                    <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>
                  )}
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
                    min="1"
                    className={`placeholder-gray-500 text-gray-600 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.sqft ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1200"
                  />
                  {errors.sqft && (
                    <p className="placeholder-gray-500 mt-1 text-sm text-red-600">{errors.sqft}</p>
                  )}
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
                    min="0"
                    step="1000"
                    className={`placeholder-gray-500 text-gray-600 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="500000"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
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
                    className="placeholder-gray-500 text-gray-600 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="placeholder-gray-500 text-gray-600 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="placeholder-gray-500 text-gray-600 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>
            </div>

            {/* Project Info */}
            {selectedProject && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Info</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <p className="text-gray-900">{selectedProject.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900">{selectedProject.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Developer</label>
                    <p className="text-gray-900">{selectedProject.developer}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedProject.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : selectedProject.status === 'under_construction'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedProject.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Price Calculator */}
            {formData.sqft && formData.price && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per sq ft:</span>
                    <span className="font-medium">
                      ${Math.round(parseFloat(formData.price) / parseInt(formData.sqft)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Price:</span>
                    <span className="font-bold text-lg">
                      ${parseFloat(formData.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-3">
                <button
  type="submit"
  disabled={createLoading}
  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
>
  {createLoading ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Creating...
    </>
  ) : (
    'Create Unit'
  )}
</button>


                <Link
                  href="/units"
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center block"
                >
                  Cancel
                </Link>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  * Required fields must be filled out before creating the unit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

                  