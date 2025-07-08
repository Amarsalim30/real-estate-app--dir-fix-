'use client';
import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/utils/format';
import { useProjects } from '@/hooks/useProjects';
import { useUnits } from '@/hooks/useUnits';
import { usePaymentPlans } from '@/hooks/usePaymentsPlan';
import { PaymentPlanCard } from '@/components/ui/expandableCard';
import api from '@/lib/api';
import { invoicesApi } from '@/lib/api/invoices';

import {
  ArrowLeft,
  CreditCard,
  Building,
  CheckCircle,
  AlertCircle,
  Lock,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  User,
  CreditCard as PaymentIcon,
  FileText,
  Smartphone,
} from 'lucide-react';

export default function UnitPurchasePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { projects, loading: isLoading, error } = useProjects();
  const { units } = useUnits();
  const { plans: paymentPlansData, loading: plansLoading, error: plansError } = usePaymentPlans();

  const [currentStep, setCurrentStep] = useState(1);
  const [buyerExists, setBuyerExists] = useState(false);
  const [createdBuyerId, setCreatedBuyerId] = useState(null);
  
  const [formData, setFormData] = useState({
    // Buyer Information
    firstName: session?.user?.firstName?.split(' ')[0] || '',
    lastName: session?.user?.lastName?.split(' ')[0] || '',
    email: session?.user?.email || '',
    phone: '',
    nationalId: '',
    kraPin: '',
    city: '',
    state: '',
    postalCode: '',

    // Financial Information
    paymentPlanId: '',

    // Payment Information
    paymentMethod: 'mpesa_stkpush',
    mpesaNumber: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',

    // Legal
    agreeToTerms: false,
    agreeToDisclosure: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingBuyer, setIsCreatingBuyer] = useState(false);

  // Check authentication and existing buyer
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Check if buyer already exists
    const checkExistingBuyer = async () => {
      if (session?.user?.id) {
        try {
          const response = await api.get(`/buyers/user/${session.user.id}`);
          if (response.data) {
            const buyer = response.data;
            setBuyerExists(true);
            setCreatedBuyerId(buyer.id);

            setCurrentStep(2); // Skip to payment plan selection
            
            // Pre-fill form with existing buyer data
            setFormData(prev => ({
              ...prev,
              firstName: buyer.firstName || prev.firstName,
              lastName: buyer.lastName || prev.lastName,
              email: buyer.email || prev.email,
              phone: buyer.phoneNumber || prev.phone,
              nationalId: buyer.nationalId || prev.nationalId,
              kraPin: buyer.kraPin || prev.kraPin,
              city: buyer.city || prev.city,
              state: buyer.state || prev.state,
              postalCode: buyer.postalCode || prev.postalCode,
            }));
          }
        } catch (error) {
          console.error('Error checking existing buyer:', error);
        }
      }
    };

    checkExistingBuyer();
  }, [status, router, session?.user?.id]);

  if (status === 'unauthenticated') {
    return null;
  }

  const unit = useMemo(() => {
    if (!units || !Array.isArray(units) || !params?.unitId) return null;
    return units.find(u => u.id === parseInt(params.unitId));
  }, [units, params?.unitId]);

  const project = useMemo(() => {
    if (!projects || !Array.isArray(projects) || !params?.projectId) return null;
    return projects.find(p => p.id === parseInt(params.projectId));
  }, [projects, params?.projectId]);

  // Calculate financial amounts
  const taxAmount = unit?.price ? unit.price * 0.08 : 0;
  const totalAmount = unit?.price ? unit.price + taxAmount : 0;
  
  const selectedPlan = useMemo(() => {
    if (!formData.paymentPlanId || !paymentPlansData) return null;
    return paymentPlansData.find(p => p.id === formData.paymentPlanId);
  }, [formData.paymentPlanId, paymentPlansData]);

