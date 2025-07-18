'use client';
import { useState ,useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { useUnits } from '@/hooks/useUnits';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/utils/format';
import { useBuyers} from '@/hooks/useBuyers';
import { 
  ArrowLeft, 
  Calendar, 
  Building, 
  CheckCircle, 
  AlertCircle,
  Clock,
  DollarSign,
  Phone,
  Mail
} from 'lucide-react';

export default function UnitReservePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session ,status } = useSession();
    const { projects, loading: isLoading, error } = useProjects();
  const { units } = useUnits();
  const { buyers } = useBuyers();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const [buyer, setBuyer] = useState(null);

useEffect(() => {
  if (session?.user?.buyerId && Array.isArray(buyers)) {
    const found = buyers.find(b => b.id === session.user.buyerId);
    setBuyer(found);
  }
}, [buyers, session?.user?.buyerId]);

useEffect(() => {
  if (buyer?.phoneNumber) {
    setFormData(prev => ({
      ...prev,
      phoneNumber: buyer.phoneNumber
    }));
  }
}, [buyer]);


const [formData, setFormData] = useState({
  firstName: session?.user?.firstName || '',
  lastName: session?.user?.lastName || '',
  email: session?.user?.email || '',
  phoneNumber: buyer?.phoneNumber || '',
  reservationPeriod: '30',
  depositAmount: '',
  agreeToTerms: false,
  paymentMethod: 'wire_transfer',
});

  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  if (status === 'unauthenticated') {
    return null; // prevent rendering until redirected
  }

  const unit = Array.isArray(units) ? units.find(u => u.id === parseInt(params.unitId)) : null;
  const project = Array.isArray(projects) ? projects.find(p => p.id === parseInt(params.projectId)) : null;
  
  if (!unit || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
          <button onClick={() => router.push('/projects')} className="btn-primary">
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  // Check if unit is available for reservation
  if (unit.status !== 'AVAILABLE') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Available</h1>
          <p className="text-gray-600 mb-6">
            This unit is currently {unit.status} and cannot be reserved.
          </p>
          <button onClick={() => router.push(`/projects/${project.id}`)} className="btn-primary">
            View Other Units
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.depositAmount) newErrors.depositAmount = 'Deposit amount is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    
    // Validate deposit amount
    const depositAmount = parseFloat(formData.depositAmount);
    const minDeposit = unit.price * 0.05; // 5% minimum
    if (depositAmount < minDeposit) {
      newErrors.depositAmount = `Minimum deposit is ${formatPrice(minDeposit)} (5% of unit price)`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await fetch(`${apiBaseUrl}/units/${unit.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'RESERVED',
        reservedBy: session?.user?.id,
        reservedDate: new Date().toISOString(),
reservedUntil: new Date(Date.now() + Number(formData.reservationPeriod) * 24 * 60 * 60 * 1000).toISOString()
      }),
    });

    const responseJson = await response.json();
    if (!response.ok) {
      throw new Error(responseJson.message || 'Failed to reserve unit');
    }

    console.log('Reservation submitted:', { unit, project, formData });
    
    router.push(`/projects/${project.id}/units/${unit.id}/reserve/reserveSuccess`);
  } catch (error) {
    console.error('Reservation submission failed:', error);
    setErrors({ submit: 'Failed to submit reservation. Please try again.' });
  } finally {
    setIsSubmitting(false);
  }
};

  const depositAmount = parseFloat(formData.depositAmount) || 0;
  const minDeposit = unit.price * 0.05;
  const maxDeposit = unit.price * 0.20;
  const reservationFee = 500;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/projects/${project.id}/units/${unit.id}`)}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Unit Details
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reserve Unit {unit.unitNumber}
          </h1>
          <p className="text-gray-600">
            {project.name} • {formatPrice(unit.price)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reservation Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`placeholder-gray-500 text-gray-500 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`placeholder-gray-500 text-gray-500 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`placeholder-gray-500 text-gray-500 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`placeholder-gray-500 text-gray-500 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reservation Terms */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservation Terms</h3>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reservation Period
                    </label>
                    <select
                      name="reservationPeriod"
                      value={formData.reservationPeriod}
                      onChange={handleInputChange}
                      className="placeholder-gray-500 text-gray-500 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="15">15 days</option>
                      <option value="30">30 days (Recommended)</option>
                      <option value="45">45 days</option>
                      <option value="60">60 days</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      How long would you like to reserve this unit?
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deposit Amount *
                    </label>
                    <input
                      type="number"
                      name="depositAmount"
                      value={formData.depositAmount}
                      onChange={handleInputChange}
                      min={minDeposit}
                      max={maxDeposit}
                      className={`placeholder-gray-500 text-gray-500 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.depositAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={minDeposit.toString()}
                    />
                    {errors.depositAmount && (
                      <p className="mt-1 text-sm text-red-600">{errors.depositAmount}</p>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Minimum: {formatPrice(minDeposit)} (5% of unit price)</p>
                      <p>Maximum: {formatPrice(maxDeposit)} (20% of unit price)</p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="wire_transfer"
                        checked={formData.paymentMethod === 'wire_transfer'}
                        onChange={handleInputChange}
                        className="placeholder-gray-500 text-gray-500 mr-3"
                      />
                      <div className="flex items-center">
                        <Building className="w-5 h-5 mr-2 text-blue-600" />
                        <div>
                          <div className="placeholder-gray-500 text-gray-500 font-medium">Wire Transfer</div>
                          <div className="text-sm text-gray-500">Instant processing</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="check"
                        checked={formData.paymentMethod === 'check'}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        <div>
                          <div className="placeholder-gray-500 text-gray-500 font-medium">Certified Check</div>
                          <div className="text-sm text-gray-500">2-3 business days</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Important Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Reservation Terms & Conditions
                  </h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>• Your reservation will be valid for {formData.reservationPeriod} days from confirmation</p>
                    <p>• The deposit is fully refundable if you decide not to proceed within the reservation period</p>
                    <p>• If you proceed with the purchase, the deposit will be applied to your down payment</p>
                    <p>• A reservation fee of {formatPrice(reservationFee)} will be charged (non-refundable)</p>
                    <p>• You will have exclusive rights to purchase this unit during the reservation period</p>
                  </div>
                </div>

                {/* Legal Agreement */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <label className="text-sm text-gray-700">
                        I agree to the{' '}
                        <button type="button" className="text-blue-600 hover:underline">
                          Reservation Terms and Conditions
                        </button>{' '}
                        and understand that the reservation fee is non-refundable
                      </label>
                      {errors.agreeToTerms && (
                        <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                      )}
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <p className="text-sm text-red-800">{errors.submit}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-between pt-6 border-t">
                  <button
                    type="button"
                    onClick={() =>  router.push(`/projects/${project.id}/units/${unit.id}`)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Reserve Unit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Unit Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6  top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservation Summary</h3>
              
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                src={unit.images?.[0] ? `${apiBaseUrl}/images/${unit.images[0]}` : '/images/placeholder-unit.jpg'}

                  alt={`Unit ${unit.unitNumber}`}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-unit.jpg';
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900">Unit {unit.unitNumber}</div>
                  <div className="text-sm text-gray-600">{project.name}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Bedrooms:</span>
                    <div className="text-gray-700 font-medium">{unit.bedrooms}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Bathrooms:</span>
                    <div className="text-gray-700 font-medium">{unit.bathrooms}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Square Feet:</span>
                    <div className="text-gray-700 font-medium">{unit.sqft?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Floor:</span>
                    <div className="text-gray-700 font-medium">{unit.floor}</div>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="text-xl font-bold text-gray-900">{formatPrice(unit.price)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit Amount:</span>
                  <span className="font-medium">
                    {depositAmount > 0 ? formatPrice(depositAmount) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reservation Fee:</span>
                  <span className="text-gray-700 font-medium">{formatPrice(reservationFee)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total Due Today:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(depositAmount + reservationFee)}
                  </span>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Reservation Period:</p>
                    <p>{formData.reservationPeriod} days from confirmation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions?</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Call Us</div>
                    <div className="text-gray-600 text-sm">+1-555-RESERVE</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Email Us</div>
                    <div className="text-gray-600 text-sm">reserve@realestate.com</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  Our reservation specialists are available to help you through the process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
              