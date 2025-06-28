'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Camera,
  Shield,
  Bell,
  Key,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Building,
  CreditCard,
  FileText,
  Settings
} from 'lucide-react';

const ProfileSection = ({ title, children, icon: Icon }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center mb-6">
      <Icon className="w-6 h-6 text-blue-600 mr-3" />
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

const EditableField = ({ 
  label, 
  value, 
  type = 'text', 
  isEditing, 
  onChange, 
  placeholder,
  required = false,
  options = null 
}) => {
  if (type === 'select' && options) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {isEditing ? (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={required}
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-900 py-2">
            {options.find(opt => opt.value === value)?.label || value || 'Not specified'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={required}
        />
      ) : (
        <p className="text-gray-900 py-2">{value || 'Not specified'}</p>
      )}
    </div>
  );
};

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form data state
  const [formData, setFormData] = useState({
    firstName: session?.user?.firstName || '',
    lastName: session?.user?.lastName || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
    address: session?.user?.address || '',
    city: session?.user?.city || '',
    state: session?.user?.state || '',
    postalCode: session?.user?.postalCode || '',
    country: session?.user?.country || 'United States',
    dateOfBirth: session?.user?.dateOfBirth || '',
    occupation: session?.user?.occupation || '',
    company: session?.user?.company || '',
    bio: session?.user?.bio || '',
    preferredContactMethod: session?.user?.preferredContactMethod || 'email',
    marketingEmails: session?.user?.marketingEmails || false,
    smsNotifications: session?.user?.smsNotifications || false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          ...updatedUser
        }
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: session?.user?.firstName || '',
      lastName: session?.user?.lastName || '',
      email: session?.user?.email || '',
      phone: session?.user?.phone || '',
      address: session?.user?.address || '',
      city: session?.user?.city || '',
      state: session?.user?.state || '',
      postalCode: session?.user?.postalCode || '',
      country: session?.user?.country || 'United States',
      dateOfBirth: session?.user?.dateOfBirth || '',
      occupation: session?.user?.occupation || '',
      company: session?.user?.company || '',
      bio: session?.user?.bio || '',
      preferredContactMethod: session?.user?.preferredContactMethod || 'email',
      marketingEmails: session?.user?.marketingEmails || false,
      smsNotifications: session?.user?.smsNotifications || false
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const contactMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'sms', label: 'SMS' },
    { value: 'both', label: 'Email & Phone' }
  ];

  const stateOptions = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    // Add more states as needed
  ];

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
                    <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
                    {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 mr-2 inline" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
        

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}
        

        <div className="space-y-8">
          {/* Profile Picture & Basic Info */}
          <ProfileSection title="Profile Picture & Basic Information" icon={User}>
            <div className="flex items-start space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex-1">
                <div className="text-gray-700 placeholder-gray-600 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="First Name"
                    value={formData.firstName}
                    isEditing={isEditing}
                    onChange={(value) => handleInputChange('firstName', value)}
                    placeholder="Enter your first name"
                    required
                  />
                  <EditableField
                    label="Last Name"
                    value={formData.lastName}
                    isEditing={isEditing}
                    onChange={(value) => handleInputChange('lastName', value)}
                    placeholder="Enter your last name"
                    required
                  />
                  <EditableField
                    label="Email Address"
                    value={formData.email}
                    type="email"
                    isEditing={isEditing}
                    onChange={(value) => handleInputChange('email', value)}
                    placeholder="Enter your email"
                    required
                  />
                  <EditableField
                    label="Phone Number"
                    value={formData.phone}
                    type="tel"
                    isEditing={isEditing}
                    onChange={(value) => handleInputChange('phone', value)}
                    placeholder="Enter your phone number"
                  />
                  <EditableField
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    type="date"
                    isEditing={isEditing}
                    onChange={(value) => handleInputChange('dateOfBirth', value)}
                  />
                </div>
              </div>
            </div>
          </ProfileSection>

          {/* Address Information */}
          <ProfileSection title="Address Information" icon={MapPin}>
            <div className="text-gray-700 placeholder-gray-600 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <EditableField
                  label="Street Address"
                  value={formData.address}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('address', value)}
                  placeholder="Enter your street address"
                />
              </div>
              <EditableField
                label="City"
                value={formData.city}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('city', value)}
                placeholder="Enter your city"
              />
              <EditableField
                label="State"
                value={formData.state}
                type="select"
                options={stateOptions}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('state', value)}
              />
              <EditableField
                label="ZIP Code"
                value={formData.postalCode}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('postalCode', value)}
                placeholder="Enter your ZIP code"
              />
              <EditableField
                label="Country"
                value={formData.country}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('country', value)}
                placeholder="Enter your country"
              />
            </div>
          </ProfileSection>

          {/* Professional Information */}
          <ProfileSection title="Professional Information" icon={Building}>
            <div className="text-gray-700 placeholder-gray-600 grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField
                label="Occupation"
                value={formData.occupation}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('occupation', value)}
                placeholder="Enter your occupation"
              />
              <EditableField
                label="Company"
                value={formData.company}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('company', value)}
                placeholder="Enter your company name"
              />
            </div>
            <div className="text-gray-700 placeholder-gray-600 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2 min-h-[100px]">
                  {formData.bio || 'No bio provided'}
                </p>
              )}
            </div>
          </ProfileSection>

          {/* Communication Preferences */}
          <ProfileSection title="Communication Preferences" icon={Bell}>
            <div className=" text-gray-700 placeholder-gray-600 space-y-4">
              <EditableField
                label="Preferred Contact Method"
                value={formData.preferredContactMethod}
                type="select"
                options={contactMethodOptions}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('preferredContactMethod', value)}
              />
              
              <div className="space-y-3">
                              <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Marketing Emails</label>
                    <p className="text-sm text-gray-500">Receive updates about new properties and promotions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.marketingEmails}
                      onChange={(e) => handleInputChange('marketingEmails', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                    <p className="text-sm text-gray-500">Receive important updates via text message</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.smsNotifications}
                      onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </ProfileSection>



          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dashboard/account-settings')}
              className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
            >
              <Settings className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Account Settings</h3>
              <p className="text-sm text-gray-600">Privacy, security & preferences</p>
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
            >
              <Building className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">My Properties</h3>
              <p className="text-sm text-gray-600">View your owned properties</p>
            </button>

            <button
              onClick={() => router.push('/profile/documents')}
              className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
            >
              <FileText className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">Documents</h3>
              <p className="text-sm text-gray-600">Contracts, invoices & statements</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
