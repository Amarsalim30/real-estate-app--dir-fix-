'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import StatusBadge from '@/components/ui/status-badge';
import { InvoiceStatuses } from '@/data/invoices';
import InvoicePreview  from '@/components/invoices/InvoicesPreview';

import { useBuyers } from '@/hooks/useBuyers';
import { useUnits } from '@/hooks/useUnits';
import { useProjects } from '@/hooks/useProjects';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';

import { formatPrice, formatDate } from '@/utils/format';
import { isInvoiceOverdue, getInvoiceDisplayStatus, calculateInvoiceSubtotal } from '@/utils/invoice-helpers';
import { ROLES } from '@/lib/roles';
import Link from 'next/link';
import { 
  ArrowLeft,
  FileText, 
  Calendar,
  DollarSign,
  User,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Printer,
  Download,
  CreditCard,
  Info,
  Eye,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  Hash
} from 'lucide-react';

const InfoCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
};

function InvoiceDetailContent() {
  const { data: session } = useSession();
  const { buyers } = useBuyers();
  const { units } = useUnits();
  const { projects } = useProjects();
  const { invoices } = useInvoices();
  const { payments } = usePayments();

  const params = useParams();
  const router = useRouter();
  
  const invoiceId = parseInt(params.invoiceId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = session?.user?.role === ROLES.ADMIN;

  // Fixed: Calculate userBuyerId with proper dependencies
  const userBuyerId = useMemo(() => {
    if (!session?.user || !buyers) return null;
    
    if (session.user.buyerId) {
      return Number(session.user.buyerId);
    }
    
    const buyer = buyers.find(b => b.email === session.user.email);
    return buyer?.id || null;
  }, [session, buyers]);

  // Get invoice and related data
  const { invoice, buyer, unit, project, relatedPayments } = useMemo(() => {
    if (!invoices || !buyers || !units || !projects || !payments || !invoiceId || isNaN(invoiceId)) {
      return { invoice: null, buyer: null, unit: null, project: null, relatedPayments: [] };
    }

    const foundInvoice = invoices.find(i => i.id === invoiceId);
    if (!foundInvoice) {
      return { invoice: null, buyer: null, unit: null, project: null, relatedPayments: [] };
    }

    // Check access permissions for non-admin users
    if (!isAdmin && foundInvoice.buyerId != userBuyerId) {
      return { invoice: null, buyer: null, unit: null, project: null, relatedPayments: [] };
    }

    // Fixed: Use loose comparison for buyer lookup
    const foundBuyer = buyers.find(b => b.id == foundInvoice.buyerId);
        const foundUnit = units.find(u => u.id === foundInvoice.unitId);
    const foundProject = projects.find(p => p.id === foundUnit.projectId);
    const foundpayments = payments?.filter(p => p.invoiceId === foundInvoice.id) || [];

    return {
      invoice: foundInvoice,
      buyer: foundBuyer,
      unit: foundUnit,
      project: foundProject,
      relatedPayments: foundpayments
    };
  }, [invoiceId, isAdmin, userBuyerId, invoices, buyers, units, projects, payments]);

  useEffect(() => {
    // Set loading state based on data availability
    if (!invoices || !buyers || !units || !projects || !payments) {
      setLoading(true);
      setError(null);
      return;
    }

    if (!invoiceId || isNaN(invoiceId)) {
      setError('Invalid invoice ID');
      setLoading(false);
      return;
    }

    if (!invoice) {
      setError('Invoice not found');
      setLoading(false);
      return;
    }

    // Check access for non-admin users
    if (!isAdmin && invoice.buyerId != userBuyerId) {
      setError('Access denied');
      setLoading(false);
      return;
    }

    setLoading(false);
    setError(null);
  }, [invoice, invoiceId, isAdmin, userBuyerId, invoices, buyers, units, projects, payments]);
  
  const handleEdit = () => {
    router.push(`/invoices/${invoiceId}/edit`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      // TODO: Implement actual delete functionality
      console.log('Delete invoice:', invoice);
      alert('Delete functionality coming soon!');
      // router.push('/invoices');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert("Download feature coming soon!");
  };

  const handlePayNow = () => {
    router.push(`/invoices/${invoiceId}/pay`);
  };

  const handleMarkAsPaid = () => {
    if (confirm('Are you sure you want to mark this invoice as paid?')) {
      // TODO: Implement mark as paid functionality
      console.log('Mark as paid:', invoice);
      alert('Mark as paid functionality coming soon!');
    }
  };

  const handleSendReminder = () => {
    if (confirm('Send payment reminder to customer?')) {
      // TODO: Implement send reminder functionality
      console.log('Send reminder for invoice:', invoice);
      alert('Send reminder functionality coming soon!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error === 'Access denied' ? 'Access Denied' : 
             error === 'Invalid invoice ID' ? 'Invalid Invoice' :
             'Invoice Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error === 'Access denied' 
              ? 'You don\'t have permission to view this invoice.'
              : error === 'Invalid invoice ID'
              ? 'The invoice ID provided is not valid.'
              : 'The invoice you\'re looking for doesn\'t exist.'
            }
          </p>
          <Link
            href="/invoices"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const displayStatus = getInvoiceDisplayStatus(invoice);
  const isOverdue = isInvoiceOverdue(invoice);
  const subtotal = calculateInvoiceSubtotal(invoice);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/invoices"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? 'Invoice Details' : 'Your Invoice'}
            </h1>
            <p className="text-gray-600">Invoice #{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">

          <button
            onClick={handlePrint}
            className="text-blue-600 flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className=" text-blue-600 w-4 h-4 mr-2" />
            Print
          </button>

          <button
            onClick={handleDownloadPDF}
            className=" text-blue-700 flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed"
            disabled
            title="Coming Soon"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>

          {!isAdmin && invoice.status === InvoiceStatuses.PENDING && (
            <button
              onClick={handlePayNow}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay Now
            </button>
          )}

          {isAdmin && (
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors opacity-50 cursor-not-allowed"
              disabled
              title="Coming Soon"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Overdue Alert for Users */}
      {!isAdmin && isOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">Invoice Overdue</h3>
              <p className="text-sm text-red-700 mt-1">
                This invoice was due on {formatDate(invoice.dueDate)}. 
                Please pay as soon as possible to avoid additional late fees.
              </p>
              <div className="mt-3 flex items-center space-x-4">
                <button
                  onClick={handlePayNow}
                  className="text-sm font-medium text-red-700 hover:text-red-800"
                >
                  Pay Now →
                </button>
                <span className="text-red-400">|</span>
                <a href="tel:1-800-SUPPORT" className="text-sm font-medium text-red-700 hover:text-red-800">
                  Call Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <InfoCard title="Invoice Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Invoice Number</label>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-gray-900">#{invoice.invoiceNumber}</p>
                  <CopyButton text={invoice.invoiceNumber} label="invoice number" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <StatusBadge status={displayStatus} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Issue Date</label>
                <div className="flex items-center text-gray-900">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(invoice.issuedDate)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
                <div className={`flex items-center ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(invoice.dueDate)}
                  {isOverdue && <span className="ml-2 text-xs font-medium">(OVERDUE)</span>}
                </div>
              </div>

              {invoice.paidDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Paid Date</label>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {formatDate(invoice.paidDate)}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Terms</label>
                <p className="text-gray-900">{invoice.paymentTerms || 'Net 30'}</p>
              </div>
            </div>

            {invoice.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                <p className="text-gray-900">{invoice.description}</p>
              </div>
            )}

            {invoice.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Notes</label>
                <p className="text-gray-900">{invoice.notes}</p>
              </div>
            )}
          </InfoCard>
        </div>

        <div>
          <InfoCard title="Quick Actions">
            <div className="space-y-3">
              {!isAdmin && invoice.status === InvoiceStatuses.PENDING && (
                <button
                  onClick={handlePayNow}
                  className="flex items-center w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <CreditCard className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Pay Now</p>
                    <p className="text-sm text-green-600">Pay this invoice online</p>
                  </div>
                </button>
              )}

              {buyer && isAdmin && (
                <Link
                  href={`/buyers/${buyer.id}`}
                  className="flex items-center w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">View Buyer</p>
                    <p className="text-sm text-blue-600">{buyer.firstName} {buyer.lastName}</p>
                  </div>
                </Link>
              )}

              {unit && (
                <Link
                  href={`/units/${unit.id}`}
                  className="flex items-center w-full px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Building className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-purple-900">View Property</p>
                    <p className="text-sm text-purple-600">Unit {unit.unitNumber}</p>
                  </div>
                </Link>
              )}

              <button
                onClick={handleDownloadPDF}
                className="flex items-center w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                disabled
                title="Coming Soon"
              >
                <Download className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Download PDF</p>
                  <p className="text-sm text-gray-600">Save or print invoice</p>
                </div>
              </button>

              {relatedPayments.length > 0 && (
                <Link
                  href={`/payments?invoice=${invoice.id}`}
                  className="flex items-center w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <CreditCard className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">View Payments</p>
                    <p className="text-sm text-green-600">{relatedPayments.length} payment(s)</p>
                  </div>
                </Link>
              )}
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Amount Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <InfoCard title="Amount Breakdown">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium text-gray-900">{formatPrice(invoice.taxAmount || 0)}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">{formatPrice(invoice.totalAmount)}</span>
              </div>
            </div>

            {invoice.status === InvoiceStatuses.PAID && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">
                    Paid in full on {formatDate(invoice.paidDate)}
                  </span>
                </div>
              </div>
            )}

            {invoice.status === InvoiceStatuses.PENDING && (
              <div className={`border rounded-lg p-3 mt-4 ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center">
                  {isOverdue ? (
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                  )}
                  <span className={`text-sm font-medium ${isOverdue ? 'text-red-900' : 'text-yellow-900'}`}>
                    {isOverdue 
                      ? `Overdue by ${Math.ceil((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))} days`
                      : `Due in ${Math.ceil((new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days`
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </InfoCard>

        {/* Property Information */}
        {unit && project && (
          <InfoCard title="Property Information">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-600">Project</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Hash className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-900">Unit {unit.unitNumber}</p>
                  <p className="text-sm text-gray-600">Unit Number</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-900">{unit.type} • {unit.sqft} sq ft</p>
                  <p className="text-sm text-gray-600">Type & Size</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{formatPrice(unit.price)}</p>
                  <p className="text-sm text-gray-600">Unit Price</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900">
                    {project.address}<br />
                    {project.city}, {project.state} {project.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">Property Address</p>
                </div>
              </div>
            </div>
          </InfoCard>
        )}
      </div>

      {/* Customer Information - Admin Only */}
      {isAdmin && buyer && (
        <InfoCard title="Customer Information" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{buyer.firstName} {buyer.lastName}</p>
                  <p className="text-sm text-gray-600">Full Name</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-900">{buyer.email}</p>
                  <p className="text-sm text-gray-600">Email Address</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-900">{buyer.phone}</p>
                  <p className="text-sm text-gray-600">Phone Number</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900">
                    {buyer.address}<br />
                    {buyer.city}, {buyer.state} {buyer.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">Billing Address</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-900">{buyer.occupation}</p>
                  <p className="text-sm text-gray-600">Occupation</p>
                </div>
              </div>
            </div>
          </div>
        </InfoCard>
      )}

      {/* Payment History */}
      {relatedPayments.length > 0 ? (
        <InfoCard title="Payment History" className="mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Payment Date</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Method</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Transaction ID</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {relatedPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-900">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="py-3 text-sm text-gray-900 capitalize">
                      {payment.paymentMethod?.replace('_', ' ')}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-mono text-gray-600">
                      {payment.transactionId || 'N/A'}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/payments/${payment.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      ) : (
        <InfoCard title="Payment History" className="mb-8">
          <p className="text-gray-600 italic">No payments recorded for this invoice.</p>
        </InfoCard>
      )}

      {/* Admin Actions - Admin Only */}
      {isAdmin && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Admin Actions</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors opacity-50 cursor-not-allowed"
              disabled
              title="Coming Soon"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Invoice
            </button>
            
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors opacity-50 cursor-not-allowed"
              disabled
              title="Coming Soon"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Invoice
            </button>
            
            {invoice.status === InvoiceStatuses.PENDING && (
              <button
                onClick={handleMarkAsPaid}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors opacity-50 cursor-not-allowed"
                disabled
                title="Coming Soon"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Paid
              </button>
            )}

            {invoice.status === InvoiceStatuses.PENDING && (
              <button
                onClick={handleSendReminder}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors opacity-50 cursor-not-allowed"
                disabled
                title="Coming Soon"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Reminder
              </button>
            )}
          </div>
          <p className="text-sm text-red-600 mt-2">
            ⚠️ These actions are coming soon. Please use with caution when implemented.
          </p>
        </div>
      )}

      {/* User Help Section - Non-Admin Only */}
      {!isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help with This Invoice?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Call Support</p>
                <p className="text-sm text-blue-700">1-800-SUPPORT</p>
                <p className="text-xs text-blue-600">Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Email Support</p>
                <p className="text-sm text-blue-700">billing@company.com</p>
                <p className="text-xs text-blue-600">Response within 24 hours</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Payment Options:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Online Payment:</strong> Click "Pay Now" to pay with credit card or bank transfer</li>
              <li>• <strong>Bank Transfer:</strong> Use the account details provided in your welcome email</li>
              <li>• <strong>Check Payment:</strong> Mail to the address on your invoice</li>
              <li>• <strong>Payment Plans:</strong> Contact support to discuss installment options</li>
            </ul>
          </div>

          {invoice.status === InvoiceStatuses.PENDING && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  Ready to pay this invoice?
                </span>
                <button
                  onClick={handlePayNow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                                    Pay {formatPrice(invoice.totalAmount)} Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InvoiceDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please sign in to view invoice details.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const canViewInvoices = session.user.role === ROLES.ADMIN || 
                         session.user.role === ROLES.MANAGER ||
                         session.user.role === ROLES.CASHIER ||
                         session.user.role === ROLES.USER;

  if (!canViewInvoices) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600">You don't have permission to view invoice details.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <InvoiceDetailContent />
    </DashboardLayout>
  );
}


