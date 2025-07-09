'use client';
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// Simple useOutsideClick hook implementation
const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, callback]);
};
const handleDownloadPlan = async () => {
  if (!printRef.current) return;

  const canvas = await html2canvas(printRef.current, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`payment-plan-${activePaymentPlan?.title || 'download'}.pdf`);
};

// Enhanced Step 2 Component with Expandable Payment Plans
export function PaymentPlanCard({ 
  formData, 
  handleInputChange, 
  formatPrice, 
  totalAmount, 
  errors,
  paymentPlansData = [], // Accept API data as prop
  plansLoading = false,
  plansError = null
}) {
  const [activePaymentPlan, setActivePaymentPlan] = useState(null);
  const ref = useRef(null);
  const id = useId();
  const printRef = useRef();



  
  // Payment plan calculations using API data
  const calculatePaymentPlans = () => {
    if (!paymentPlansData || paymentPlansData.length === 0) {
      return getDefaultPaymentPlans();
    }

    const principal = totalAmount;

    return paymentPlansData
      .filter(plan => plan.active)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((plan, index) => {
        const minDownPayment = principal * (plan.minDownPaymentPercentage || 0.1);
        const isCash = plan.planType === 'cash';
        const isFlexible = plan.isFlexible;
        
        // Calculate monthly installment
        let monthlyInstallment = 0;
        let totalInterest = 0;
        
        if (!isCash && !isFlexible && plan.periodMonths > 0) {
          const principalAfterDown = principal - minDownPayment;
          totalInterest = principalAfterDown * (plan.interestRate || 0);
          monthlyInstallment = Math.round((principalAfterDown + totalInterest) / plan.periodMonths);
        }

        // Map plan type to icon and colors
        const getIconAndColors = (planType) => {
          switch (planType) {
            case 'cash':
              return {
                icon: <DollarSign className="w-6 h-6" />,
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                iconColor: 'text-green-600'
              };
            case 'installment':
              if ((plan.periodMonths || 0) <= 12) {
                return {
                  icon: <Calendar className="w-6 h-6" />,
                  bgColor: 'bg-blue-50',
                  borderColor: 'border-blue-200',
                  iconColor: 'text-blue-600'
                };
              } else {
                return {
                  icon: <Clock className="w-6 h-6" />,
                  bgColor: 'bg-purple-50',
                  borderColor: 'border-purple-200',
                  iconColor: 'text-purple-600'
                };
              }
            case 'flexible':
            default:
              return {
                icon: <TrendingUp className="w-6 h-6" />,
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                iconColor: 'text-orange-600'
              };
          }
        };

        const iconAndColors = getIconAndColors(plan.planType);

        return {
          id: plan.id?.toString() || `plan-${index}`,
          title: plan.name,
          description: plan.description,
          ...iconAndColors,
          ctaText: 'Select Plan',
          planData: plan,
          details: {
            principalAmount: principal,
            downPayment: isCash ? principal : minDownPayment,
            paymentPeriod: isFlexible ? 'Flexible' : (isCash ? 0 : plan.periodMonths),
            monthlyInstallment: isFlexible ? 'Variable' : (isCash ? 0 : monthlyInstallment),
            totalInterest: Math.round(totalInterest),
            benefits: Array.isArray(plan.benefits) ? plan.benefits : ['Contact us for details'],
            processingFee: principal * (plan.processingFeePercentage || 0),
            earlyPaymentDiscount: plan.earlyPaymentDiscount || 0,
            termsAndConditions: plan.termsAndConditions
          }
        };
      });
  };

  // Fallback function for default plans
  const getDefaultPaymentPlans = () => {
    const principal = totalAmount;
    const downPaymentPercentage = 0.1;
    const minDownPayment = principal * downPaymentPercentage;

    return [
      {
        id: 'cash',
        title: 'Cash Purchase',
        description: 'Full payment upfront',
        icon: <DollarSign className="w-6 h-6" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        ctaText: 'Select Plan',
        details: {
          principalAmount: principal,
          downPayment: principal,
          paymentPeriod: 0,
          monthlyInstallment: 0,
          totalInterest: 0,
          benefits: ['No interest charges', 'Immediate ownership', 'Best price advantage']
        }
      },
      {
        id: 'monthly12',
        title: '12 Month Plan',
        description: 'Pay over 12 months',
        icon: <Calendar className="w-6 h-6" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        ctaText: 'Select Plan',
        details: {
          principalAmount: principal,
          downPayment: minDownPayment,
          paymentPeriod: 12,
          monthlyInstallment: Math.round((principal - minDownPayment) / 12),
          totalInterest: 0,
          benefits: ['0% interest for 12 months', 'Low monthly payments', 'Quick ownership']
        }
      }
    ];
  };

  const paymentPlans = calculatePaymentPlans();

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActivePaymentPlan(null);
      }
    }

    if (activePaymentPlan) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activePaymentPlan]);

  useOutsideClick(ref, () => setActivePaymentPlan(null));

  const handlePlanSelect = (planId) => {
    handleInputChange({
      target: {
        name: 'paymentPlanId',
        value: planId,
        type: 'radio'
      }
    });
    setActivePaymentPlan(null);
  };

  const CloseIcon = () => (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Information</h2>
      
      {/* Payment Plans Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Choose Your Payment Plan
        </label>
        
        {plansLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading payment plans...</span>
          </div>
        ) : plansError ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Unable to load payment plans from server. Using default options.
              </p>
            </div>
          </div>
        ) : null}
        
        {/* Expandable Cards Modal */}
        <AnimatePresence>
          {activePaymentPlan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 h-full w-full z-50"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activePaymentPlan ? (
            <div className="fixed inset-0 grid place-items-center z-[100]">
              <motion.button
                key={`button-${activePaymentPlan.title}-${id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-8 w-8 shadow-lg"
                onClick={() => setActivePaymentPlan(null)}
              >
                <CloseIcon />
              </motion.button>
              
              <motion.div
                layoutId={`card-${activePaymentPlan.title}-${id}`}
                ref={ref}
                className="w-full max-w-2xl h-full md:h-fit md:max-h-[90%] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl m-4"
              >
                <div  className={`${activePaymentPlan.bgColor} ${activePaymentPlan.borderColor} border-b p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${activePaymentPlan.bgColor} rounded-full flex items-center justify-center ${activePaymentPlan.iconColor}`}>
                        {activePaymentPlan.icon}
                      </div>
                      <div>
                        <motion.h3
                          layoutId={`title-${activePaymentPlan.title}-${id}`}
                          className="text-2xl font-bold text-gray-900"
                        >
                          {activePaymentPlan.title}
                        </motion.h3>
                        <motion.p
                          layoutId={`description-${activePaymentPlan.description}-${id}`}
                          className="text-gray-600"
                        >
                          {activePaymentPlan.description}
                        </motion.p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-auto">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
            <div ref={printRef} className="p-6 space-y-6">
                    {/* Payment Details Table */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Principal Amount:</span>
                            <span className="font-semibold text-gray-900">
                              {formatPrice(activePaymentPlan.details.principalAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Down Payment:</span>
                            <span className="font-semibold text-green-600">
                              {formatPrice(activePaymentPlan.details.downPayment)}
                            </span>
                          </div>
                          {activePaymentPlan.details.processingFee > 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="text-gray-600">Processing Fee:</span>
                              <span className="font-semibold text-orange-600">
                                {formatPrice(activePaymentPlan.details.processingFee)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Payment Period:</span>
                            <span className="font-semibold text-gray-900">
                              {activePaymentPlan.details.paymentPeriod === 0 
                                ? 'One-time' 
                                : activePaymentPlan.details.paymentPeriod === 'Flexible'
                                ? 'Flexible'
                                : `${activePaymentPlan.details.paymentPeriod} months`}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Monthly Installment:</span>
                            <span className="font-semibold text-blue-600">
                              {activePaymentPlan.details.monthlyInstallment === 0 
                                ? 'N/A'
                                : activePaymentPlan.details.monthlyInstallment === 'Variable'
                                ? 'Variable'
                                : formatPrice(activePaymentPlan.details.monthlyInstallment)}
                            </span>
                          </div>
                          {activePaymentPlan.details.earlyPaymentDiscount > 0 && (
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="text-gray-600">Early Payment Discount:</span>
                              <span className="font-semibold text-green-600">
                                {(activePaymentPlan.details.earlyPaymentDiscount * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {activePaymentPlan.details.totalInterest > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Interest:</span>
                            <span className="font-semibold text-orange-600">
                              {formatPrice(activePaymentPlan.details.totalInterest)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Benefits */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Plan Benefits</h4>
                      <ul className="space-y-2">
                        {activePaymentPlan.details.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Terms and Conditions */}
                    {activePaymentPlan.details.termsAndConditions && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Terms & Conditions</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            {activePaymentPlan.details.termsAndConditions}
                          </p>
                        </div>
                      </div>
                    
                    )}
                </div>
                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                      <motion.button
                        layoutId={`button-${activePaymentPlan.title}-${id}`}
                        onClick={() => handlePlanSelect(activePaymentPlan.id)}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        Select This Plan
                      </motion.button>
                      <button
                          onClick={handleDownloadPlan}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          Download Plan PDF
                        </button>
                      <button
                        onClick={() => setActivePaymentPlan(null)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Compare Others
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
            </div>
          ) : null}
        </AnimatePresence>

        {/* Payment Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentPlans.map((plan) => (
            <motion.div
              layoutId={`card-${plan.title}-${id}`}
              key={`card-${plan.title}-${id}`}
              onClick={() => setActivePaymentPlan(plan)}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                formData.paymentPlanId === plan.id 
                  ? `${plan.borderColor} ${plan.bgColor}` 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div layoutId={`image-${plan.title}-${id}`}>
                    <div className={`w-12 h-12 ${plan.bgColor} rounded-lg flex items-center justify-center ${plan.iconColor}`}>
                      {plan.icon}
                    </div>
                  </motion.div>
                  <div>
                    <motion.h3
                      layoutId={`title-${plan.title}-${id}`}
                      className="font-semibold text-gray-900"
                    >
                      {plan.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${plan.description}-${id}`}
                      className="text-sm text-gray-600"
                    >
                      {plan.description}
                    </motion.p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {formData.paymentPlanId === plan.id && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <input
                    type="radio"
                    name="paymentPlanId"
                    value={plan.id}
                    checked={formData.paymentPlanId === plan.id}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                </div>
              </div>
              
              <motion.button
                layoutId={`button-${plan.title}-${id}`}
                className="mt-4 w-full px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 rounded-lg transition-colors"
              >
                View Details
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Down Payment Input */}
      {/* <div className="mt-6">
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
      </div> */}
    </div>
  );
}
