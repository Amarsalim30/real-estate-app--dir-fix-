"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateProject } from '@/hooks/useProjects';
import { toast } from 'sonner';
import {
  Building,
  MapPin,
  Calendar,
  User,
  DollarSign,
  Image as ImageIcon,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  ChartNoAxesCombined,
} from 'lucide-react';

const uploadImages = async (files) => {
  if (!files || files.length === 0) return [];

  const uploadFormData = new FormData();
  files.forEach(file => uploadFormData.append('files', file));

  const res = await fetch('http://localhost:8080/api/uploads', {
    method: 'POST',
    body: uploadFormData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Image upload failed: ${error}`);
  }

  const data = await res.json();
  return data.filenames || [];
};

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject, isLoading: createLoading } = useCreateProject();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coordinates: '',
    // location: '',
    address: '',
    city: '',
    state: '',
    // postalCode: '',
    developerName: '',
    status: 'PLANNING',
    startDate: '',
    targetCompletionDate: '',
    constructionProgress: 0,
    downPaymentPercentage: 10,
    amenities: '',
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
    if (!formData.coordinates.trim()) {
      newErrors.coordinates = 'Coordinates are required';
    } else {
      const coords = formData.coordinates.split(',').map(c => c.trim());
      if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        newErrors.coordinates = 'Please enter valid coordinates (latitude, longitude)';
      }
    }

    // Remove the location validation lines

    // if (!formData.postalCode.trim()) {
    //   newErrors.postalCode = 'ZIP code is required';
    // }
    if (!formData.developerName.trim()) {
      newErrors.developerName = 'Developer name is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (formData.status !== 'planning' && !formData.targetCompletionDate) {
      newErrors.targetCompletionDate = 'Target completion date is required';
    }
    if (formData.downPaymentPercentage < 1 || formData.downPaymentPercentage > 100) {
      newErrors.downPaymentPercentage = 'Down payment percentage must be between 1-100%';
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      setIsUploading(true);

      // Upload images first if any are selected
      let imageFilenames = [];
      if (formData.images && formData.images.length > 0) {
        toast.info('Uploading images...');
        imageFilenames = await uploadImages(formData.images);
      }

const projectData = {
  name: formData.name,
  description: formData.description,
  address: formData.address,
  subCounty: formData.city,
  county: formData.state,
  developerName: formData.developerName,
  status: formData.status,
  constructionProgress: parseInt(formData.constructionProgress) || 0,
  downPaymentPercentage: parseFloat(formData.downPaymentPercentage) / 100,
  amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : [],
  images: imageFilenames,
  startDate: new Date(formData.startDate),
  targetCompletionDate: formData.targetCompletionDate ? new Date(formData.targetCompletionDate) : null,
  // Parse coordinates and send as separate fields
  latitude: parseFloat(formData.coordinates.split(',')[0].trim()),
  longitude: parseFloat(formData.coordinates.split(',')[1].trim()),
  // Don't include the coordinates field in the payload
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
    } catch (error) {
      console.error('Error during project creation:', error);
      toast.error(error.message || 'Failed to upload images or create project');
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = createLoading || isUploading;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 sm:mb-6">
            <Link href="/projects" className="hover:text-blue-600 transition-colors">
              Projects
            </Link>
            <span>/</span>
            <span className="text-gray-900">New Project</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Create New Project
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Add a new real estate development project
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Building className="w-4 h-4" />
                <span>Real Estate Project</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Main Form */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Project Images
                    </h2>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Upload Project Images
                    </label>

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        name="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Click to upload images
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, GIF up to 10MB each
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {formData.images.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            Selected Images ({formData.images.length})
                          </h4>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, images: [] }))}
                            className="text-sm text-red-600 hover:text-red-700 transition-colors"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {formData.images.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <p className="text-xs text-gray-500 mt-2 truncate">
                                {file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Basic Information
                    </h2>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`text-gray-700 placeholder-gray-400  w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        placeholder="e.g., Skyline Tower Residences"
                      />
                      {errors.name && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.name}</p>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`text-gray-700 placeholder-gray-400  w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        placeholder="Describe your project, its unique features, target market, and key selling points..."
                      />
                      {errors.description && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.description}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Developer Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="developerName"
                          value={formData.developerName}
                          onChange={handleInputChange}
                          className={`text-gray-700 placeholder-gray-400  w-full border rounded-lg pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.developerName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          placeholder="e.g., Premium Developments LLC"
                        />
                      </div>
                      {errors.developerName && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.developerName}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Down Payment Percentage *
                      </label>
                      <div className="relative">
                        <ChartNoAxesCombined className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          name="downPaymentPercentage"
                          value={formData.downPaymentPercentage}
                          onChange={handleInputChange}
                          min="1"
                          max="100"
                          className={`text-gray-700 placeholder-gray-400  w-full border rounded-lg pl-10 pr-8 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.downPaymentPercentage ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          placeholder="10"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                      {errors.downPaymentPercentage && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.downPaymentPercentage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Location Information
                    </h2>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coordinates (Latitude, Longitude) *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="coordinates"
                          value={formData.coordinates}
                          onChange={handleInputChange}
                          className={`text-gray-700 placeholder-gray-400  w-full border rounded-lg pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.coordinates ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                          placeholder="-1.2921, 36.8219"
                        />
                      </div>
                      {errors.coordinates && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.coordinates}</p>
                        </div>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Enter coordinates as: latitude, longitude (e.g., -1.2921, 36.8219)
                      </p>
                    </div>


                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`text-gray-700 placeholder-gray-400  w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        placeholder="123 Main Street, Building Name"
                      />
                      {errors.address && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.address}</p>
                        </div>
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
                        className={`text-gray-700 placeholder-gray-400  w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        placeholder="Nairobi"
                      />
                      {errors.city && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.city}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/County *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`text-gray-700 placeholder-gray-400  w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                      >
                        <option value="">Select State/County</option>
                        <option value="Nairobi">Nairobi</option>
                        <option value="Mombasa">Mombasa</option>
                        <option value="Kiambu">Kiambu</option>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Machakos">Machakos</option>
                        <option value="Kajiado">Kajiado</option>
                        <option value="Kisumu">Kisumu</option>
                        <option value="Uasin Gishu">Uasin Gishu</option>
                        <option value="Kilifi">Kilifi</option>
                        <option value="Nyeri">Nyeri</option>
                      </select>
                      {errors.state && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.state}</p>
                        </div>
                      )}
                    </div>

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="00100"
                      />
                      {errors.postalCode && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.postalCode}</p>
                        </div>
                      )}
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Project Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Project Timeline
                    </h2>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className={`text-gray-700 placeholder-gray-400  w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                      />
                      {errors.startDate && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.startDate}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Completion Date
                      </label>
                      <input
                        type="date"
                        name="targetCompletionDate"
                        value={formData.targetCompletionDate}
                        onChange={handleInputChange}
                        className={`text-gray-700 placeholder-gray-400  w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.targetCompletionDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                      />
                      {errors.targetCompletionDate && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.targetCompletionDate}</p>
                        </div>
                      )}
                    </div>

                    {formData.status === 'under_construction' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Construction Progress (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="constructionProgress"
                            value={formData.constructionProgress}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            className="text-gray-700 placeholder-gray-400  w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 pr-8 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timeline Preview */}
                  {formData.startDate && formData.targetCompletionDate && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Timeline Preview</h4>
                      <div className="text-sm text-blue-800">
                        <p>Duration: {Math.ceil((new Date(formData.targetCompletionDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24 * 30))} months</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Amenities & Features
                    </h2>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Amenities
                    </label>
                    <textarea
                      name="amenities"
                      value={formData.amenities}
                      onChange={handleInputChange}
                      rows={4}
                      className="text-gray-700 placeholder-gray-400  w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Swimming Pool, Gym, Parking, 24/7 Security, Playground, Community Hall, Backup Generator"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Separate multiple amenities with commas
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Images */}

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden top-4">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">Project Status</h3>
                </div>

                <div className="p-4 sm:p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Status *
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'PLANNING', label: 'Planning', color: 'yellow', desc: 'Project is in planning phase' },
                        { value: 'UNDER_CONSTRUCTION', label: 'Under Construction', color: 'blue', desc: 'Currently being built' },
                        { value: 'COMPLETED', label: 'Completed', color: 'green', desc: 'Construction finished' }
                      ].map((status) => (
                        <label key={status.value} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value={status.value}
                            checked={formData.status === status.value}
                            onChange={handleInputChange}
                            className="mt-1 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${status.color === 'yellow' ? 'bg-yellow-400' :
                                  status.color === 'blue' ? 'bg-blue-400' : 'bg-green-400'
                                }`}></span>
                              <span className="text-sm font-medium text-gray-900">
                                {status.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{status.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.status && (
                      <div className="mt-2 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-sm text-red-600">{errors.status}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Summary */}
              {(formData.name || formData.location || formData.developerName) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Project Summary</h3>
                  </div>

                  <div className="p-4 sm:p-6 space-y-4">
                    {formData.name && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Project Name
                        </label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{formData.name}</p>
                      </div>
                    )}

                    {formData.location && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Location
                        </label>
                        <p className="text-sm text-gray-900 mt-1">{formData.location}</p>
                      </div>
                    )}

                    {formData.developerName && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Developer
                        </label>
                        <p className="text-sm text-gray-900 mt-1">{formData.developerName}</p>
                      </div>
                    )}

                    {formData.downPaymentPercentage && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Down Payment
                        </label>
                        <p className="text-sm text-gray-900 mt-1">{formData.downPaymentPercentage}%</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${formData.status === 'completed'
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                  </div>

                  <div className="p-4 sm:p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Start Date:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(formData.startDate).toLocaleDateString()}
                      </span>
                    </div>

                    {formData.targetCompletionDate && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Target Completion:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(formData.targetCompletionDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-sm text-gray-600">Duration:</span>
                          <span className="text-sm font-medium text-blue-600">
                            {Math.ceil((new Date(formData.targetCompletionDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24 * 30))} months
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6 space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isUploading ? 'Uploading Images...' : 'Creating Project...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </button>

                  <Link
                    href="/projects"
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center block font-medium transition-colors"
                  >
                    Cancel
                  </Link>
                </div>

                <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">
                      Fields marked with * are required. Make sure all information is accurate before creating the project.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
