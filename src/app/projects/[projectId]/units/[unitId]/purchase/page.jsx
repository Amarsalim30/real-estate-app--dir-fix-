'use client';
import { useState, useMemo ,useEffect} from 'react';
import { useParams, useRouter } from 'next/navigation';
// import { Projects } from '@/data/projects';
// import { Units } from '@/data/units';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/utils/format';
import { useProjects } from '@/hooks/useProjects';
import { useUnits } from '@/hooks/useUnits';

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
} from 'lucide-react';

export default function UnitPurchasePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { projects, loading: isLoading, error } = useProjects();
  const { units } = useUnits();
  const [activePaymentPlan, setActivePaymentPlan] = useState(null);
const paymentPlanRef = useRef(null);
const paymentPlanId = useId();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Buyer Information
    firstName: session?.user?.firstName?.split(' ')[0] || '',
    lastName: session?.user?.lastName?.split(' ')[0] || '',
    email: session?.user?.email || '',
    phone: '',
    nationalId: '',
    kraPin : '',
    city: '',
    state: '',
    postalCode: '',
    
    // Financial Information
    annualIncome: '',
    employmentStatus: '',
    employer: '',
    downPayment: '',
    financingType: 'mortgage', // cash, mortgage, financing
    
    // Payment Information
    paymentMethod: 'wire_transfer',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    
    // Legal
    agreeToTerms: false,
    agreeToDisclosure: false,
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

const unit = useMemo(() => {
  if (!units || !Array.isArray(units) || !params?.unitId) return null;
  return units.find(u => u.id === parseInt(params.unitId));
}, [units, params?.unitId]);

const project = useMemo(() => {
  if (!projects || !Array.isArray(projects) || !params?.projectId) return null;
  return projects.find(p => p.id === parseInt(params.projectId));
}, [projects, params?.projectId]);

