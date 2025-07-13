import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (value) => `KSh ${Number(value || 0).toLocaleString()}`;

const generateBuyerStatementPDF = (buyer, totals, transactions) => {
  const doc = new jsPDF();

  // === FUNCTION TO ADD FOOTER ON EACH PAGE ===
  const addFooter = (pageNumber, totalPages) => {
    const footerY = 280;
    
    // Footer line
    doc.setLineWidth(0.5);
    doc.line(14, footerY - 5, 195, footerY - 5);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your continued business with Amar Real Estate Ltd.', 14, footerY);
    doc.text(`Statement generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, footerY + 6);
    
    // Page numbering
    doc.text(`Page ${pageNumber} of ${totalPages}`, 180, footerY + 6);

    // Confidentiality notice
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('CONFIDENTIAL: This statement contains confidential information intended only for the named customer.', 105, footerY + 15, { align: 'center' });
  };

  // === COMPANY HEADER (FIRST PAGE ONLY) ===
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AMAR REAL ESTATE LTD.', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('P.O. Box 12345-00100, Nairobi, Kenya', 14, 28);
  doc.text('Tel: +254-700-123456 | Email: info@amar.co.ke', 14, 34);
  doc.text('PIN: P051234567A | Website: www.amar.co.ke', 14, 40);

  // === STATEMENT TITLE ===
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER ACCOUNT STATEMENT', 105, 55, { align: 'center' });

  // === STATEMENT PERIOD BOX ===
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(140, 65, 55, 20);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Statement Date:', 142, 72);
  doc.text('Period:', 142, 78);
  
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString(), 165, 72);
  doc.text('All Transactions', 165, 78);

  // === CUSTOMER DETAILS ===
  let currentY = 90;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER DETAILS:', 14, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const customerName = `${buyer.firstName} ${buyer.lastName}`;
  currentY += 7;
  
  doc.text(`Name: ${customerName}`, 14, currentY);
  currentY += 6;
  
  if (buyer.email) {
    doc.text(`Email: ${buyer.email}`, 14, currentY);
    currentY += 6;
  }
  
  if (buyer.phoneNumber || buyer.phone) {
    doc.text(`Phone: ${buyer.phoneNumber || buyer.phone}`, 14, currentY);
    currentY += 6;
  }
  
  if (buyer.address) {
    doc.text(`Address: ${buyer.address}`, 14, currentY);
    currentY += 6;
    
    if (buyer.city && buyer.state) {
      doc.text(`${buyer.city}, ${buyer.state} ${buyer.postalCode || ''}`, 14, currentY);
      currentY += 6;
    }
  }

  // === ACCOUNT SUMMARY ===
  currentY += 10;
  
  autoTable(doc, {
    startY: currentY,
    head: [['ACCOUNT SUMMARY', 'AMOUNT (KSh)']],
    body: [
      ['Total Invoiced', formatCurrency(totals.totalInvoiced)],
      ['Total Payments', formatCurrency(totals.totalPaid)],
      ['Outstanding Balance', formatCurrency(totals.outstandingBalance)]
    ],
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
      0: { cellWidth: 120, fontStyle: 'bold' },
      1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 20, bottom: 20 }
  });

  // === TRANSACTION DETAILS ===
  currentY = doc.lastAutoTable.finalY + 15;
  
  // Prepare transaction data with running balance
  let runningBalance = 0;
  const transactionData = transactions.map(tx => {
    const isDebit = tx.type === 'invoice' || tx.amount > 0;
    const amount = Math.abs(tx.amount);
    
    // Update running balance
    if (isDebit) {
      runningBalance += amount;
    } else {
      runningBalance -= amount;
    }
    
    return [
      new Date(tx.date).toLocaleDateString(),
      tx.type === 'invoice' ? 'Invoice' : 'Payment',
      tx.description || tx.reference || 'N/A',
      tx.reference || tx.invoiceNumber || 'N/A',
      isDebit ? formatCurrency(amount) : '-',
      !isDebit ? formatCurrency(amount) : '-',
      formatCurrency(runningBalance),
      tx.status || 'Completed'
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['DATE', 'TYPE', 'DESCRIPTION', 'REFERENCE', 'DEBIT (DR)', 'CREDIT (CR)', 'BALANCE', 'STATUS']],
    body: transactionData,
    styles: { 
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 18 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 20, halign: 'center' }
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    margin: { top: 20, bottom: 40 },
    didParseCell: function(data) {
      // Color coding for debit/credit columns
      if (data.column.index === 4 && data.cell.text[0] !== '-') { // Debit column
        data.cell.styles.textColor = [220, 53, 69]; // Red for debits
      }
      if (data.column.index === 5 && data.cell.text[0] !== '-') { // Credit column
        data.cell.styles.textColor = [40, 167, 69]; // Green for credits
      }
      // Balance column styling
      if (data.column.index === 6) {
        const balance = parseFloat(data.cell.text[0].replace(/[^\d.-]/g, ''));
        if (balance < 0) {
          data.cell.styles.textColor = [220, 53, 69]; // Red for negative balance
        } else {
          data.cell.styles.textColor = [40, 167, 69]; // Green for positive balance
        }
      }
    }
  });

  // === TOTALS SUMMARY ===
  currentY = doc.lastAutoTable.finalY + 10;
  
  // Check if we need a new page for totals
  if (currentY > 240) {
    doc.addPage();
    currentY = 20; // Start near top of new page
  }
  
  // Calculate total debits and credits
  const totalDebits = transactions
    .filter(tx => tx.type === 'invoice' || tx.amount > 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
  const totalCredits = transactions
    .filter(tx => tx.type === 'payment' || tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  autoTable(doc, {
    startY: currentY,
    head: [['TRANSACTION SUMMARY', 'DEBIT (DR)', 'CREDIT (CR)', 'NET BALANCE']],
    body: [[
      'TOTALS',
      formatCurrency(totalDebits),
      formatCurrency(totalCredits),
      formatCurrency(totalDebits - totalCredits)
    ]],
    styles: { 
      fontSize: 10,
      cellPadding: 5,
      fontStyle: 'bold'
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 93 },
      1: { cellWidth: 25, halign: 'right', textColor: [220, 53, 69] },
      2: { cellWidth: 25, halign: 'right', textColor: [40, 167, 69] },
      3: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
    },
    margin: { top: 20, bottom: 40 }
  });

  // === IMPORTANT NOTES ===
  currentY = doc.lastAutoTable.finalY + 15;
  
  // Check if we need a new page for notes
  if (currentY > 220) {
    doc.addPage();
    currentY = 20; // Start near top of new page
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT NOTES:', 14, currentY);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('• DR (Debit) represents amounts owed by customer (invoices, charges)', 14, currentY + 8);
  doc.text('• CR (Credit) represents payments received from customer', 14, currentY + 14);
  doc.text('• All amounts are in Kenya Shillings (KSh)', 14, currentY + 20);
  doc.text('• For any discrepancies, please contact our accounts department immediately', 14, currentY + 26);
  doc.text('• This statement is computer generated and does not require signature', 14, currentY + 32);

  // === ADD FOOTERS TO ALL PAGES ===
  const totalPages = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // === SAVE PDF ===
  const cleanCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Statement_${cleanCustomerName}_${dateStr}.pdf`;
  doc.save(filename);
};

export default generateBuyerStatementPDF;
