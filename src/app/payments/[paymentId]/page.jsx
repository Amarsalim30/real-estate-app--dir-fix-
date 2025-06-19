'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Payments } from '@/data/payments';
import { Buyers } from '@/data/buyers';
import { Units } from '@/data/units';
import { Projects } from '@/data/projects';
import { Invoices } from '@/data/invoices';
import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
import Link from 'next/link';
import { 
  ArrowLeft,
  CreditCard, 
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
  Receipt,
  Printer,
  Download,
  RefreshCw,
  Activity,
  FileText,
  Phone,
  Mail,
  MapPin,
  Hash,
  Info,
  Eye,
  Copy,
  Check
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' },
    processing: { color: 'bg-blue-100 text-blue-800', icon: Activity, label: 'Processing' }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-2" />
      {config.label}
    </span>
  );
};

const PaymentMethodBadge = ({ method }) => {
  const methodConfig = {
    credit_card: { color: 'bg-blue-100 text-blue-800', icon: CreditCard, label: 'Credit Card' },
    bank_transfer: { color: 'bg-purple-100 text-purple-800', icon: Building, label: 'Bank Transfer' },
    cash: { color: 'bg-green-100 text-green-800', icon: DollarSign, label: 'Cash' },
    check: { color: 'bg-orange-100 text-orange-800', icon: Receipt, label: 'Check' }
  };

  const config = methodConfig[method] || methodConfig.credit_card;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-2" />
      {config.label}
    </span>
  );
};

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

