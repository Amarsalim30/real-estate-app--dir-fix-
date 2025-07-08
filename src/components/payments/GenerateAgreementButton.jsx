'use client';
import { useState } from 'react';
import { PDFService } from '@/components/payments/PDFService';
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
  e.preventDefault();
  e.stopPropagation();
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
            estimatedCompletion: project.CompletionDate || project.targetCompletionDate
            },
        paymentPlan: {
          id: selectedPlan.id,
          name: selectedPlan.name,
          durationMonths: selectedPlan.durationMonths,
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
      console.log("buyer",buyer);
      console.log("unit",unit);
      console.log("project",project);
      console.log("selectedPlan",selectedPlan);
      console.log("financialSummary",financialSummary);
      
const { blob, filename } = await PDFService.generateSaleAgreement(agreementData);

if (!blob) {
  throw new Error("PDF blob is undefined. Check generation logic.");
}

const blobUrl = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = blobUrl;
link.setAttribute('download', filename);
document.body.appendChild(link);
link.click();
link.remove();
window.URL.revokeObjectURL(blobUrl);

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
      className={`inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded transition-colors text-xs ${className}`}
      onClick={handleGeneratePDF}
      disabled={isGenerating || !buyer || !unit || !project || !selectedPlan}
    >
        {isGenerating ? (
  <>
    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
    Generating...
  </>
) : (
  <>
    <FileText className="w-3 h-3 mr-1" />
    Purchase Agreement
  </>
)}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </span>
  );
}
