import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { formatPrice } from '@/utils/format';

// Register fonts (optional - you can use default fonts)
// Font.register({
//   family: 'Roboto',
//   fonts: [
//     { src: '/fonts/Roboto-Regular.ttf' },
//     { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
//   ]
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#2c3e50',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
    paddingBottom: 25,
    borderBottomWidth: 3,
    borderBottomColor: '#1e40af',
    borderBottomStyle: 'solid',
  },
  
  logoSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '40%',
  },
  
  logo: {
    width: 100,
    height: 75,
    marginBottom: 10,
  },
  
  companyInfo: {
    textAlign: 'right',
    fontSize: 10,
    width: '60%',
    paddingLeft: 20,
  },
  
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  companyDetails: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  
  // Title Styles
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 2,
    paddingVertical: 10,
  },
  
  agreementInfo: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 10,
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 5,
  },
  
  // Section Styles
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 25,
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
  },
  
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 15,
    color: '#374151',
  },
  
  section: {
    marginBottom: 20,
  },
  
  // Party Information Styles
  partyBox: {
    backgroundColor: '#f8fafc',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#1e40af',
  },
  
  partyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e293b',
    textTransform: 'uppercase',
  },
  
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  
  infoLabel: {
    width: '35%',
    fontWeight: 'bold',
    color: '#475569',
    fontSize: 10,
  },
  
  infoValue: {
    width: '65%',
    color: '#1e293b',
    fontSize: 10,
  },
  
  // Property Details Styles
  propertyBox: {
    backgroundColor: '#fef3c7',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  
  highlightValue: {
    backgroundColor: '#fbbf24',
    padding: 4,
    borderRadius: 3,
    fontWeight: 'bold',
    color: '#92400e',
  },
  
  // Table Styles
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 20,
    borderRadius: 5,
  },
  
   tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  
  tableHeader: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  tableHeaderAlt: {
    backgroundColor: '#f1f5f9',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#d1d5db',
    padding: 10,
    justifyContent: 'center',
  },
  
  tableColWide: {
    width: '40%',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#d1d5db',
    padding: 10,
    justifyContent: 'center',
  },
  
  tableColNarrow: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#d1d5db',
    padding: 10,
    justifyContent: 'center',
  },
  
  tableCell: {
    fontSize: 9,
    textAlign: 'center',
    color: '#374151',
  },
  
  tableCellHeader: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  
  tableCellBold: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  
  // Payment Plan Styles
  paymentPlanBox: {
    backgroundColor: '#ecfdf5',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  
  // Terms and Conditions Styles
  termNumber: {
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    fontSize: 12,
  },
  
  termText: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 8,
    textAlign: 'justify',
    color: '#374151',
    paddingLeft: 15,
  },
  
  termSubText: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 6,
    textAlign: 'justify',
    color: '#4b5563',
    paddingLeft: 25,
  },
  
  // Signature Styles
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
    paddingTop: 30,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  
  signatureBox: {
    width: '45%',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
  },
  
  signatureLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
    marginBottom: 8,
    height: 50,
  },
  
  signatureLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  signatureDetails: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 3,
  },
  
  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#64748b',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
    backgroundColor: '#f8fafc',
    padding: 15,
  },
  
  // Watermark Styles
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 80,
    color: '#f1f5f9',
    opacity: 0.3,
    zIndex: -1,
    fontWeight: 'bold',
  },
  
  // Utility Styles
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  bold: {
    fontWeight: 'bold',
  },
  
  italic: {
    fontStyle: 'italic',
  },
    // Status and Alert Styles
  alertBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  
  successBox: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  
  // Page Break
  pageBreak: {
    marginTop: 20,
    marginBottom: 20,
  },
});

