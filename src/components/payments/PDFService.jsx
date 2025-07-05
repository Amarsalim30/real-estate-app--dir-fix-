import { pdf } from '@react-pdf/renderer';
import SaleAgreementPDF from '@/components/pdf/SaleAgreementPDF';

export class PDFService {
  static async generateSaleAgreement(data) {
    const {
      buyer,
      unit,
      project,
      paymentPlan,
      financialSummary,
      companyInfo
    } = data;

    // Generate unique agreement number
    const agreementNumber = this.generateAgreementNumber(unit.id, buyer.id);

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

  static generateAgreementNumber(unitId, buyerId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `SA-${year}${month}${day}-${unitId}-${buyerId}`;
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
