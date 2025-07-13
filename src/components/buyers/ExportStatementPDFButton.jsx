// components/ExportPDFButton.jsx
'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import BuyerStatementPDF from './pdf/BuyerStatementPDF';

export default function ExportPDFButton({ buyer, totals, transactions }) {
  return (
    <PDFDownloadLink
      document={<BuyerStatementPDF buyer={buyer} totals={totals} transactions={transactions} />}
      fileName={`Statement_${buyer.firstName}_${buyer.lastName}.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Preparing PDF...' : 'Export PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
