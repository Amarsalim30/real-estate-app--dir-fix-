"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateProject } from '@/hooks/useProjects';
import { toast } from 'sonner';

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject, isLoading: createLoading } = useCreateProject();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    developer: '',
    status: 'planning',
    startDate: '',
    expectedCompletion: '',
    constructionProgress: 0,
    amenities: '',
    images: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }
    if (!formData.developer.trim()) {
      newErrors.developer = 'Developer is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (formData.status !== 'planning' && !formData.expectedCompletion) {
      newErrors.expectedCompletion = 'Expected completion date is required';
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

    const projectData = {
      ...formData,
      constructionProgress: parseInt(formData.constructionProgress) || 0,
      amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : [],
      images: formData.images ? formData.images.split(',').map(img => img.trim()) : [],
      startDate: new Date(formData.startDate),
      expectedCompletion: formData.expectedCompletion ? new Date(formData.expectedCompletion) : null,
    };

    await createProject(projectData, {
      onSuccess: (data) => {
        toast.success('Project created successfully!');
        router.push(`/projects`);
      },
      onError: (error) => {
        console.error('Error creating project:', error);
        
        if (error.message?.includes('409') || error.message?.includes('Conflict')) {
          toast.error('Project name already exists. Please choose a different name.');
        } else {
          toast.error(error.message || 'Failed to create project');
        }
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/projects" className="hover:text-blue-600">Projects</Link>
          <span>/</span>
          <span className="text-gray-900">New Project</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
        <p className="text-gray-600">Add a new real estate development project</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Skyline Tower"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter project description..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Developer *
                  </label>
                  <input
                    type="text"
                    name="developer"
                    value={formData.developer}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.developer ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Premium Developments LLC"
                  />
                  {errors.developer && (
                    <p className="mt-1 text-sm text-red-600">{errors.developer}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Downtown Manhattan"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select State</option>
                    <option value="NY">New York</option>
                    <option value="CA">California</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    <option value="IL">Illinois</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="OH">Ohio</option>
                    <option value="GA">Georgia</option>
                    <option value="NC">North Carolina</option>
                    <option value="MI">Michigan</option>
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10001"
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Timeline</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Completion
                  </label>
                  <input
                    type="date"
                    name="expectedCompletion"
                    value={formData.expectedCompletion}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.expectedCompletion ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.expectedCompletion && (
                    <p className="mt-1 text-sm text-red-600">{errors.expectedCompletion}</p>
                  )}
                </div>

                {formData.status === 'under_construction' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Construction Progress (%)
                    </label>
                    <input
                      type="number"
                      name="constructionProgress"
                      value={formData.constructionProgress}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
            </div>
                        {/* Amenities and Images */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities & Images</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <textarea
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amenities separated by commas (e.g., Swimming Pool, Gym, Parking, Concierge)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate multiple amenities with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URLs
                  </label>
                  <textarea
                    name="images"
                    value={formData.images}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter image URLs separated by commas"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate multiple image URLs with commas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="planning">Planning</option>
                  <option value="under_construction">Under Construction</option>
                  <option value="completed">Completed</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
              </div>

              {/* Status Description */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  {formData.status === 'planning' && (
                    <div>
                      <span className="font-medium text-yellow-800">Planning Phase</span>
                      <p className="text-gray-600 mt-1">Project is in the planning and design phase</p>
                    </div>
                  )}
                  {formData.status === 'under_construction' && (
                    <div>
                      <span className="font-medium text-blue-800">Under Construction</span>
                      <p className="text-gray-600 mt-1">Project is currently being built</p>
                    </div>
                  )}
                  {formData.status === 'completed' && (
                    <div>
                      <span className="font-medium text-green-800">Completed</span>
                      <p className="text-gray-600 mt-1">Project construction is finished</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Project Summary */}
            {formData.name && formData.location && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Summary</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <p className="text-gray-900">{formData.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900">{formData.location}</p>
                  </div>
                  {formData.developer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Developer</label>
                      <p className="text-gray-900">{formData.developer}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      formData.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : formData.status === 'under_construction'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formData.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Preview */}
            {formData.startDate && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">
                      {new Date(formData.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  {formData.expectedCompletion && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Completion:</span>
                      <span className="font-medium">
                        {new Date(formData.expectedCompletion).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {formData.startDate && formData.expectedCompletion && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {Math.ceil((new Date(formData.expectedCompletion) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24 * 30))} months
                      </span>
                    </div>
                  )}
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
                    'Create Project'
                  )}
                </button>

                <Link
                  href="/projects"
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center block"
                >
                  Cancel
                </Link>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  * Required fields must be filled out before creating the project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