function PaymentDetailContent() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const paymentId = parseInt(params.paymentId);

  const [payment, setPayment] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [unit, setUnit] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const isAdmin = session?.user?.role === ROLES.ADMIN;
  const isCashier = session?.user?.role === ROLES.CASHIER || isAdmin;

  // Get user's buyer ID
  const getUserBuyerId = () => {
    if (session?.user?.buyerId) {
      return session.user.buyerId;
    }
    
    // Fallback: find buyer by email if buyerId not in session
    const buyer = Buyers.find(b => b.email === session?.user?.email);
    return buyer?.id || null;
  };

  const userBuyerId = getUserBuyerId();

  useEffect(() => {
    const fetchPaymentData = () => {
      try {
        const foundPayment = Payments?.find(p => p.id === paymentId);
        
        if (!foundPayment) {
          setLoading(false);
          return;
        }

        // Check if non-admin user can access this payment
        if (!isAdmin && foundPayment.buyerId !== userBuyerId) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        setPayment(foundPayment);

        // Get related data
        const foundBuyer = Buyers?.find(b => b.id === foundPayment.buyerId);
        setBuyer(foundBuyer);

        const foundInvoice = Invoices?.find(i => i.id === foundPayment.invoiceId);
        setInvoice(foundInvoice);

        if (foundInvoice) {
          const foundUnit = Units?.find(u => u.id === foundInvoice.unitId);
          setUnit(foundUnit);

          if (foundUnit) {
            const foundProject = Projects?.find(p => p.id === foundUnit.projectId);
            setProject(foundProject);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching payment data:', error);
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [paymentId, isAdmin, userBuyerId]);

  const handleEdit = () => {
    router.push(`/payments/${paymentId}/edit`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      // Handle delete logic
      console.log('Delete payment:', payment);
      router.push('/payments');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // Handle receipt download
    console.log('Download receipt for payment:', payment);
  };

  const handleRefund = () => {
    if (confirm('Are you sure you want to process a refund for this payment?')) {
      // Handle refund logic
      console.log('Process refund for payment:', payment);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to view this payment.</p>
          <Link
            href="/payments"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Not Found</h2>
          <p className="text-gray-600 mb-4">The payment you're looking for doesn't exist.</p>
          <Link
            href="/payments"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/payments"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? 'Payment Details' : 'Your Payment Details'}
            </h1>
            <p className="text-gray-600">Payment #{payment.paymentNumber}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>

          <button
            onClick={handleDownloadReceipt}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Receipt
          </button>

          {isCashier && payment.status === 'pending' && (
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}

          {isCashier && payment.status === 'completed' && (
            <button
              onClick={handleRefund}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refund
            </button>
          )}
        </div>
      </div>

      {/* Payment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <InfoCard title="Payment Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Number</label>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-gray-900">{payment.paymentNumber}</p>
                  <CopyButton text={payment.paymentNumber} label="payment number" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <StatusBadge status={payment.status} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
                <p className="text-2xl font-bold text-green-600">{formatPrice(payment.amount)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Method</label>
                <PaymentMethodBadge method={payment.paymentMethod} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Date</label>
                <div className="flex items-center text-gray-900">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {payment.transactionId && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Transaction ID</label>
                  <div className="flex items-center">
                    <p className="text-gray-900 font-mono text-sm">{payment.transactionId}</p>
                    <CopyButton text={payment.transactionId} label="transaction ID" />
                  </div>
                </div>
              )}
            </div>

            {payment.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                <p className="text-gray-900">{payment.description}</p>
              </div>
            )}

            {payment.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Notes</label>
                <p className="text-gray-900">{payment.notes}</p>
              </div>
            )}
          </InfoCard>
        </div>

        <div>
          <InfoCard title="Quick Actions">
            <div className="space-y-3">
              {invoice && (
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">View Invoice</p>
                    <p className="text-sm text-blue-600">#{invoice.invoiceNumber}</p>
                  </div>
                </Link>
              )}

              {buyer && isAdmin && (
                <Link
                  href={`/buyers/${buyer.id}`}
                  className="flex items-center w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">View Buyer</p>
                    <p className="text-sm text-green-600">{buyer.firstName} {buyer.lastName}</p>
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
                    <p className="font-medium text-purple-900">View Unit</p>
                    <p className="text-sm text-purple-600">Unit {unit.unitNumber}</p>
                  </div>
                </Link>
              )}

              <button
                onClick={handleDownloadReceipt}
                className="flex items-center w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Receipt className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Download Receipt</p>
                  <p className="text-sm text-gray-600">PDF format</p>
                </div>
              </button>
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Buyer Information - Show for admin or if it's the user's own payment */}
      {buyer && (isAdmin || payment.buyerId === userBuyerId) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <InfoCard title={isAdmin ? "Buyer Information" : "Your Information"}>
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

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900">
                    {buyer.address}<br />
                    {buyer.city}, {buyer.state} {buyer.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">Address</p>
                </div>
              </div>
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
                      {project.city}, {project.state} {project.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">Property Address</p>
                  </div>
                </div>
              </div>
            </InfoCard>
          )}
        </div>
      )}

      {/* Payment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <InfoCard title="Transaction Details">
          <div className="space-y-4">
            {payment.paymentMethod === 'credit_card' && payment.cardDetails && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Card Number</label>
                  <p className="text-gray-900 font-mono">**** **** **** {payment.cardDetails.lastFour}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Card Type</label>
                  <p className="text-gray-900">{payment.cardDetails.brand}</p>
                </div>
              </>
            )}

            {payment.paymentMethod === 'bank_transfer' && payment.bankDetails && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Bank Name</label>
                  <p className="text-gray-900">{payment.bankDetails.bankName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Account Number</label>
                  <p className="text-gray-900 font-mono">****{payment.bankDetails.accountLast4}</p>
                </div>
              </>
            )}

            {payment.paymentMethod === 'check' && payment.checkDetails && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Check Number</label>
                  <p className="text-gray-900">{payment.checkDetails.checkNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Bank</label>
                  <p className="text-gray-900">{payment.checkDetails.bankName}</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Processing Fee</label>
              <p className="text-gray-900">{formatPrice(payment.processingFee || 0)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Net Amount</label>
              <p className="text-lg font-semibold text-gray-900">
                {formatPrice(payment.amount - (payment.processingFee || 0))}
              </p>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="Payment Timeline">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Payment Initiated</p>
                <p className="text-sm text-gray-600">
                  {new Date(payment.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {payment.status === 'processing' && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Processing</p>
                  <p className="text-sm text-gray-600">Payment is being processed</p>
                </div>
              </div>
            )}

            {payment.status === 'completed' && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Payment Completed</p>
                  <p className="text-sm text-gray-600">
                    {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}

            {payment.status === 'failed' && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Payment Failed</p>
                  <p className="text-sm text-gray-600">
                    {payment.failureReason || 'Payment could not be processed'}
                  </p>
                </div>
              </div>
            )}

            {payment.refundDate && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Refund Processed</p>
                  <p className="text-sm text-gray-600">
                    {new Date(payment.refundDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">Amount: {formatPrice(payment.refundAmount)}</p>
                </div>
              </div>
            )}
          </div>
        </InfoCard>
      </div>

      {/* Related Payments - Only show for admin or user's own payments */}
      {buyer && (isAdmin || payment.buyerId === userBuyerId) && (
        <InfoCard title={isAdmin ? "Related Payments" : "Your Other Payments"} className="mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Payment #</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Method</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Payments?.filter(p => p.buyerId === buyer.id && p.id !== payment.id)
                  .slice(0, 5)
                  .map((relatedPayment) => (
                    <tr key={relatedPayment.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm font-medium text-gray-900">
                        {relatedPayment.paymentNumber}
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {new Date(relatedPayment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {formatPrice(relatedPayment.amount)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={relatedPayment.status} />
                      </td>
                      <td className="py-3">
                        <PaymentMethodBadge method={relatedPayment.paymentMethod} />
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/payments/${relatedPayment.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            {Payments?.filter(p => p.buyerId === buyer.id && p.id !== payment.id).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {isAdmin ? 'No other payments found for this buyer.' : 'No other payments found.'}
                </p>
              </div>
            )}
          </div>
        </InfoCard>
      )}

      {/* Admin Actions - Only for Admin */}
      {isAdmin && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Admin Actions</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Payment
            </button>
            
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Payment
            </button>
            
            {payment.status === 'failed' && (
              <button
                onClick={() => console.log('Retry payment')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Payment
              </button>
            )}
          </div>
          <p className="text-sm text-red-600 mt-2">
            ⚠️ These actions are irreversible. Please use with caution.
          </p>
        </div>
      )}

      {/* User Help Section - Only for non-admin users */}
      {!isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-sm text-blue-700">support@company.com</p>
                <p className="text-xs text-blue-600">Response within 24 hours</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Payment Issues:</strong> If you have questions about this payment or need to request a refund, 
              please contact our support team with your payment number: <strong>{payment.paymentNumber}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentDetailPage() {
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
    router.push('/login');
    return null;
  }

  // Allow access for admin, cashier, manager, or regular users (they'll see filtered content)
  const canViewPayments = session.user.role === ROLES.ADMIN || 
                         session.user.role === ROLES.CASHIER || 
                         session.user.role === ROLES.MANAGER ||
                         session.user.role === ROLES.USER;

  if (!canViewPayments) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600">You don't have permission to view payment details.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PaymentDetailContent />
    </DashboardLayout>
  );
}
