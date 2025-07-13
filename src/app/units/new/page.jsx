"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { useUnits } from '@/hooks/useUnits';
import { useCreateUnit } from '@/hooks/useUnits';
import { toast } from 'sonner';
import {
  Building,
  Home,
  Layers,
  Bed,
  Bath,
  Ruler,
  DollarSign,
  Image as ImageIcon,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowLeft,
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

export default function NewUnitPage() {
  const router = useRouter();
  const { projects, loading } = useProjects();
  const { createUnit, isLoading: createLoading } = useCreateUnit();
  const { units } =useUnits(); 


  const [formData, setFormData] = useState({
    projectId: '',
    unitNumber: '',
    floor: '',
    constructionStage: 'PLANNING',
    unitType: '',
    bedrooms: '',
    bathrooms: '',
    isFeatured: false,
    sqft: '',
    price: '',
    status: 'AVAILABLE',
    description: '',
    features: '',
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectId) {
      newErrors.projectId = 'Project selection is required';
    }
    if (!formData.unitNumber.trim()) {
      newErrors.unitNumber = 'Unit number is required';
    }
    if (!formData.floor || parseInt(formData.floor) < 1) {
      newErrors.floor = 'Valid floor number is required';
    }
    if (!formData.unitType) {
      newErrors.unitType = 'Unit type is required';
    }
    if (!formData.bedrooms || parseInt(formData.bedrooms) < 0) {
      newErrors.bedrooms = 'Valid number of bedrooms is required';
    }
    if (!formData.bathrooms || parseInt(formData.bathrooms) < 1) {
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
  const { name, value, type, checked } = e.target;

  // Bedroom defaults based on unit type
  const unitTypeToBedrooms = {
    STUDIO: 0,
    ONE_BEDROOM: 1,
    TWO_BEDROOM: 2,
    THREE_BEDROOM: 3,
    FOUR_BEDROOM: 4,
    PENTHOUSE: 5
  };

  setFormData(prev => {
    // When unitType changes, also set bedrooms automatically
    if (name === 'unitType') {
      return {
        ...prev,
        unitType: value,
        bedrooms: unitTypeToBedrooms[value] ?? prev.bedrooms
      };
    }

    return {
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    };
  });

  // Clear error if any
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

  // 🛑 Check for duplicate unit number
  const isDuplicateUnitNumber = units?.some(
    unit =>
      unit.unitNumber.trim().toLowerCase() === formData.unitNumber.trim().toLowerCase() &&
      unit.projectId === parseInt(formData.projectId)
  );

  if (isDuplicateUnitNumber) {
    toast.error('This unit number already exists in the selected project.');
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

      const unitData = {
        projectId: parseInt(formData.projectId),
        unitNumber: formData.unitNumber,
        floor: parseInt(formData.floor),
        constructionStage: formData.constructionStage,
        unitType: formData.unitType,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        isFeatured: formData.isFeatured,
        sqft: parseInt(formData.sqft),
        price: parseFloat(formData.price),
        status: formData.status,
        description: formData.description,
        features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
        images: imageFilenames,
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
    } catch (error) {
      console.error('Error during unit creation:', error);
      toast.error(error.message || 'Failed to upload images or create unit');
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = createLoading || isUploading;
  const selectedProject = projects?.find(p => p.id === parseInt(formData.projectId));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to dashboard
          </button>

          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 sm:mb-6">
            <Link href="/units" className="hover:text-blue-600 transition-colors">
              Units
            </Link>
            <span>/</span>
            <span className="text-gray-900">New Unit</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Create New Unit
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Add a new unit to your project inventory
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Home className="w-4 h-4" />
                <span>Property Unit</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Main Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Unit Images */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Unit Images
                    </h2>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Upload Unit Images
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project *
                      </label>
                      <select
                        name="projectId"
                        value={formData.projectId}
                        onChange={handleInputChange}
                        className={`text-gray-700 placeholder-gray-400 w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.projectId ? 'border-red-500 bg-red-50' : 'border-gray-300'
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
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />

                          <p className="text-sm text-red-600">{errors.projectId}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Number *
                      </label>
                      <input
                        type="text"
                        name="unitNumber"
                        value={formData.unitNumber}
                        onChange={handleInputChange}
                        className={`text-gray-700 placeholder-gray-400 w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.unitNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 101, A-201"
                      />
                      {errors.unitNumber && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.unitNumber}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Floor *
                      </label>
                      <div className="relative">
                        <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          name="floor"
                          value={formData.floor}
                          onChange={handleInputChange}
                          min="1"
                          className={`text-gray-700 placeholder-gray-400 w-full border rounded-lg pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.floor ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="1"
                        />
                      </div>
                      {errors.floor && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.floor}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Type *
                      </label>
                      <select
                        name="unitType"
                        value={formData.unitType}
                        onChange={handleInputChange}
                        className={`text-gray-700 placeholder-gray-400 w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.unitType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Type</option>
                        <option value="STUDIO">Studio</option>
                        <option value="ONE_BEDROOM">1 Bedroom</option>
                        <option value="TWO_BEDROOM">2 Bedroom</option>
                        <option value="THREE_BEDROOM">3 Bedroom</option>
                        <option value="FOUR_BEDROOM">4 Bedroom</option>
                        <option value="PENTHOUSE">Penthouse</option>
                      </select>
                      {errors.unitType && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.unitType}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bedrooms *
                      </label>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleInputChange}
                          min="0"
                          className={`text-gray-700 placeholder-gray-400 w-full border rounded-lg pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.bedrooms ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="2"
                        />
                      </div>
                      {errors.bedrooms && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.bedrooms}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bathrooms *
                      </label>
                      <div className="relative">
                        <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleInputChange}
                          min="1"
                          className={`text-gray-700 placeholder-gray-400 w-full border rounded-lg pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.bathrooms ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="2"
                        />
                      </div>
                      {errors.bathrooms && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.bathrooms}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Square Feet *
                      </label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          name="sqft"
                          value={formData.sqft}
                          onChange={handleInputChange}
                          min="1"
                          className={`text-gray-700 placeholder-gray-400 w-full border rounded-lg pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.sqft ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="1200"
                        />
                      </div>
                      {errors.sqft && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.sqft}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          className={`text-gray-700 placeholder-gray-400 w-full border rounded-lg pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="500000"
                        />
                      </div>
                      {errors.price && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <p className="text-sm text-red-600">{errors.price}</p>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="text-gray-700 placeholder-gray-400 w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Describe the unit's unique features, layout, and selling points..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Construction Stage */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ChartNoAxesCombined className="w-4 h-4 text-purple-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Construction Stage
                    </h2>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Construction Stage
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'PLANNING', label: 'Planning', color: 'yellow', desc: 'Unit is in planning phase' },
                        { value: 'FOUNDATION', label: 'Foundation', color: 'orange', desc: 'Foundation work in progress' },
                        { value: 'STRUCTURE', label: 'Structure', color: 'blue', desc: 'Structural work ongoing' },
                        { value: 'FINISHING', label: 'Finishing', color: 'purple', desc: 'Interior finishing work' },
                        { value: 'COMPLETED', label: 'Completed', color: 'green', desc: 'Unit construction finished' }
                      ].map((stage) => (
                        <label key={stage.value} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="constructionStage"
                            value={stage.value}
                            checked={formData.constructionStage === stage.value}
                            onChange={handleInputChange}
                            className="mt-1 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                stage.color === 'yellow' ? 'bg-yellow-400' :
                                stage.color === 'orange' ? 'bg-orange-400' :
                                stage.color === 'blue' ? 'bg-blue-400' :
                                stage.color === 'purple' ? 'bg-purple-400' : 'bg-green-400'
                              }`}></span>
                              <span className="text-sm font-medium text-gray-900">
                                {stage.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{stage.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Unit Features
                    </h2>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Features
                    </label>
                    <textarea
                        name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      rows={4}
                      className="text-gray-700 placeholder-gray-400 w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Balcony, Hardwood Floors, Stainless Appliances, Walk-in Closet, City View"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Separate multiple features with commas
                    </p>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">
                          Mark as Featured Unit
                        </span>
                      </div>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Featured units will be highlighted in listings and search results
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Unit Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">Unit Status</h3>
                </div>

                <div className="p-4 sm:p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Status
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'AVAILABLE', label: 'Available', color: 'green', desc: 'Ready for sale' },
                        { value: 'RESERVED', label: 'Reserved', color: 'yellow', desc: 'Reserved by a client' },
                        { value: 'SOLD', label: 'Sold', color: 'blue', desc: 'Unit has been sold' }
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
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                status.color === 'green' ? 'bg-green-400' :
                                status.color === 'yellow' ? 'bg-yellow-400' : 'bg-blue-400'
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
                  </div>
                </div>
              </div>

              {/* Project Info */}
              {selectedProject && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Project Info</h3>
                  </div>

                  <div className="p-4 sm:p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Project Name
                      </label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{selectedProject.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Location
                      </label>
                      <p className="text-sm text-gray-900 mt-1">{selectedProject.address || `${selectedProject.county}, ${selectedProject.state}`}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Developer
                      </label>
                      <p className="text-sm text-gray-900 mt-1">{selectedProject.developerName}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        selectedProject.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : selectedProject.status === 'UNDER_CONSTRUCTION'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedProject.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Unit Summary */}
              {(formData.unitNumber || formData.unitType || formData.price) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Unit Summary</h3>
                  </div>

                  <div className="p-4 sm:p-6 space-y-4">
                    {formData.unitNumber && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Unit Number
                        </label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{formData.unitNumber}</p>
                      </div>
                    )}

                    {formData.unitType && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Type
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formData.unitType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                    )}

                    {(formData.bedrooms || formData.bathrooms) && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Layout
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formData.bedrooms && `${formData.bedrooms} bed`}
                          {formData.bedrooms && formData.bathrooms && ', '}
                          {formData.bathrooms && `${formData.bathrooms} bath`}
                        </p>
                      </div>
                    )}

                    {formData.sqft && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Square Feet
                        </label>
                        <p className="text-sm text-gray-900 mt-1">{parseInt(formData.sqft).toLocaleString()} sq ft</p>
                      </div>
                    )}

                    {formData.price && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Price
                        </label>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          Ksh {parseFloat(formData.price).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        formData.status === 'SOLD' 
                          ? 'bg-blue-100 text-blue-800'
                          : formData.status === 'RESERVED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {formData.status}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Construction Stage
                      </label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        formData.constructionStage === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : formData.constructionStage === 'FINISHING'
                          ? 'bg-purple-100 text-purple-800'
                          : formData.constructionStage === 'STRUCTURE'
                          ? 'bg-blue-100 text-blue-800'
                          : formData.constructionStage === 'FOUNDATION'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {formData.constructionStage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>

                    {formData.isFeatured && (
                      <div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-700">Featured Unit</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price Calculator */}
              {formData.sqft && formData.price && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Price Analysis</h3>
                  </div>

                  <div className="p-4 sm:p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price per sq ft:</span>
                      <span className="text-sm font-medium text-gray-900">
                        Ksh {Math.round(parseFloat(formData.price) / parseInt(formData.sqft)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Price:</span>
                      <span className="text-sm font-bold text-gray-900">
                        Ksh {parseFloat(formData.price).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Square Footage:</span>
                      <span className="text-sm font-medium text-blue-600">
                        {parseInt(formData.sqft).toLocaleString()} sq ft
                      </span>
                    </div>
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
                        {isUploading ? 'Uploading Images...' : 'Creating Unit...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create Unit
                      </>
                    )}
                  </button>

                  <Link
                    href="/units"
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center block font-medium transition-colors"
                  >
                    Cancel
                  </Link>
                </div>

                <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">
                      Fields marked with * are required. Make sure all information is accurate before creating the unit.
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
