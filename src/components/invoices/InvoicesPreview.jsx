import React from "react";
import { formatDate, formatPrice } from "@/utils/format";

import { useBuyers } from "@/hooks/useBuyers";
import { useUnits } from "@/hooks/useUnits";
import { useProjects } from "@/hooks/useProjects";
import { usePayments } from "@/hooks/usePayments";

export default function InvoicePreview({ invoice }) {
  const { buyers } = useBuyers();
  const { units } = useUnits();
  const { projects } = useProjects();
  const { payments: allPayments } = usePayments();

  const buyer = buyers?.find((b) => b.id == invoice.buyerId);
  const unit = units?.find((u) => u.id === invoice.unitId);
  const project = unit ? projects?.find((p) => p.id === unit.projectId) : null;
  const payments = allPayments?.filter((p) => p.invoiceId === invoice.id) || [];

  const remaining = invoice.remainingAmount;

  if (!buyer || !unit || !project) {
    return <div className="text-center py-10">Loading invoice details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg border text-sm print:text-xs">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Real Estate Ltd</h2>
          <p className="text-gray-500">Nairobi, Kenya</p>
          <p className="text-gray-500">Email: info@realestate.com</p>
        </div>
        <div className="text-right">
          <h3 className="text-xl font-semibold">INVOICE</h3>
          <p className="text-gray-600">#{invoice.invoiceNumber}</p>
          <p className="text-gray-600">Status: {invoice.status}</p>
          <p className="text-gray-600">Issued: {formatDate(invoice.issuedDate)}</p>
        </div>
      </div>

      {/* Buyer & Unit Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">Bill To</h4>
          <p>{buyer.firstName} {buyer.lastName}</p>
          <p>{buyer.email}</p>
          <p>{buyer.phone}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">Property</h4>
          <p>Unit: {unit.unitNumber}</p>
          <p>Project: {project.name}</p>
          <p>Price: {formatPrice(invoice.totalAmount)}</p>
        </div>
      </div>

      {/* Amount Breakdown */}
      <div className="mb-6">
        <table className="w-full text-left border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Description</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-t">Subtotal</td>
              <td className="p-2 text-right border-t">{formatPrice(invoice.totalAmount)}</td>
            </tr>
            <tr>
              <td className="p-2 border-t">Total Paid</td>
              <td className="p-2 text-right border-t">
                {formatPrice(payments.reduce((sum, p) => sum + Number(p.amount), 0))}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-t font-bold">Remaining</td>
              <td className="p-2 text-right border-t font-bold">
                {formatPrice(remaining)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment History */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Payment History</h4>
        {payments.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <li key={payment.id} className="py-2 flex justify-between">
                <span>{formatDate(payment.paymentDate)} - {payment.method}</span>
                <span>{formatPrice(payment.amount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No payments recorded.</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 border-t pt-4 text-sm text-gray-500">
        <p>Pay via M-Pesa Paybill 123456, Account: {buyer.phone}</p>
        <p className="mt-2">Need help? support@realestate.com</p>
      </div>
    </div>
  );
}