const downPaymentAmount = useMemo(() => {
  if (!selectedPlan || !totalAmount) return totalAmount * 0.1; // Default 10%
  return totalAmount * (selectedPlan.minDownPaymentPercentage || 0.1);
}, [selectedPlan, totalAmount]);

  const financingAmount = totalAmount - downPaymentAmount;
  const processingFee = selectedPlan?.details?.processingFee || 500;
  const finalTotal = totalAmount + processingFee;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!unit || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
          <button onClick={() => router.push('/projects')} className="btn-primary">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (unit.status === 'sold') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Unit Not Available</h1>
          <p className="text-gray-600 mb-6">This unit has already been sold.</p>
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

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.nationalId) newErrors.nationalId = 'National ID is required';
        if (!formData.kraPin) newErrors.kraPin = 'KRA PIN is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.postalCode) newErrors.postalCode = 'ZIP code is required';
        break;

      case 2: // Financial Information
        if (!formData.paymentPlanId) newErrors.paymentPlanId = 'Please select a payment plan';
        break;

      case 3: // Payment Information
        if (formData.paymentMethod === 'wire_transfer') {
          if (!formData.bankName) newErrors.bankName = 'Bank name is required';
          if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
          if (!formData.routingNumber) newErrors.routingNumber = 'Routing number is required';
        } else if (formData.paymentMethod === 'mpesa_stkpush') {
          if (!formData.mpesaNumber) newErrors.mpesaNumber = 'M-Pesa number is required';
        }
        break;

      case 4: // Review & Submit
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
        if (!formData.agreeToDisclosure) newErrors.agreeToDisclosure = 'You must agree to the disclosure';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleCreateBuyer = async () => {
  // if (!validateStep(1)) return;

  setIsCreatingBuyer(true);
  try {
    const response = await api.post('/buyers', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phone,
      nationalId: formData.nationalId,
      kraPin: formData.kraPin,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      user: { id: session?.user?.id },
    });

    const buyer = response.data;

    setCreatedBuyerId(buyer.id);
    setBuyerExists(true);
    setCurrentStep(2);
  } 
catch (error) {
  if (error.response?.status === 409) {
    setBuyerExists(true); // Assume buyer exists now
    setCurrentStep(2);
  } else {
    setErrors({ submit: 'Failed to create buyer profile. Please try again.' });
  }
} finally {
    setIsCreatingBuyer(false);
  }
};

