'use client';
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

import {
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Download,
  FileText
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

// PDF Content Component - Optimized for PDF generation
const PDFContent = ({ plan, formatPrice }) => (
  <div 
    style={{
      fontFamily: 'Arial, sans-serif',
      padding: '40px',
      backgroundColor: '#ffffff',
      color: '#000000',
      lineHeight: '1.6',
      fontSize: '14px'
    }}
  >
    {/* Header */}
    <div style={{ 
      textAlign: 'center', 
      marginBottom: '30px',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '20px'
    }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        margin: '0 0 10px 0',
        color: '#1f2937'
      }}>
        Payment Plan Details
      </h1>
      <h2 style={{ 
        fontSize: '20px', 
        color: '#4f46e5',
        margin: '0'
      }}>
        {plan.title}
      </h2>
      <p style={{ 
        fontSize: '16px', 
        color: '#6b7280',
        margin: '5px 0 0 0'
      }}>
        {plan.description}
      </p>
    </div>

    {/* Payment Summary */}
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold',
        marginBottom: '15px',
        color: '#1f2937',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '5px'
      }}>
        Payment Summary
      </h3>
      
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        marginBottom: '20px'
      }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Principal Amount:</td>
            <td style={{ padding: '10px 0', textAlign: 'right' }}>
              {formatPrice(plan.details.principalAmount)}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Down Payment:</td>
            <td style={{ padding: '10px 0', textAlign: 'right', color: '#059669' }}>
              {formatPrice(plan.details.downPayment)}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Payment Period:</td>
            <td style={{ padding: '10px 0', textAlign: 'right' }}>
              {plan.details.paymentPeriod === 0
                ? 'One-time Payment'
                : plan.details.paymentPeriod === 'Flexible'
                  ? 'Flexible Terms'
                  : `${plan.details.paymentPeriod} months`}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Monthly Installment:</td>
            <td style={{ padding: '10px 0', textAlign: 'right', color: '#2563eb' }}>
              {plan.details.monthlyInstallment === 0
                ? 'N/A'
                : plan.details.monthlyInstallment === 'Variable'
                  ? 'Variable Amount'
                  : formatPrice(plan.details.monthlyInstallment)}
            </td>
          </tr>
          {plan.details.totalInterest > 0 && (
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Total Interest:</td>
              <td style={{ padding: '10px 0', textAlign: 'right', color: '#dc2626' }}>
                {formatPrice(plan.details.totalInterest)}
              </td>
            </tr>
          )}
          {plan.details.processingFee > 0 && (
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Processing Fee:</td>
              <td style={{ padding: '10px 0', textAlign: 'right', color: '#ea580c' }}>
                {formatPrice(plan.details.processingFee)}
              </td>
            </tr>
          )}
          {plan.details.earlyPaymentDiscount > 0 && (
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px 0', fontWeight: 'bold' }}>Early Payment Discount:</td>
              <td style={{ padding: '10px 0', textAlign: 'right', color: '#059669' }}>
                {(plan.details.earlyPaymentDiscount * 100).toFixed(1)}%
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Benefits Section */}
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold',
        marginBottom: '15px',
        color: '#1f2937',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '5px'
      }}>
        Plan Benefits
      </h3>
      <ul style={{ 
        listStyle: 'none', 
        padding: '0',
        margin: '0'
      }}>
        {plan.details.benefits.map((benefit, index) => (
          <li key={index} style={{ 
            padding: '8px 0',
            borderBottom: index < plan.details.benefits.length - 1 ? '1px solid #f3f4f6' : 'none',
            position: 'relative',
            paddingLeft: '25px'
          }}>
            <span style={{
              position: 'absolute',
              left: '0',
              top: '12px',
              width: '6px',
              height: '6px',
              backgroundColor: '#059669',
              borderRadius: '50%'
            }}></span>
            {benefit}
          </li>
        ))}
      </ul>
    </div>

    {/* Terms and Conditions */}
    {plan.details.termsAndConditions && (
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          marginBottom: '15px',
          color: '#1f2937',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '5px'
        }}>
          Terms & Conditions
        </h3>
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          fontSize: '13px',
          lineHeight: '1.7'
        }}>
          {plan.details.termsAndConditions}
        </div>
      </div>
    )}

    {/* Footer */}
    <div style={{ 
      marginTop: '40px',
      paddingTop: '20px',
      borderTop: '2px solid #e5e7eb',
      textAlign: 'center',
      fontSize: '12px',
      color: '#6b7280'
    }}>
      <p style={{ margin: '0' }}>
        Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
      </p>
      <p style={{ margin: '5px 0 0 0' }}>
        This document contains confidential payment plan information.
      </p>
    </div>
  </div>
);

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
  const [isDownloading, setIsDownloading] = useState(false);
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
            termsAndConditions: plan.termsAndConditions || 'Standard terms and conditions apply. Please contact our sales team for detailed terms.'
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
          benefits: [
            'No interest charges',
            'Immediate ownership transfer',
            'Best price advantage',
            'No processing fees',
            'Priority customer support'
          ],
          termsAndConditions: 'Full payment required upon agreement signing. Property transfer completed within 30 days. All legal fees included in the purchase price.'
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
          benefits: [
            '0% interest for 12 months',
            'Low monthly payments',
            'Quick ownership transfer',
            'Flexible payment dates',
            'Early payment discounts available'
          ],
          termsAndConditions: 'Minimum 10% down payment required. Monthly payments due by 5th of each month. Late payment fee of 2% applies after 7 days. Property transfer upon completion of payments.'
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

  // Enhanced PDF download function
  const handleDownloadPlan = async () => {
    if (!activePaymentPlan) return;
    
    setIsDownloading(true);
    
    try {
      // Create a temporary container for PDF content
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = '#ffffff';
      
      // Create React element and render it
      const pdfContent = React.createElement(PDFContent, {
        plan: activePaymentPlan,
        formatPrice: formatPrice
      });
      
      // Use a simple innerHTML approach for better PDF generation
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #ffffff; color: #000000; line-height: 1.6; font-size: 14px;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">Payment Plan Details</h1>
            <h2 style="font-size: 20px; color: #4f46e5; margin: 0;">${activePaymentPlan.title}</h2>
            <p style="font-size: 16px; color: #6b7280; margin: 5px 0 0 0;">${activePaymentPlan.description}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Payment Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; font-weight: bold;">Principal Amount:</td>
                <td style="padding: 10px 0; text-align: right;">${formatPrice(activePaymentPlan.details.principalAmount)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; font-weight: bold;">Down Payment:</td>
                <td style="padding: 10px 0; text-align: right; color: #059669;">${formatPrice(activePaymentPlan.details.downPayment)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; font-weight: bold;">Payment Period:</td>
                <td style="padding: 10px 0; text-align: right;">${
                  activePaymentPlan.details.paymentPeriod === 0
                    ? 'One-time Payment'
                    : activePaymentPlan.details.paymentPeriod === 'Flexible'
                      ? 'Flexible Terms'
                      : `${activePaymentPlan.details.paymentPeriod} months`
                }</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; font-weight: bold;">Monthly Installment:</td>
                <td style="padding: 10px 0; text-align: right; color: #2563eb;">${
                  activePaymentPlan.details.monthlyInstallment === 0
                    ? 'N/A'
                    : activePaymentPlan.details.monthlyInstallment === 'Variable'
                      ? 'Variable Amount'
                      : formatPrice(activePaymentPlan.details.monthlyInstallment)
                }</td>
              </tr>
              ${activePaymentPlan.details.totalInterest > 0 ? `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold;">Total Interest:</td>
                  <td style="padding: 10px 0; text-align: right; color: #dc2626;">${formatPrice(activePaymentPlan.details.totalInterest)}</td>
                </tr>
              ` : ''}
              ${activePaymentPlan.details.processingFee > 0 ? `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold;">Processing Fee:</td>
                  <td style="padding: 10px 0; text-align: right; color: #ea580c;">${formatPrice(activePaymentPlan.details.processingFee)}</td>
                </tr>
              ` : ''}
              ${activePaymentPlan.details.earlyPaymentDiscount > 0 ? `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold;">Early Payment Discount:</td>
                  <td style="padding: 10px 0; text-align: right; color: #059669;">${(activePaymentPlan.details.earlyPaymentDiscount * 100).toFixed(1)}%</td>
                </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Plan Benefits</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${activePaymentPlan.details.benefits.map((benefit, index) => `
                <li style="padding: 8px 0; border-bottom: ${index < activePaymentPlan.details.benefits.length - 1 ? '1px solid #f3f4f6' : 'none'}; position: relative; padding-left: 25px;">
                  <span style="position: absolute; left: 0; top: 12px; width: 6px; height: 6px; background-color: #059669; border-radius: 50%;"></span>
                  ${benefit}
                </li>
              `).join('')}
            </ul>
          </div>
          
          ${activePaymentPlan.details.termsAndConditions ? `
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Terms & Conditions</h3>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; font-size: 13px; line-height: 1.7;">
                ${activePaymentPlan.details.termsAndConditions}
              </div>
            </div>
          ` : ''}
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p style="margin: 5px 0 0 0;">This document contains confidential payment plan information.</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(tempContainer);
      
      // Generate canvas with higher quality settings
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: false,
        removeContainer: true,
        width: 800,
        height: tempContainer.scrollHeight,
        windowWidth: 800,
        windowHeight: tempContainer.scrollHeight
      });
      
      // Clean up temporary container
      document.body.removeChild(tempContainer);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Save PDF with descriptive filename
      const filename = `payment-plan-${activePaymentPlan.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
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
                <div className={`${activePaymentPlan.bgColor} ${activePaymentPlan.borderColor} border-b p-6`}>
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

                    {/* Enhanced Benefits Section */}
                    <div className="bg-green-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        Plan Benefits
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {activePaymentPlan.details.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm leading-relaxed">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Terms and Conditions */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-2" />
                        Terms & Conditions
                      </h4>
                      <div className="bg-white border border-blue-200 rounded-lg p-4">
                        <div className="prose prose-sm max-w-none">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {activePaymentPlan.details.termsAndConditions}
                          </p>
                        </div>
                      </div>
                      
                      {/* Additional Terms Notice */}
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-yellow-800">
                            <strong>Important:</strong> These terms are subject to change. 
                            Final terms will be provided in the official purchase agreement. 
                            Please consult with our sales team for any clarifications.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <motion.button
                        layoutId={`button-${activePaymentPlan.title}-${id}`}
                        onClick={() => handlePlanSelect(activePaymentPlan.id)}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Select This Plan</span>
                      </motion.button>
                      
                      <button
                        onClick={handleDownloadPlan}
                        disabled={isDownloading}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download PDF</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setActivePaymentPlan(null)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>Compare Others</span>
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
                    
                    {/* Quick Preview */}
                    <div className="mt-2 text-xs text-gray-500">
                      <div>Down: {formatPrice(plan.details.downPayment)}</div>
                      {plan.details.monthlyInstallment > 0 && (
                        <div>Monthly: {formatPrice(plan.details.monthlyInstallment)}</div>
                      )}
                    </div>
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
                className="mt-4 w-full px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>View Details</span>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Error Display */}
        {errors.paymentPlanId && (
          <div className="mt-2 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.paymentPlanId}</span>
          </div>
        )}
      </div>

      {/* Additional Financial Information */}
      {formData.paymentPlanId && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h4 className="font-semibold text-blue-900 mb-2">Selected Plan Summary</h4>
          {(() => {
            const selectedPlan = paymentPlans.find(plan => plan.id === formData.paymentPlanId);
            if (!selectedPlan) return null;
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Plan:</span>
                  <span className="font-medium text-blue-900">{selectedPlan.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Down Payment:</span>
                  <span className="font-medium text-blue-900">
                    {formatPrice(selectedPlan.details.downPayment)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Monthly:</span>
                  <span className="font-medium text-blue-900">
                    {selectedPlan.details.monthlyInstallment === 0
                      ? 'N/A'
                      : selectedPlan.details.monthlyInstallment === 'Variable'
                        ? 'Variable'
                        : formatPrice(selectedPlan.details.monthlyInstallment)}
                  </span>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Hidden element for PDF generation reference */}
      <div ref={printRef} style={{ display: 'none' }}>
        {activePaymentPlan && (
          <PDFContent plan={activePaymentPlan} formatPrice={formatPrice} />
        )}
      </div>
    </div>
  );
}
