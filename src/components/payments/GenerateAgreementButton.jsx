'use client';

import { useState } from 'react';
import { PDFService } from '@/components/payments/PDFService'; // Fixed import path
import { FileText, Download, Loader2 } from 'lucide-react';

export default function GenerateAgreementButton({ 
  buyer,
  unit, 
  project,
  selectedPlan,
  financialSummary,
  className = ""
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePDF = async (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    
    if (!buyer || !unit || !project || !selectedPlan) {
      setError('Missing required data for agreement generation');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Prepare agreement data
      const agreementData = {
        buyer: {
          firstName: buyer.firstName,
          lastName: buyer.lastName,
          email: buyer.email,
          phoneNumber: buyer.phone || buyer.phoneNumber,
          nationalId: buyer.nationalId,
          kraPin: buyer.kraPin,
          city: buyer.city,
          state: buyer.state,
          postalCode: buyer.postalCode
        },
        unit: {
          id: unit.id,
          unitNumber: unit.unitNumber,
          price: unit.price,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          sqft: unit.sqft,
          floor: unit.floor
        },
        project: {
          id: project.id,
          name: project.name,
          location: project.address,
          estimatedCompletion: project.estimatedCompletion
        },
        paymentPlan: {
          id: selectedPlan.id,
          name: selectedPlan.name,
          durationMonths: selectedPlan.periodMonths,
          minDownPaymentPercentage: selectedPlan.minDownPaymentPercentage,
          interestRate: selectedPlan.interestRate || 0
        },
        financialSummary: {
          basePrice: unit.price,
          taxAmount: financialSummary.taxAmount,
          processingFee: financialSummary.processingFee,
          totalAmount: financialSummary.totalAmount,
          downPaymentAmount: financialSummary.downPaymentAmount,
          financingAmount: financialSummary.financingAmount,
          monthlyPayment: financialSummary.monthlyPayment
        }
      };
      console.log("Generating PDF with data:", agreementData);
      console.log("Selected Plan:",  financialSummary.monthlyPayment);
    
      const { blob, filename } = await PDFService.generateSaleAgreement(agreementData);

      // Download the PDF
      PDFService.downloadPDF(blob, filename);

      // Optional: Save to server
      // const uploadResponse = await PDFService.savePDFToServer(blob, filename);
      // console.log('Uploaded:', uploadResponse);

    } catch (error) {
      console.error('PDF generation failed:', error);
      setError('Failed to generate agreement. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

return (
  <span className="inline-block">
    <button
      type="button"
      onClick={handleGeneratePDF}
      disabled={isGenerating || !buyer || !unit || !project || !selectedPlan}
      className="flex items-center text-blue-600 hover:underline font-medium"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="inline w-3 h-3 mr-1" />
          <span>Terms and Conditions</span>
          <span className="mx-1">and</span>
          <span>Sales Agreement</span>
        </>
      )}
    </button>

    {error && (
      <p className="mt-1 text-xs text-red-600">{error}</p>
    )}
  </span>
);
}