const handleNext = async () => {
  if (currentStep === 1 && !buyerExists) {
    await handleCreateBuyer();
    return;
  }

  if (validateStep(currentStep)) {
    setCurrentStep(prev => prev + 1);
  }
};

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };
const handleSubmit = async () => {
  if (!validateStep(4)) return;

  setIsSubmitting(true);

  try {
    // Build request payload conditionally
    const payload = {
      buyerId: createdBuyerId,
      paymentPlanId: formData.paymentPlanId,
      paymentMethod: formData.paymentMethod,
      downPaymentAmount,
      totalAmount: finalTotal,
    };

    // Conditionally add fields based on method
    if (formData.paymentMethod === 'mpesa_stkpush') {
      payload.mpesaNumber = formData.mpesaNumber;
    }

    if (formData.paymentMethod === 'wire_transfer') {
      payload.bankDetails = {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber,
      };
    }

 const response = await api.post(`/payments/unit/${unit.id}/purchase`, payload);
    const purchase = response.data;
    
    // Check if invoice was created successfully
    if (purchase.invoiceId) {
      try {
        // Verify the invoice success status
const success = await invoicesApi.hasSuccessWithRetry(purchase.invoiceId, {
  interval: 3000,    // every 3s
  maxAttempts: 15,   // try for 30s total
});
        
        if (success) {
          // Redirect to success page with invoice ID
          router.push(`/projects/${project.id}/units/${unit.id}/purchase/purchaseSuccess?invoiceId=${purchase.invoiceId}`);
        } else {
          // Handle unsuccessful payment
          setErrors({
            submit: 'Payment was not successful. Please try again or contact support.'
          });
        }
      } catch (invoiceError) {
        console.error('Error checking invoice status:', invoiceError);
        // Still redirect but show a warning
        // router.push(`/projects/${project.id}/units/${unit.id}/purchase/purchaseSuccess?invoiceId=${purchase.invoiceId}&warning=status_check_failed`);
      }
    } else {
      setErrors({
        submit: 'Purchase completed but no invoice was generated. Please contact support.'
      });
    }

  } catch (error) {
    console.error('Purchase submission failed:', error);
    setErrors({
      submit:
        error.response?.data?.message ||
        error.message ||
        'Failed to submit purchase. Please try again.',
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const steps = [
    { number: 1, title: 'Buyer Info', description: 'Personal details', icon: User },
    { number: 2, title: 'Payment Plan', description: 'Financing options', icon: CreditCard },
    { number: 3, title: 'Payment Method', description: 'How you\'ll pay', icon: PaymentIcon },
    { number: 4, title: 'Review', description: 'Confirm & submit', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push(`/projects/${project.id}/units/${unit.id}`)}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Back to Unit Details</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Purchase Unit {unit.unitNumber}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {project.name} • {formatPrice(unit.price)}
          </p>
        </div>

        {/* Progress Steps - Mobile Responsive */}
        <div className="mb-6 sm:mb-8">
          {/* Desktop Progress */}
          <div className="hidden sm:flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep >= step.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-6 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Mobile Progress */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-sm font-medium text-blue-600">
                {steps[currentStep - 1]?.title}
              </span>
              <span className="text-xs text-gray-500 block">
                {steps[currentStep - 1]?.description}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 lg:p-8">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div>
                  <div className="flex items-center mb-6">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {buyerExists ? 'Buyer Information' : 'Create Buyer Profile'}
                    </h2>
                  </div>

                  {buyerExists && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <p className="text-sm text-green-800">
                          Buyer profile already exists. You can proceed to payment plan selection.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={buyerExists}
                        className={`text-gray-800 placeholder-gray-400 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        } ${buyerExists ? 'bg-gray-50' : ''}`}
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
                        disabled={buyerExists}
                        className={`text-gray-800 placeholder-gray-400 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        } ${buyerExists ? 'bg-gray-50' : ''}`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={buyerExists}
                        className={`text-gray-800 placeholder-gray-400 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        } ${buyerExists ? 'bg-gray-50' : ''}`}
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
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={buyerExists}
                        className={`text-gray-800 placeholder-gray-400 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        } ${buyerExists ? 'bg-gray-50' : ''}`}
                        placeholder="+254 712 345 678"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        National ID Number *
                      </label>
                      <input
                        type="text"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleInputChange}
                        disabled={buyerExists}
                        className={`text-gray-800 placeholder-gray-400 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          errors.nationalId ? 'border-red-500' : 'border-gray-300'
                        } ${buyerExists ? 'bg-gray-50' : ''}`}
                        placeholder="Enter your national ID"
                      />
                      {errors.nationalId && (
                        <p className="mt-1 text-sm text-red-600">{errors.nationalId}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        KRA PIN Number *
                      </label>
                      <input
                        type="text"
                        name="kraPin"
                        value={formData.kraPin}
                        onChange={handleInputChange}
                        disabled={buyerExists}
                        className={`text-gray-800 placeholder-gray-400 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          errors.kraPin ? 'border-red-500' : 'border-gray-300'
                        } ${buyerExists ? 'bg-gray-50' : ''}`}
                        placeholder="Enter your KRA PIN"
                      />
                      {errors.kraPin && (
                        <p className="mt-1 text-sm text-red-600">{errors.kraPin}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={buyerExists}
                        className={`text-gray-800 placeholder-gray-400 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        } ${buyerExists ? 'bg-gray-50' : ''}`}
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={buyerExists}
                        className={`text-gray-800 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        } ${buyerExists ? 'bg-gray-50' : ''}`}
                      >
                        <option value="">Select County</option>
                        <option value="Nairobi">Nairobi</option>
                        <option value="Mombasa">Mombasa</option>
                        <option value="Kiambu">Kiambu</option>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Machakos">Machakos</option>
                        <option value="Kajiado">Kajiado</option>
                      </select>
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        disabled={buyerExists}
                        className={`text-gray-800 placeholder-gray-400 w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          errors.postalCode ? 'border-red-500' : 'border-gray-300'
                        } ${buyerExists ? 'bg-gray-50' : ''}`}
                        placeholder="00100"
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Financial Information */}
              {currentStep === 2 && (
                <div>
                  <div className="flex items-center mb-6">
                    <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Plan</h2>
                  </div>
                  
                  <PaymentPlanCard
                    formData={formData}
                    handleInputChange={handleInputChange}
                    formatPrice={formatPrice}
                    totalAmount={totalAmount}
                    errors={errors}
                    paymentPlansData={paymentPlansData}
                    plansLoading={plansLoading}
                    plansError={plansError}
                  />
                  
                  <div className="mt-6">
                    <a 
                      href={`/projects/${project.id}/units/${unit.id}/purchase/payment-plan`} 
                      className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download Payment Plan
                    </a>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div>
                  <div className="flex items-center mb-6">
                    <PaymentIcon className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Method</h2>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Choose Payment Method
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                      {/* M-Pesa Push */}
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mpesa_stkpush"
                          checked={formData.paymentMethod === 'mpesa_stkpush'}
                          onChange={handleInputChange}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                            <div className="font-medium">M-Pesa Push</div>
                          </div>
                          <div className="text-sm text-gray-500 mb-3">
                            Pay instantly via M-Pesa STK Push
                          </div>
                          
                          {formData.paymentMethod === 'mpesa_stkpush' && (
                            <div className="space-y-4 mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  M-Pesa Number *
                                </label>
                                <input
                                  type="tel"
                                  name="mpesaNumber"
                                  value={formData.mpesaNumber}
                                  onChange={handleInputChange}
                                  className={`text-gray-800 placeholder-gray-400 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm ${
                                    errors.mpesaNumber ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder="254712345678"
                                />
                                {errors.mpesaNumber && (
                                  <p className="mt-1 text-sm text-red-600">{errors.mpesaNumber}</p>
                                )}
                              </div>
                              
                              <div className="bg-white p-3 rounded border">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-700">Amount to Pay:</span>
                                  <span className="text-lg font-bold text-green-600">
                                    {formatPrice(downPaymentAmount)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Initial down payment for unit reservation
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-600">
                                <p className="mb-1">• You will receive an STK push notification</p>
                                <p className="mb-1">• Enter your M-Pesa PIN to complete payment</p>
                                <p>• Payment confirmation will be sent via SMS</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>

                      {/* M-Pesa Paybill */}
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mpesa_paybill"
                          checked={formData.paymentMethod === 'mpesa_paybill'}
                          onChange={handleInputChange}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Phone className="w-5 h-5 mr-2 text-green-600" />
                            <div className="font-medium">M-Pesa Paybill</div>
                          </div>
                          <div className="text-sm text-gray-500 mb-3">
                            Pay via M-Pesa Paybill number
                          </div>
                          
                          {formData.paymentMethod === 'mpesa_paybill' && (
                            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-500 mb-1">Paybill Number</div>
                                  <div className="text-lg font-bold text-gray-900">522522</div>
                                </div>
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-500 mb-1">Account Number</div>
                                  <div className="text-lg font-bold text-gray-900">UNIT{unit.unitNumber}</div>
                                </div>
                              </div>
                              
                              <div className="bg-white p-3 rounded border mb-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Amount:</span>
                                  <span className="text-lg font-bold text-green-600">
                                    {formatPrice(downPaymentAmount)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-600">
                                <p className="mb-1">1. Go to M-Pesa menu</p>
                                <p className="mb-1">2. Select "Lipa na M-Pesa" → "Pay Bill"</p>
                                <p className="mb-1">3. Enter Paybill: <strong>522522</strong></p>
                                <p className="mb-1">4. Account: <strong>UNIT{unit.unitNumber}</strong></p>
                                <p>5. Enter amount and complete transaction</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>

                      {/* Bank Transfer */}
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="wire_transfer"
                          checked={formData.paymentMethod === 'wire_transfer'}
                          onChange={handleInputChange}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Building className="w-5 h-5 mr-2 text-blue-600" />
                            <div className="font-medium">Bank Transfer</div>
                          </div>
                          <div className="text-sm text-gray-500 mb-3">
                            Direct bank to bank transfer
                          </div>
                          
                          {formData.paymentMethod === 'wire_transfer' && (
                            <div className="mt-4 space-y-4">
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-900 mb-3">Our Bank Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="text-gray-600">Bank Name:</div>
                                    <div className="font-medium">Equity Bank Kenya</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Account Number:</div>
                                    <div className="font-medium">1234567890</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Branch:</div>
                                    <div className="font-medium">Westlands Branch</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Swift Code:</div>
                                    <div className="font-medium">EQBLKENA</div>
                                  </div>
                                </div>
                                <div className="mt-3 p-2 bg-white rounded border">
                                  <div className="text-gray-600 text-xs">Amount to Transfer:</div>
                                  <div className="text-lg font-bold text-blue-600">
                                    {formatPrice(downPaymentAmount)}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">Your Bank Details</h4>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Bank Name *
                                    </label>
                                    <input
                                      type="text"
                                      name="bankName"
                                      value={formData.bankName}
                                      onChange={handleInputChange}
                                      className={`text-gray-800 placeholder-gray-400 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                        errors.bankName ? 'border-red-500' : 'border-gray-300'
                                      }`}
                                      placeholder="Enter your bank name"
                                    />
                                    {errors.bankName && (
                                      <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Number *
                                      </label>
                                      <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleInputChange}
                                        className={`text-gray-800 placeholder-gray-400 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                          errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Account number"
                                      />
                                      {errors.accountNumber && (
                                        <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Branch Code *
                                      </label>
                                      <input
                                        type="text"
                                        name="routingNumber"
                                        value={formData.routingNumber}
                                        onChange={handleInputChange}
                                        className={`text-gray-800 placeholder-gray-400 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                          errors.routingNumber ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Branch code"
                                      />
                                      {errors.routingNumber && (
                                        <p className="mt-1 text-sm text-red-600">{errors.routingNumber}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                  <div>
                                    <h4 className="font-medium text-blue-900">Secure Payment</h4>
                                    <p className="text-sm text-blue-800 mt-1">
                                      Your banking information is encrypted and secure. We use industry-standard security measures to protect your data.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div>
                  <div className="flex items-center mb-6">
                    <FileText className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Review & Submit</h2>
                  </div>

                  {/* Purchase Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Summary</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Unit Details</h4>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p>Unit {unit.unitNumber}</p>
                          <p>{project.name}</p>
                          <p>{unit.bedrooms} bed, {unit.bathrooms} bath</p>
                          <p>{unit.sqft?.toLocaleString()} sq ft</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Buyer Information</h4>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p>{formData.firstName} {formData.lastName}</p>
                          <p>{formData.email}</p>
                          <p>{formData.phone}</p>
                          <p>{formData.city}, {formData.state} {formData.postalCode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Financial Summary */}
                  <div className="bg-white border rounded-lg p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="text-gray-800 font-medium">{formatPrice(unit.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Taxes & Fees (8%):</span>
                        <span className="text-gray-800 font-medium">{formatPrice(taxAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Fee:</span>
                        <span className="text-gray-800 font-medium">{formatPrice(processingFee)}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between">
                        <span className="font-medium bold text-gray-900">Total Purchase Price:</span>
                        <span className="font-bold text-gray-900">{formatPrice(finalTotal)}</span>
                      </div>
                      
                      {selectedPlan && (
                        <>
                          <div className="border-t pt-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Selected Plan:</span>
                              <span className="font-medium text-blue-600">{selectedPlan.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Down Payment ({(selectedPlan.minDownPaymentPercentage * 100)}%):</span>
                              <span className="font-medium text-green-600">{formatPrice(downPaymentAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Financing Amount:</span>
                              <span className="font-medium text-gray-600">{formatPrice(finalTotal - downPaymentAmount)}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payment Method Summary */}
                  <div className="bg-white border rounded-lg p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                    <div className="flex items-center space-x-3">
                      {formData.paymentMethod === 'mpesa_stkpush' && (
                        <>
                          <Smartphone className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-gray-900 font-medium">M-Pesa Push</div>
                            <div className="text-sm text-gray-600">
                              Payment to: {formData.mpesaNumber}
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              Amount: {formatPrice(downPaymentAmount)}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {formData.paymentMethod === 'mpesa_paybill' && (
                        <>
                          <Phone className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium">M-Pesa Paybill</div>
                            <div className="text-sm text-gray-600">
                              Paybill: 522522 | Account: UNIT{unit.unitNumber}
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              Amount: {formatPrice(downPaymentAmount)}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {formData.paymentMethod === 'wire_transfer' && (
                        <>
                          <Building className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Bank Transfer</div>
                            <div className="text-sm text-gray-600">
                              From: {formData.bankName}
                            </div>
                            <div className="text-sm font-medium text-blue-600">
                              Amount: {formatPrice(downPaymentAmount)}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Legal Agreements */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <label className="text-sm text-gray-700">
                          I agree to the{' '}
                          <button type="button" className="text-blue-600 hover:underline font-medium">
                            Terms and Conditions
                          </button>{' '}
                          and{' '}
                          <button type="button" className="text-blue-600 hover:underline font-medium">
                            Purchase Agreement
                          </button>
                        </label>
                        {errors.agreeToTerms && (
                          <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="agreeToDisclosure"
                        checked={formData.agreeToDisclosure}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <label className="text-sm text-gray-700">
                          I acknowledge that I have received and reviewed the{' '}
                          <button type="button" className="text-blue-600 hover:underline font-medium">
                            Property Disclosure Statement
                          </button>
                        </label>
                        {errors.agreeToDisclosure && (
                          <p className="mt-1 text-sm text-red-600">{errors.agreeToDisclosure}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                        <p className="text-sm text-red-800">{errors.submit}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 sm:pt-8 border-t">
                <button
                  onClick={currentStep === 1 ? () => router.push(`/projects/${project.id}/units/${unit.id}`) : handleBack}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    disabled={isCreatingBuyer}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                  >
                    {isCreatingBuyer ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        {currentStep === 1 && !buyerExists ? 'Create Profile & Continue' : 'Next Step'}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Purchase
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Unit Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Summary</h3>

              <div className="aspect-w-16 aspect-h-9 mb-4">
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900">Unit {unit.unitNumber}</div>
                  <div className="text-sm text-gray-600">{project.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Bedrooms:</span>
                    <div className="text-gray-600 font-medium">{unit.bedrooms}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Bathrooms:</span>
                    <div className="text-gray-600 font-medium">{unit.bathrooms}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Square Feet:</span>
                    <div className="text-gray-600 font-medium">{unit.sqft?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Floor:</span>
                    <div className="text-gray-600 font-medium">{unit.floor}</div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="text-lg sm:text-xl font-bold text-gray-900">{formatPrice(unit.price)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="text-gray-600 font-medium">{formatPrice(unit.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Taxes (8%):</span>
                  <span className="text-gray-600 font-medium">{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="text-gray-600 font-medium">{formatPrice(processingFee)}</span>
                </div>

                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">{formatPrice(finalTotal)}</span>
                </div>

                {selectedPlan && (
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Down Payment:</span>
                      <span className="font-medium text-green-600">{formatPrice(downPaymentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Financing Needed:</span>
                      <span className="font-medium text-gray-600">{formatPrice(finalTotal - downPaymentAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Sales Support</div>
                    <div className="text-gray-600 text-sm">+254-700-PURCHASE</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Email Support</div>
                    <div className="text-gray-600 text-sm">purchase@realestate.com</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  Our team is available Monday-Friday, 9 AM - 6 PM EAT to assist with your purchase.
                </p>
              </div>
            </div>

            {/* Progress Indicator - Mobile Only */}
            <div className="sm:hidden bg-white rounded-xl shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      currentStep >= step.number
                        ? 'bg-blue-600 text-white'
                        : currentStep === step.number
                        ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                    {currentStep === step.number && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

