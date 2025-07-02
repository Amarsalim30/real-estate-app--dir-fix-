import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { formatPrice } from '@/utils/format';

// Register fonts (optional - you can use default fonts)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ]
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  logo: {
    width: 80,
    height: 60,
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 9,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f2937',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
    color: '#374151',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    color: '#4b5563',
  },
  value: {
    width: '60%',
    color: '#1f2937',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 15,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8,
  },
  tableCell: {
    fontSize: 9,
    textAlign: 'center',
  },
  terms: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 8,
    textAlign: 'justify',
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  signatureBox: {
    width: '45%',
    textAlign: 'center',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginBottom: 5,
    height: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: '#f3f4f6',
    opacity: 0.1,
    zIndex: -1,
  },
  highlight: {
    backgroundColor: '#fef3c7',
    padding: 3,
    fontWeight: 'bold',
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>CONFIDENTIAL</Text>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            {companyInfo?.logo && (
              <Image style={styles.logo} src={companyInfo.logo} />
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
              {companyInfo?.name || 'Real Estate Development LLC'}
            </Text>
            <Text>{companyInfo?.address || '123 Business Plaza, Suite 456'}</Text>
            <Text>{companyInfo?.city || 'Nairobi, Kenya'}</Text>
            <Text>{companyInfo?.phone || '+254 700 123 456'}</Text>
            <Text>{companyInfo?.email || 'info@realestate.com'}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Sale Agreement</Text>
        <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 10 }}>
          Agreement No: {agreementNumber} | Date: {currentDate}
        </Text>

        {/* Parties Section */}
        <Text style={styles.subtitle}>Parties to the Agreement</Text>
        
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>SELLER (Developer):</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Company Name:</Text>
            <Text style={styles.value}>{companyInfo?.name || 'Real Estate Development LLC'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registration No:</Text>
            <Text style={styles.value}>{companyInfo?.registrationNo || 'REG/2020/001234'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>
              {companyInfo?.fullAddress || '123 Business Plaza, Suite 456, Nairobi, Kenya'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>BUYER (Purchaser):</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{buyer.firstName} {buyer.lastName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>National ID:</Text>
            <Text style={styles.value}>{buyer.nationalId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>KRA PIN:</Text>
            <Text style={styles.value}>{buyer.kraPin}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{buyer.phoneNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{buyer.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>
              {buyer.city}, {buyer.state} {buyer.postalCode}
            </Text>
          </View>
        </View>

        {/* Property Details */}
        <Text style={styles.subtitle}>Property Details</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Project Name:</Text>
            <Text style={styles.value}>{project.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Unit Number:</Text>
            <Text style={[styles.value, styles.highlight]}>{unit.unitNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Unit Type:</Text>
            <Text style={styles.value}>{unit.bedrooms} Bedroom, {unit.bathrooms} Bathroom</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Floor Area:</Text>
            <Text style={styles.value}>{unit.sqft?.toLocaleString()} sq ft</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Floor Level:</Text>
            <Text style={styles.value}>{unit.floor}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Project Location:</Text>
            <Text style={styles.value}>{project.location}</Text>
          </View>
        </View>

        {/* Financial Summary */}
        <Text style={styles.subtitle}>Financial Summary</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Description</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Amount (KES)</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Percentage</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Notes</Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Base Unit Price</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formatPrice(unit.price)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>-</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>As per unit specification</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Taxes & Fees</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formatPrice(financialSummary.taxAmount)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>8%</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Government taxes</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Processing Fee</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formatPrice(financialSummary.processingFee)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>-</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Administrative costs</Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Total Purchase Price</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                {formatPrice(financialSummary.totalAmount)}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>100%</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Final amount</Text>
            </View>
          </View>
        </View>

        {/* Payment Plan */}
        <Text style={styles.subtitle}>Payment Plan Details</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Selected Plan:</Text>
            <Text style={[styles.value, styles.highlight]}>{paymentPlan.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Plan Duration:</Text>
            <Text style={styles.value}>{paymentPlan.durationMonths} months</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Down Payment:</Text>
            <Text style={styles.value}>
              {formatPrice(financialSummary.downPaymentAmount)} 
              ({(paymentPlan.minDownPaymentPercentage * 100)}%)
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Monthly Payment:</Text>
            <Text style={styles.value}>
              {formatPrice(financialSummary.monthlyPayment || 0)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Interest Rate:</Text>
            <Text style={styles.value}>{paymentPlan.interestRate || 0}% per annum</Text>
          </View>
        </View>
      </Page>

      {/* Second Page - Terms and Conditions */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Terms and Conditions</Text>

        <Text style={styles.subtitle}>1. Payment Terms</Text>
        <Text style={styles.terms}>
          1.1. The Buyer agrees to pay the total purchase price of {formatPrice(financialSummary.totalAmount)} 
          according to the selected payment plan.
        </Text>
        <Text style={styles.terms}>
          1.2. Down payment of {formatPrice(financialSummary.downPaymentAmount)} must be paid within 7 days of signing this agreement.
        </Text>
        <Text style={styles.terms}>
          1.3. Monthly installments of {formatPrice(financialSummary.monthlyPayment || 0)} are due on the same date each month for {paymentPlan.durationMonths} months.
        </Text>
        <Text style={styles.terms}>
          1.4. Late payment charges of 2% per month will apply to overdue amounts.
        </Text>

        <Text style={styles.subtitle}>2. Property Delivery</Text>
        <Text style={styles.terms}>
          2.1. The property will be delivered upon completion of construction and full payment of the purchase price.
        </Text>
        <Text style={styles.terms}>
          2.2. Estimated completion date: {project.estimatedCompletion || 'To be determined'}.
        </Text>
        <Text style={styles.terms}>
          2.3. The Seller will provide 30 days written notice before handover.
        </Text>

        <Text style={styles.subtitle}>3. Title and Ownership</Text>
        <Text style={styles.terms}>
          3.1. Title deed will be processed and transferred to the Buyer upon full payment.
        </Text>
        <Text style={styles.terms}>
          3.2. All legal fees for title transfer shall be borne by the Buyer.
        </Text>
        <Text style={styles.terms}>
          3.3. The property shall remain under the Seller's name until full payment is completed.
        </Text>

        <Text style={styles.subtitle}>4. Default and Remedies</Text>
        <Text style={styles.terms}>
          4.1. If the Buyer defaults on payment for more than 90 days, the Seller may terminate this agreement.
        </Text>
        <Text style={styles.terms}>
          4.2. Upon termination due to default, the Seller may retain up to 20% of payments made as liquidated damages.
        </Text>
        <Text style={styles.terms}>
          4.3. The Buyer may cure default by paying all outstanding amounts plus applicable charges.
        </Text>

        <Text style={styles.subtitle}>5. Construction and Quality</Text>
        <Text style={styles.terms}>
          5.1. The property will be constructed according to approved architectural plans and specifications.
        </Text>
        <Text style={styles.terms}>
          5.2. The Seller warrants the property against structural defects for 12 months from handover.
        </Text>
        <Text style={styles.terms}>
          5.3. Minor variations in finishes and fittings may occur due to availability of materials.
        </Text>

        <Text style={styles.subtitle}>6. Force Majeure</Text>
        <Text style={styles.terms}>
          6.1. Neither party shall be liable for delays caused by circumstances beyond their reasonable control.
        </Text>
        <Text style={styles.terms}>
          6.2. Such circumstances include but are not limited to natural disasters, government actions, or pandemics.
        </Text>

        <Text style={styles.subtitle}>7. Governing Law</Text>
        <Text style={styles.terms}>
          7.1. This agreement shall be governed by the laws of Kenya.
        </Text>
        <Text style={styles.terms}>
          7.2. Any disputes shall be resolved through arbitration in Nairobi, Kenya.
        </Text>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}></View>
            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>BUYER SIGNATURE</Text>
            <Text style={{ fontSize: 8, marginTop: 5 }}>
              {buyer.firstName} {buyer.lastName}
            </Text>
            <Text style={{ fontSize: 8 }}>Date: ________________</Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}></View>
            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>SELLER SIGNATURE</Text>
            <Text style={{ fontSize: 8, marginTop: 5 }}>
              {companyInfo?.authorizedSignatory || 'Authorized Representative'}
            </Text>
            <Text style={{ fontSize: 8 }}>Date: ________________</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This agreement is generated electronically and is valid without physical signatures until executed by both parties.
          {'\n'}Agreement ID: {agreementNumber} | Generated on: {currentDate}
        </Text>
      </Page>
    </Document>
  );
};

export default SaleAgreementPDF;
