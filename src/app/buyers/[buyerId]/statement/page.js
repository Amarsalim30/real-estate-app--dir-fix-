'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Buyers } from '@/data/buyers';
import { Invoices } from '@/data/invoices';
import { Payments } from '@/data/payments';
import { Units } from '@/data/units';
import { Projects } from '@/data/projects';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/header';
import { formatPrice } from '@/utils/formatPrice';
import { ROLES } from '@/lib/roles';

export default function BuyerStatementPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [dateRange, setDateRange] = useState('all');
  const [statementType, setStatementType] = useState('detailed'); // detailed, summary

  // Check authorization
  const isAdmin = session?.user?.role === ROLES.ADMIN;
  const isOwnStatement = session?.user?.id === parseInt(params.buyerId);
  
  if (!session?.user || (!isAdmin && !isOwnStatement)) {
    router.push('/login');
    return null;
  }

  const buyer = Buyers.find(b => b.id === parseInt(params.buyerId));
  
  if (!buyer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Buyer Not Found</h1>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Get buyer's invoices and payments
  const buyerInvoices = Invoices.filter(invoice => invoice.buyerId === buyer.id);
  const buyerPayments = Payments.filter(payment => payment.buyerId === buyer.id);

  // Calculate totals
  const totals = useMemo(() => {
    const totalInvoiced = buyerInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalPaid = buyerPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstandingBalance = totalInvoiced - totalPaid;
    
    return {
      totalInvoiced,
      totalPaid,
      outstandingBalance,
      invoiceCount: buyerInvoices.length,
      paymentCount: buyerPayments.length
    };
  }, [buyerInvoices, buyerPayments]);

  // Get transaction history (combined invoices and payments)
  const transactions = useMemo(() => {
    const invoiceTransactions = buyerInvoices.map(invoice => {
      const unit = Units.find(u => u.id === invoice.unitId);
      const project = Projects.find(p => p.id === invoice.projectId);
      
      return {
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        date: invoice.issueDate,
        description: `Invoice ${invoice.invoiceNumber} - ${unit?.unitNumber ? `Unit ${unit.unitNumber}` : 'Unit'} in ${project?.name || 'Project'}`,
        amount: invoice.totalAmount,
        status: invoice.status,
        reference: invoice.invoiceNumber,
        unitNumber: unit?.unitNumber,
        projectName: project?.name
      };
    });

    const paymentTransactions = buyerPayments.map(payment => {
      const invoice = Invoices.find(i => i.id === payment.invoiceId);
      const unit = Units.find(u => u.id === payment.unitId);
      const project = Projects.find(p => p.id === invoice?.projectId);
      
      return {
        id: `payment-${payment.id}`,
        type: 'payment',
        date: payment.paymentDate,
        description: `Payment - ${unit?.unitNumber ? `Unit ${unit.unitNumber}` : 'Unit'} in ${project?.name || 'Project'}`,
        amount: -payment.amount, // Negative for payments
        status: payment.status,
        reference: payment.transactionId,
        paymentMethod: payment.paymentMethod,
        unitNumber: unit?.unitNumber,
        projectName: project?.name
      };
    });

    return [...invoiceTransactions, ...paymentTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [buyerInvoices, buyerPayments]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // In a real app, this would generate and download a PDF
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Statement</h1>
              <div className="text-gray-600">
                <p className="font-medium">{buyer.firstName} {buyer.lastName}</p>
                <p>{buyer.email}</p>
                <p>{buyer.phone}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Statement Date</div>
              <div className="font-medium">{new Date().toLocaleDateString()}</div>
              
              <div className="flex space-x-2 mt-4">
                <button onClick={handlePrint} className="btn-secondary text-sm">
                  Print
                </button>
                <button onClick={handleExport} className="btn-secondary text-sm">
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm text-gray-500 mb-1">Total Invoiced</div>
            <div className="text-2xl font-bold text-gray-900">{formatPrice(totals.totalInvoiced)}</div>
            <div className="text-sm text-gray-500 mt-1">{totals.invoiceCount} invoices</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm text-gray-500 mb-1">Total Paid</div>
            <div className="text-2xl font-bold text-green-600">{formatPrice(totals.totalPaid)}</div>
            <div className="text-sm text-gray-500 mt-1">{totals.paymentCount} payments</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm text-gray-500 mb-1">Outstanding Balance</div>
            <div className={`text-2xl font-bold ${totals.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatPrice(totals.outstandingBalance)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {totals.outstandingBalance > 0 ? 'Amount due' : 'Paid in full'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm text-gray-500 mb-1">Account Status</div>
            <div className={`text-lg font-bold ${totals.outstandingBalance > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {totals.outstandingBalance > 0 ? 'Active' : 'Current'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {totals.outstandingBalance > 0 ? 'Payment pending' : 'All paid'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input-field"
              >
                <option value="all">All Time</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statement Type
              </label>
              <select
                value={statementType}
                onChange={(e) => setStatementType(e.target.value)}
                className="input-field"
              >
                <option value="detailed">Detailed</option>
                <option value="summary">Summary Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{transaction.description}</div>
                      {transaction.paymentMethod && (
                        <div className="text-xs text-gray-500 mt-1">
                          Payment Method: {transaction.paymentMethod.replace('_', ' ').toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'invoice' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {transaction.type === 'invoice' ? 'Invoice' : 'Payment'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${
                        transaction.amount > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{formatPrice(Math.abs(transaction.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed' || transaction.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No transactions found</div>
              <div className="text-gray-400 mt-2">This buyer has no transaction history</div>
            </div>
          )}
        </div>

        {/* Statement Summary */}
        <div className="bg-white rounded-lg shadow-sm border mt-8 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statement Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Account Activity</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Opening Balance:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Charges:</span>
                  <span className="font-medium text-red-600">+{formatPrice(totals.totalInvoiced)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payments:</span>
                  <span className="font-medium text-green-600">-{formatPrice(totals.totalPaid)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Current Balance:</span>
                    <span className={totals.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatPrice(totals.outstandingBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Properties Purchased</h4>
              <div className="space-y-3">
                {buyerInvoices.map(invoice => {
                  const unit = Units.find(u => u.id === invoice.unitId);
                  const project = Projects.find(p => p.id === invoice.projectId);
                  const payments = buyerPayments.filter(p => p.invoiceId === invoice.id);
                  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
                  const remaining = invoice.totalAmount - totalPaid;
                  
                  return (
                    <div key={invoice.id} className="border rounded-lg p-3">
                      <div className="font-medium text-gray-900">
                        {project?.name} - Unit {unit?.unitNumber}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>Purchase Price: {formatPrice(invoice.totalAmount)}</div>
                        <div>Paid: {formatPrice(totalPaid)}</div>
                        {remaining > 0 && (
                          <div className="text-red-600">Remaining: {formatPrice(remaining)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8 print:mt-16">
          <p>This statement was generated on {new Date().toLocaleDateString()}</p>
          <p>For questions about your account, please contact us at info@realestate.com</p>
        </div>
      </div>
    </div>
  );
}
