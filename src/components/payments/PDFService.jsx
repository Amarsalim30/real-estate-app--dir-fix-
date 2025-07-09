import { pdf } from '@react-pdf/renderer';
import SaleAgreementPDF from '@/components/payments/SaleAgreementPDF';

export class PDFService {
  static async generateSaleAgreement(data) {
    const {
      buyer,
      unit,
      project,
      paymentPlan,
      financialSummary
    } = data;

    // Hardcoded company information - can be moved to settings later
    const companyInfo = {
      name: 'Prime Real Estate Development Ltd',
      registrationNo: 'REG/2020/001234',
      address: '123 Business Plaza, Suite 456',
      city: 'Nairobi, Kenya',
      fullAddress: '123 Business Plaza, Suite 456, Westlands, Nairobi, Kenya',
      phone: '+254 700 123 456',
      email: 'info@primerealestate.co.ke',
      website: 'www.primerealestate.co.ke',
      authorizedSignatory: 'John Kamau - Managing Director',
      kraPin: 'A001234567P',
      logo: null // Can be added later
    };

    // Generate unique agreement number
    const agreementNumber = this.generateAgreementNumber(unit.id, buyer.firstName, buyer.lastName);

    try {
      const doc = SaleAgreementPDF({
        buyer,
        unit,
        project,
        paymentPlan,
        financialSummary,
        companyInfo,
        agreementNumber
      });

      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      
      return {
        blob,
        agreementNumber,
        filename: `Sale_Agreement_${agreementNumber}.pdf`
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate sale agreement PDF');
    }
  }

  static generateAgreementNumber(unitId, buyerFirstName, buyerLastName) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Create initials from buyer name
    const initials = `${buyerFirstName.charAt(0)}${buyerLastName.charAt(0)}`.toUpperCase();
    
    return `SA-${year}${month}${day}-U${unitId}-${initials}`;
  }

  static downloadPDF(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async savePDFToServer(blob, filename) {
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('type', 'sale_agreement');

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save PDF to server');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw error;
    }
  }
}
