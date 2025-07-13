import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (value) => `Ksh ${Number(value || 0).toLocaleString()}`;

const generateBuyerReportPDF = (buyers) => {
  const doc = new jsPDF();

  doc.text('Buyer Summary Report', 14, 16);

  autoTable(doc, {
    startY: 22,
    head: [['Name', 'Contact', 'Properties', 'Total Paid', 'Outstanding', 'Status']],
    body: buyers.map(b => [
      `${b.firstName} ${b.lastName}`,
      `${b.phoneNumber}\n${b.email}`,
      b.stats?.properties ?? 0,
      formatCurrency(b.stats?.totalPaid),
      formatCurrency(b.stats?.outstanding),
      b.stats?.outstanding > 0 ? 'Outstanding' : 'Current'
    ]),
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: {
      fillColor: [41, 128, 185], // Blue
      textColor: 255,
      fontStyle: 'bold'
    }
  });

  doc.save('buyer-report.pdf');
};

export default generateBuyerReportPDF;