const SaleAgreementPDF = ({ 
  buyer, 
  unit, 
  project, 
  paymentPlan, 
  financialSummary,
  companyInfo,
  agreementNumber 
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate monthly payment if not provided
  const monthlyPayment = financialSummary.monthlyPayment || 
    (financialSummary.financingAmount / paymentPlan.durationMonths);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>CONFIDENTIAL</Text>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            {companyInfo?.logo && (
              <Image style={styles.logo} src={companyInfo.logo} />
            )}
            <Text style={styles.companyName}>{companyInfo.name}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyDetails}>{companyInfo.address}</Text>
            <Text style={styles.companyDetails}>{companyInfo.city}</Text>
            <Text style={styles.companyDetails}>Phone: {companyInfo.phone}</Text>
            <Text style={styles.companyDetails}>Email: {companyInfo.email}</Text>
            {companyInfo.website && <Text style={styles.companyDetails}>Web: {companyInfo.website}</Text>}
            <Text style={styles.companyDetails}>KRA PIN: {companyInfo.kraPin}</Text>
            <Text style={styles.companyDetails}>Reg No: {companyInfo.registrationNo}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.mainTitle}>Property Sale Agreement</Text>
        <View style={styles.agreementInfo}>
          <Text style={styles.bold}>Agreement Number: {agreementNumber}</Text>
          <Text>Date of Agreement: {currentDate}</Text>
          <Text style={styles.italic}>This agreement is legally binding upon execution by both parties</Text>
        </View>

        {/* Parties Section */}
        <Text style={styles.sectionTitle}>Contracting Parties</Text>
        
        <View style={styles.partyBox}>
          <Text style={styles.partyTitle}>SELLER / DEVELOPER</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Company Name:</Text>
            <Text style={styles.infoValue}>{companyInfo.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration Number:</Text>
            <Text style={styles.infoValue}>{companyInfo.registrationNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>KRA PIN:</Text>
            <Text style={styles.infoValue}>{companyInfo.kraPin}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Physical Address:</Text>
            <Text style={styles.infoValue}>{companyInfo.fullAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact Information:</Text>
            <Text style={styles.infoValue}>{companyInfo.phone} | {companyInfo.email}</Text>
          </View>
        </View>

        <View style={styles.partyBox}>
          <Text style={styles.partyTitle}>BUYER / PURCHASER</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Legal Name:</Text>
            <Text style={styles.infoValue}>{buyer.firstName} {buyer.lastName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>National ID Number:</Text>
            <Text style={styles.infoValue}>{buyer.nationalId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>KRA PIN Number:</Text>
            <Text style={styles.infoValue}>{buyer.kraPin}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number:</Text>
            <Text style={styles.infoValue}>{buyer.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Address:</Text>
            <Text style={styles.infoValue}>{buyer.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Residential Address:</Text>
            <Text style={styles.infoValue}>{buyer.city}, {buyer.state} {buyer.postalCode}</Text>
          </View>
        </View>

        {/* Property Details */}
        <Text style={styles.sectionTitle}>Property Specifications</Text>
        <View style={styles.propertyBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Development Project:</Text>
            <Text style={[styles.infoValue, styles.bold]}>{project.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Unit Identification:</Text>
            <Text style={[styles.infoValue, styles.highlightValue]}>Unit {unit.unitNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Property Type:</Text>
            <Text style={styles.infoValue}>{unit.bedrooms} Bedroom, {unit.bathrooms} Bathroom Apartment</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Floor Area:</Text>
            <Text style={styles.infoValue}>{unit.sqft?.toLocaleString()} Square Feet</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Floor Level:</Text>
            <Text style={styles.infoValue}>{unit.floor}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Project Location:</Text>
            <Text style={styles.infoValue}>{project.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estimated Completion:</Text>
            <Text style={styles.infoValue}>{project.estimatedCompletion || 'As per construction schedule'}</Text>
          </View>
        </View>

        {/* Financial Summary */}
        <Text style={styles.sectionTitle}>Financial Breakdown</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColWide}>
              <Text style={styles.tableCellHeader}>Description</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCellHeader}>Amount (KES)</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCellHeader}>Percentage</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCellHeader}>Notes</Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={styles.tableColWide}>
              <Text style={styles.tableCell}>Base Unit Price</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCell}>{formatPrice(financialSummary.basePrice)}</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCell}>Base</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCell}>As specified</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableColWide}>
              <Text style={styles.tableCell}>Government Taxes & Fees</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCell}>{formatPrice(financialSummary.taxAmount)}</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCell}>8.0%</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCell}>Statutory</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableColWide}>
              <Text style={styles.tableCell}>Processing & Admin Fee</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCell}>{formatPrice(financialSummary.processingFee)}</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCell}>Fixed</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCell}>One-time</Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableHeaderAlt]}>
            <View style={styles.tableColWide}>
              <Text style={styles.tableCellBold}>TOTAL PURCHASE PRICE</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCellBold}>{formatPrice(financialSummary.totalAmount)}</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCellBold}>100%</Text>
            </View>
            <View style={styles.tableColNarrow}>
              <Text style={styles.tableCellBold}>Final</Text>
            </View>
          </View>
        </View>

        {/* Payment Plan */}
        <Text style={styles.sectionTitle}>Payment Plan Structure</Text>
        <View style={styles.paymentPlanBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Selected Payment Plan:</Text>
            <Text style={[styles.infoValue, styles.bold, styles.highlightValue]}>{paymentPlan.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Duration:</Text>
            <Text style={styles.infoValue}>{paymentPlan.durationMonths} months</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Initial Down Payment:</Text>
            <Text style={[styles.infoValue, styles.bold]}>
              {formatPrice(financialSummary.downPaymentAmount)} ({(paymentPlan.minDownPaymentPercentage * 100)}%)
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Financing Amount:</Text>
            <Text style={styles.infoValue}>{formatPrice(financialSummary.financingAmount)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly Installment:</Text>
            <Text style={[styles.infoValue, styles.bold]}>{formatPrice(monthlyPayment)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Interest Rate:</Text>
            <Text style={styles.infoValue}>{paymentPlan.interestRate || 0}% per annum</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.tableCell, styles.bold]}>Payment Schedule Summary</Text>
          <Text style={styles.tableCell}>
            • Down Payment: Due within 7 days of agreement signing
          </Text>
          <Text style={styles.tableCell}>
            • Monthly Payments: {paymentPlan.durationMonths} installments of {formatPrice(monthlyPayment)}
          </Text>
          <Text style={styles.tableCell}>
            • Final Payment: Upon property completion and handover
          </Text>
        </View>
      </Page>

      {/* Second Page - Terms and Conditions */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.mainTitle}>Terms and Conditions</Text>

        <Text style={styles.termNumber}>1. PAYMENT OBLIGATIONS</Text>
        <Text style={styles.termText}>
          1.1. The Buyer agrees to pay the total purchase price of {formatPrice(financialSummary.totalAmount)} according to the "{paymentPlan.name}" payment plan as outlined in this agreement.
        </Text>
        <Text style={styles.termText}>
          1.2. The initial down payment of {formatPrice(financialSummary.downPaymentAmount)} must be paid within seven (7) calendar days of signing this agreement.
        </Text>
        <Text style={styles.termText}>
          1.3. Monthly installments of {formatPrice(monthlyPayment)} are due on the same calendar date each month for {paymentPlan.durationMonths} consecutive months.
        </Text>
        <Text style={styles.termText}>
          1.4. Late payment penalty of 2% per month will be applied to any overdue amounts after a 7-day grace period.
        </Text>
        <Text style={styles.termText}>
          1.5. All payments must be made to {companyInfo.name} through officially designated payment channels only.
        </Text>

        <Text style={styles.termNumber}>2. PROPERTY DELIVERY & COMPLETION</Text>
        <Text style={styles.termText}>
          2.1. The property will be delivered upon completion of construction and full settlement of the purchase price.
        </Text>
        <Text style={styles.termText}>
          2.2. Estimated completion date: {project.estimatedCompletion || 'To be determined based on construction progress and regulatory approvals'}.
        </Text>
        <Text style={styles.termText}>
          2.3. The Seller will provide thirty (30) days written notice before property handover and final inspection.
        </Text>
        <Text style={styles.termText}>
          2.4. Property handover includes all fixtures, fittings, and amenities as specified in the unit description and approved plans.
        </Text>
        <Text style={styles.termText}>
          2.5. The Buyer has the right to conduct a pre-handover inspection and request rectification of any defects or non-conformities.
        </Text>

        <Text style={styles.termNumber}>3. TITLE TRANSFER & OWNERSHIP</Text>
        <Text style={styles.termText}>
          3.1. Legal title deed will be processed and transferred to the Buyer upon full payment of the purchase price and completion of the property.
        </Text>
        <Text style={styles.termText}>
          3.2. All legal fees for title transfer, including but not limited to stamp duty, registration fees, and legal documentation costs, shall be borne by the Buyer.
        </Text>
        <Text style={styles.termText}>
          3.3. The property shall remain registered under the Seller's name until full payment is completed and title transfer procedures are finalized.
        </Text>
        <Text style={styles.termText}>
          3.4. The Seller guarantees clear, marketable, and unencumbered title to the property, free from any liens or legal disputes.
        </Text>
        <Text style={styles.termText}>
          3.5. Title transfer process will commence within thirty (30) days of final payment and property handover.
        </Text>

        <Text style={styles.termNumber}>4. DEFAULT & REMEDIAL ACTIONS</Text>
        <Text style={styles.termText}>
          4.1. If the Buyer defaults on payment for more than ninety (90) consecutive days, the Seller may terminate this agreement after providing thirty (30) days written notice.
        </Text>
        <Text style={styles.termText}>
          4.2. Upon termination due to Buyer's default, the Seller may retain up to twenty percent (20%) of total payments made as liquidated damages for administrative costs and opportunity loss.
        </Text>
        <Text style={styles.termText}>
          4.3. The Buyer may cure any default by paying all outstanding amounts plus applicable penalties and charges within the notice period.
        </Text>
        <Text style={styles.termText}>
          4.4. In case of Seller's default in delivery beyond the agreed timeline (excluding force majeure events), the Buyer may claim full refund of payments made plus interest at prevailing Central Bank of Kenya rates.
        </Text>
        <Text style={styles.termText}>
          4.5. Both parties agree to attempt good faith negotiations before pursuing legal remedies for any defaults.
        </Text>

        <Text style={styles.termNumber}>5. CONSTRUCTION STANDARDS & QUALITY ASSURANCE</Text>
        <Text style={styles.termText}>
          5.1. The property will be constructed in accordance with approved architectural plans, engineering specifications, and applicable building codes and regulations.
        </Text>
        <Text style={styles.termText}>
          5.2. The Seller provides a comprehensive warranty against structural defects for twelve (12) months from the date of property handover.
        </Text>
        <Text style={styles.termText}>
          5.3. Minor variations in finishes, fittings, and materials may occur due to availability, provided equivalent quality standards are maintained.
        </Text>
        <Text style={styles.termText}>
          5.4. The Buyer has the right to inspect construction progress at reasonable intervals with prior notice to the Seller.
        </Text>
        <Text style={styles.termText}>
          5.5. Any material changes to approved plans must be communicated to and approved by the Buyer in writing.
        </Text>

        <Text style={styles.termNumber}>6. INSURANCE & RISK MANAGEMENT</Text>
        <Text style={styles.termText}>
          6.1. The Seller shall maintain comprehensive construction and liability insurance on the property during the entire construction period.
        </Text>
        <Text style={styles.termText}>
          6.2. Upon handover, the Buyer becomes responsible for obtaining and maintaining adequate property insurance coverage.
        </Text>
        <Text style={styles.termText}>
          6.3. Risk of loss or damage transfers to the Buyer upon completion of handover procedures and key transfer.
        </Text>
        <Text style={styles.termText}>
          6.4. Common area maintenance charges and service fees, if applicable, shall be governed by the project's homeowners association guidelines.
        </Text>

        <Text style={styles.termNumber}>7. FORCE MAJEURE & UNFORESEEN CIRCUMSTANCES</Text>
        <Text style={styles.termText}>
          7.1. Neither party shall be held liable for delays or non-performance caused by circumstances beyond their reasonable control.
        </Text>
        <Text style={styles.termText}>
          7.2. Force majeure events include but are not limited to: natural disasters, government actions, pandemics, material shortages, labor strikes, and regulatory changes.
        </Text>
        <Text style={styles.termText}>
          7.3. The affected party must provide written notice within thirty (30) days of such circumstances arising, including expected duration and mitigation measures.
        </Text>
        <Text style={styles.termText}>
          7.4. Construction timelines may be extended by the duration of force majeure events without penalty to either party.
        </Text>

        <Text style={styles.termNumber}>8. DISPUTE RESOLUTION & GOVERNING LAW</Text>
        <Text style={styles.termText}>
          8.1. This agreement shall be governed by and construed in accordance with the laws of the Republic of Kenya.
        </Text>
        <Text style={styles.termText}>
          8.2. Any disputes arising from this agreement shall first be resolved through good faith negotiations between the parties within sixty (60) days.
        </Text>
        <Text style={styles.termText}>
          8.3. Unresolved disputes shall be settled through binding arbitration in Nairobi, Kenya, under the Arbitration Act (Cap 49) of the Laws of Kenya.
        </Text>
        <Text style={styles.termText}>
          8.4. The arbitration shall be conducted by a single arbitrator mutually agreed upon by both parties, or appointed by the Chartered Institute of Arbitrators (Kenya Branch).
        </Text>
        <Text style={styles.termText}>
          8.5. Arbitration costs shall be borne equally by both parties unless the arbitrator determines otherwise.
        </Text>

        <Text style={styles.termNumber}>9. GENERAL PROVISIONS</Text>
        <Text style={styles.termText}>
          9.1. This agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements.
        </Text>
        <Text style={styles.termText}>
          9.2. Any amendments or modifications must be in writing and signed by both parties to be legally binding.
        </Text>
        <Text style={styles.termText}>
          9.3. If any provision of this agreement is found to be invalid or unenforceable, the remainder shall remain in full force and effect.
        </Text>
        <Text style={styles.termText}>
          9.4. This agreement shall be binding upon the heirs, successors, and assigns of both parties.
        </Text>
        <Text style={styles.termText}>
          9.5. All notices required under this agreement must be in writing and delivered to the addresses specified herein.
        </Text>

        <View style={styles.pageBreak}>
          <View style={styles.successBox}>
            <Text style={[styles.tableCell, styles.bold]}>AGREEMENT EXECUTION</Text>
            <Text style={styles.tableCell}>
              By signing below, both parties acknowledge that they have read, understood, and agree to be bound by all terms and conditions set forth in this agreement.
            </Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>BUYER'S SIGNATURE</Text>
            <Text style={styles.signatureDetails}>
              {buyer.firstName} {buyer.lastName}
            </Text>
            <Text style={styles.signatureDetails}>
              National ID: {buyer.nationalId}
            </Text>
            <Text style={styles.signatureDetails}>
              Date: ____________________
            </Text>
            <Text style={styles.signatureDetails}>
              Witness: ____________________
            </Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>SELLER'S SIGNATURE</Text>
            <Text style={styles.signatureDetails}>
              {companyInfo.authorizedSignatory}
            </Text>
            <Text style={styles.signatureDetails}>
              For and on behalf of {companyInfo.name}
            </Text>
            <Text style={styles.signatureDetails}>
              Date: ____________________
            </Text>
            <Text style={styles.signatureDetails}>
              Company Seal: ____________________
            </Text>
          </View>
        </View>

        <View style={styles.pageBreak}>
          <View style={styles.infoBox}>
            <Text style={[styles.tableCell, styles.bold]}>WITNESS SECTION</Text>
            <View style={styles.flexRow}>
              <View style={{ width: '48%' }}>
                <Text style={styles.signatureDetails}>Witness 1 Name: ____________________</Text>
                <Text style={styles.signatureDetails}>ID Number: ____________________</Text>
                <Text style={styles.signatureDetails}>Signature: ____________________</Text>
                <Text style={styles.signatureDetails}>Date: ____________________</Text>
              </View>
              <View style={{ width: '48%' }}>
                <Text style={styles.signatureDetails}>Witness 2 Name: ____________________</Text>
                <Text style={styles.signatureDetails}>ID Number: ____________________</Text>
                <Text style={styles.signatureDetails}>Signature: ____________________</Text>
                <Text style={styles.signatureDetails}>Date: ____________________</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This agreement is generated electronically and is valid without physical signatures until executed by both parties.
          {'\n'}Agreement Reference: {agreementNumber} | Generated: {currentDate}
          {'\n'}For inquiries and support: {companyInfo.email} | {companyInfo.phone}
          {'\n'}© {new Date().getFullYear()} {companyInfo.name}. All rights reserved.
        </Text>
      </Page>
    </Document>
  );
};

export default SaleAgreementPDF;