if (isLoading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
    </div>
  );
}


  if (!unit || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
          <button onClick={() => router.push('/projects')} className="btn-primary">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Check if unit is available for purchase
  if (unit.status === 'sold') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Available</h1>
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
    
    // Clear error when user starts typing
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
        if (!formData.downPayment) newErrors.downPayment = 'Down payment amount is required';
        break;
        
      case 3: // Payment Information
        if (formData.paymentMethod === 'wire_transfer') {
          if (!formData.bankName) newErrors.bankName = 'Bank name is required';
          if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
          if (!formData.routingNumber) newErrors.routingNumber = 'Routing number is required';
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

  const handleNext = () => {
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
      const response = await fetch('/api/buyers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        nationalId: formData.nationalId,
        kraPin: formData.kraPin,
        city: formData.city,
        state: formData.state,
        user:{id:session?.user?.id},
        postalCode: formData.postalCode,
      }),
    });
      const buyer = await response.json();


      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would submit to your API
      console.log('Purchase submitted:', { unit, project, formData });
      
      // Redirect to success page
      router.push(`/projects/${project.id}/units/${unit.id}/purchase/success`);
    } catch (error) {
      console.error('Purchase submission failed:', error);
      setErrors({ submit: 'Failed to submit purchase. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Information', description: 'Basic contact details' },
    { number: 2, title: 'Financial Information', description: 'Income and financing details' },
    { number: 3, title: 'Payment Information', description: 'Payment method and details' },
    { number: 4, title: 'Review & Submit', description: 'Review and confirm purchase' },
  ];

const taxAmount = unit?.price ? unit.price * 0.08 : 0;
const totalAmount = unit?.price ? unit.price + taxAmount : 0;

  const downPaymentAmount = formData.downPayment ? parseFloat(formData.downPayment) : 0;
  const financingAmount = totalAmount - downPaymentAmount;

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
            Purchase Unit {unit.unitNumber}
          </h1>
          <p className="text-gray-600">
            {project.name} • {formatPrice(unit.price)}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
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
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                                  <div className={`hidden sm:block w-16 h-0.5 ml-6 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-8">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                  
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
                        className={`text-gray-800 placeholder-gray-400 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                        className={`text-gray-800 placeholder-gray-400 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                        className={`text-gray-800 placeholder-gray-400 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`text-gray-800 placeholder-gray-400 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      National ID Number*
                    </label>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      className={`text-gray-800 placeholder-gray-400 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nationalId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your national ID number"
                    />
                    {errors.nationalId && (
                      <p className="mt-1 text-sm text-red-600">{errors.nationalId}</p>
                    )}
                  </div>
                                    <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      KRA Pin Number*
                    </label>
                    <input
                      type="text"
                      name="kraPin"
                      value={formData.kraPin}
                      onChange={handleInputChange}
                      className={`text-gray-800 placeholder-gray-400 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.kraPin ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your kra pin number"
                    />
                    {errors.nationalId && (
                      <p className="mt-1 text-sm text-red-600">{errors.kraPin}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`text-gray-800 placeholder-gray-400 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="City"
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
                        className={`text-gray-800 placeholder-gray-400 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select State</option>
                        <option value="NY">New York</option>
                        <option value="CA">California</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        {/* Add more states as needed */}
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
                        className={`text-gray-800 placeholder-gray-400 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.postalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="12345"
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Information</h2>
                  
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Financing Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="financingType"
                          value="cash"
                          checked={formData.financingType === 'cash'}
                          onChange={handleInputChange}
                          className=" mr-3"
                        />
                        <div>
                          <div className=" text-gray-800  font-medium">Cash Purchase</div>
                          <div className="text-sm text-gray-500">Full payment upfront</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="financingType"
                          value="monthlyPayments"
                          checked={formData.financingType === 'monthlyPayments'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <div>
                          <div className="text-gray-800 font-medium">Monthly Payments</div>
                          <div className="text-sm text-gray-500">Pay each month with a payment plan</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="financingType"
                          value="payAsYouGO"
                          checked={formData.financingType === 'payAsYouGO'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <div>
                          <div className="text-gray-700 font-medium">Pay As You GO</div>
                          <div className="text-sm text-gray-500">Flexible terms</div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Down Payment Amount *
                    </label>
                    <input
                      type="number"
                      name="downPayment"
                      value={formData.downPayment}
                      onChange={handleInputChange}
                      className={`text-gray-800 placeholder-gray-400 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.downPayment ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="50000"
                    />
                    {errors.downPayment && (
                      <p className="mt-1 text-sm text-red-600">{errors.downPayment}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      Minimum 10% ({formatPrice(totalAmount * 0.1)}) required
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="wire_transfer"
                          checked={formData.paymentMethod === 'wire_transfer'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <Building className="w-5 h-5 mr-2 text-blue-600" />
                                                  <div>
                            <div className="font-medium">Wire Transfer</div>
                            <div className="text-sm text-gray-500">Bank to bank transfer</div>
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
                            <div className="font-medium">Certified Check</div>
                            <div className="text-sm text-gray-500">Bank certified check</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {formData.paymentMethod === 'wire_transfer' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.bankName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your bank name"
                        />
                        {errors.bankName && (
                          <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                            Routing Number *
                          </label>
                          <input
                            type="text"
                            name="routingNumber"
                            value={formData.routingNumber}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.routingNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Routing number"
                          />
                          {errors.routingNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.routingNumber}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <Lock className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
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
                  
                  {formData.paymentMethod === 'check' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-3">Certified Check Instructions</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>• Obtain a certified check from your bank</p>
                        <p>• Make payable to: "Real Estate Development LLC"</p>
                        <p>• Include unit number {unit.unitNumber} in the memo line</p>
                        <p>• Deliver to our office within 5 business days</p>
                      </div>
                      <div className="mt-4 p-3 bg-white rounded border">
                        <p className="text-sm font-medium text-gray-900">Delivery Address:</p>
                        <p className="text-sm text-gray-700">
                          Real Estate Development LLC<br />
                          123 Business Plaza, Suite 456<br />
                          New York, NY 10001
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
                  
                  {/* Purchase Summary */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="font-medium">{formatPrice(unit.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Taxes & Fees:</span>
                        <span className="font-medium">{formatPrice(taxAmount)}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between">
                        <span className="font-medium text-gray-900">Total Purchase Price:</span>
                        <span className="font-bold text-gray-900">{formatPrice(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Down Payment:</span>
                        <span className="font-medium">{formatPrice(downPaymentAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Financing Amount:</span>
                        <span className="font-medium">{formatPrice(financingAmount)}</span>
                      </div>
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
                        className="mt-1 mr-3"
                      />
                      <div>
                        <label className="text-sm text-gray-700">
                          I agree to the{' '}
                          <button className="text-blue-600 hover:underline">
                            Terms and Conditions
                          </button>{' '}
                          and{' '}
                          <button className="text-blue-600 hover:underline">
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
                        className="mt-1 mr-3"
                      />
                      <div>
                        <label className="text-sm text-gray-700">
                          I acknowledge that I have received and reviewed the{' '}
                          <button className="text-blue-600 hover:underline">
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
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <p className="text-sm text-red-800">{errors.submit}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t">
                <button
                  onClick={currentStep === 1 ? () => router.push(`/projects/${project.id}/units/${unit.id}`) : handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>
                
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
            <div className="bg-white rounded-xl shadow-sm border p-6  top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Summary</h3>
              
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={unit.images?.[0] || '/images/placeholder-unit.jpg'}
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
                
                <div className="text-gray-600 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-800">Bedrooms:</span>
                    <div className="font-medium">{unit.bedrooms}</div>
                  </div>
                  <div>
                    <span className="text-gray-800">Bathrooms:</span>
                    <div className="font-medium">{unit.bathrooms}</div>
                  </div>
                  <div>
                    <span className="text-gray-800">Square Feet:</span>
                    <div className="font-medium">{unit.sqft?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-800">Floor:</span>
                    <div className="font-medium">{unit.floor}</div>
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

            {/* Price Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-800">Base Price:</span>
                  <span className="text-gray-600 italic font-medium">{formatPrice(unit.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">Est. Taxes (8%):</span>
                  <span className="text-gray-600 italic font-medium">{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="text-gray-600 italic font-medium">{formatPrice(500)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">{formatPrice(totalAmount + 500)}</span>
                </div>
                
                {downPaymentAmount > 0 && (
                  <>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Down Payment:</span>
                        <span className="font-medium text-green-600">{formatPrice(downPaymentAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Financing Needed:</span>
                        <span className="text-gray-600 font-medium">{formatPrice(totalAmount + 500 - downPaymentAmount)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Sales Support</div>
                    <div className="text-gray-600 text-sm">+1-555-PURCHASE</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
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
                  Our team is available Monday-Friday, 9 AM - 6 PM EST to assist with your purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

