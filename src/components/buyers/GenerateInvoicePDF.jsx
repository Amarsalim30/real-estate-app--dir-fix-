import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (value) => `KSh ${Number(value || 0).toLocaleString()}`;

const generateInvoicePDF = (invoice, buyer, unit) => {
  const doc = new jsPDF();
  
  // === COMPANY HEADER WITH LOGO SPACE ===
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AMAR REAL ESTATE LTD.', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('P.O. Box 12345-00100, Nairobi, Kenya', 14, 28);
  doc.text('Tel: +254-700-123456 | Email: info@amar.co.ke', 14, 34);
  doc.text('PIN: P051234567A | Website: www.amar.co.ke', 14, 40);

  // === INVOICE TITLE ===
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 105, 55, { align: 'center' });

  // === INVOICE DETAILS BOX ===
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(140, 65, 55, 25);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No:', 142, 72);
  doc.text('Date:', 142, 78);
  doc.text('Due Date:', 142, 84);
  
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNumber || 'N/A', 165, 72);
  doc.text(new Date(invoice.issueDate || invoice.issuedDate).toLocaleDateString(), 165, 78);
  doc.text(new Date(invoice.dueDate).toLocaleDateString(), 165, 84);

  // === BILL TO SECTION ===
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 14, 75);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const buyerName = buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Valued Customer';
  let yPosition = 82;
  
  doc.text(buyerName, 14, yPosition);
  yPosition += 6;
  
  if (buyer?.email) {
    doc.text(`Email: ${buyer.email}`, 14, yPosition);
    yPosition += 6;
  }
  
  if (buyer?.phone) {
    doc.text(`Phone: ${buyer.phone}`, 14, yPosition);
    yPosition += 6;
  }
  
  if (buyer?.address) {
    doc.text(buyer.address, 14, yPosition);
    yPosition += 6;
    
    if (buyer?.city && buyer?.state) {
      doc.text(`${buyer.city}, ${buyer.state} ${buyer.postalCode || ''}`, 14, yPosition);
      yPosition += 6;
    }
  }

  // === ITEMS TABLE ===
  const tableStartY = Math.max(yPosition + 10, 110);
  
  // Get property details
  const propertyDescription = unit ? 
    `${unit.projectName || 'Property Purchase'} - Unit ${unit.unitNumber || 'N/A'}` : 
    'Property Purchase';
  
  const unitPrice = unit?.price || invoice.totalAmount || 0;
  const quantity = 1;
  const subtotal = invoice.subtotal || unitPrice;
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['DESCRIPTION', 'QTY', 'UNIT PRICE', 'AMOUNT']],
    body: [[
      propertyDescription,
      quantity.toString(),
      formatCurrency(unitPrice),
      formatCurrency(subtotal)
    ]],
    styles: { 
      fontSize: 10,
      cellPadding: 5
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  });

  // === TOTALS SECTION ===
  const summaryStartY = doc.lastAutoTable.finalY + 15;
  const rightAlign = 195;
  const labelX = 140;
  
  // Calculate totals
  const taxRate = 0.16; // 16% VAT
  const taxAmount = invoice.taxAmount || (subtotal * taxRate);
  const totalAmount = invoice.totalAmount || (subtotal + taxAmount);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Subtotal
  doc.text('Subtotal:', labelX, summaryStartY);
  doc.text(formatCurrency(subtotal), rightAlign, summaryStartY, { align: 'right' });
  
  // Tax
  doc.text('VAT (16%):', labelX, summaryStartY + 8);
  doc.text(formatCurrency(taxAmount), rightAlign, summaryStartY + 8, { align: 'right' });
  
  // Draw line above total
  doc.setLineWidth(0.5);
  doc.line(labelX, summaryStartY + 12, rightAlign, summaryStartY + 12);
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', labelX, summaryStartY + 20);
  doc.text(formatCurrency(totalAmount), rightAlign, summaryStartY + 20, { align: 'right' });

  // === PAYMENT INFORMATION ===
  const paymentInfoY = summaryStartY + 35;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INFORMATION', 14, paymentInfoY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Bank: Equity Bank Kenya Limited', 14, paymentInfoY + 8);
  doc.text('Account Name: Amar Real Estate Ltd.', 14, paymentInfoY + 14);
  doc.text('Account Number: 0123456789', 14, paymentInfoY + 20);
  doc.text('Branch: Westlands Branch', 14, paymentInfoY + 26);
  doc.text('Swift Code: EQBLKENA', 14, paymentInfoY + 32);

  // === TERMS AND CONDITIONS ===
  const termsY = paymentInfoY + 45;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS', 14, termsY);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Payment is due within 30 days of invoice date.', 14, termsY + 8);
  doc.text('2. Late payments may incur additional charges.', 14, termsY + 14);
  doc.text('3. All payments should reference the invoice number.', 14, termsY + 20);
  doc.text('4. For any queries, please contact our accounts department.', 14, termsY + 26);

  // === FOOTER ===
  const footerY = 280;
  
  // Footer line
  doc.setLineWidth(0.5);
  doc.line(14, footerY - 5, 195, footerY - 5);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 14, footerY);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, footerY + 6);
  
  // Right side footer
  doc.text('Authorized Signature: ________________________', 120, footerY, { align: 'left' });
  doc.text('Date: ________________________', 120, footerY + 6, { align: 'left' });

  // === WATERMARK FOR UNPAID INVOICES ===
  if (invoice.status && invoice.status.toLowerCase() !== 'paid') {
    doc.setFontSize(50);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'bold');
    
    // Rotate and add watermark
    doc.text('UNPAID', 105, 150, {
      align: 'center',
      angle: 45
    });
    
    // Reset color
    doc.setTextColor(0, 0, 0);
  }

  // === SAVE PDF ===
  const cleanBuyerName = buyerName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Invoice_${invoice.invoiceNumber}_${cleanBuyerName}.pdf`;
  doc.save(filename);
};

export default generateInvoicePDF;
