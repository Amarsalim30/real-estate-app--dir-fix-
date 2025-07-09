'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { PaymentStatuses, PaymentMethods } from '@/data/payments';
import { paymentsApi } from '@/lib/api/payments';
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
  AlertTriangle,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  Printer,
  Download,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  Hash,
  FileText,
  TrendingUp,
  Receipt,
  Info,
  ExternalLink
} from 'lucide-react';

const StatusBadge = ({ status, size = 'normal' }) => {
  const statusConfig = {
    [PaymentStatuses.COMPLETED]: { 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle, 
      label: 'Completed' 
    },
    [PaymentStatuses.PENDING]: { 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Clock, 
      label: 'Pending' 
    },
    [PaymentStatuses.FAILED]: { 
      color: 'bg-red-100 text-red-800', 
      icon: AlertTriangle, 
      label: 'Failed' 
    },
    [PaymentStatuses.REFUNDED]: { 
      color: 'bg-gray-100 text-gray-800', 
      icon: RefreshCw, 
      label: 'Refunded' 
    }
  };

  const config = statusConfig[status] || statusConfig[PaymentStatuses.PENDING];
  const Icon = config.icon;
  const sizeClasses = size === 'large' ? 'px-4 py-2 text-base' : 'px-3 py-1 text-sm';
  const iconSize = size === 'large' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium ${config.color}`}>
      <Icon className={`${iconSize} mr-2`} />
      {config.label}
    </span>
  );
};

const PaymentMethodIcon = ({ method, size = 'normal' }) => {
  const iconSize = size === 'large' ? 'w-6 h-6' : 'w-5 h-5';
  
  switch (method) {
    case PaymentMethods.CREDIT_CARD:
      return <CreditCard className={`${iconSize} text-blue-600`} />;
    case PaymentMethods.WIRE_TRANSFER:
      return <TrendingUp className={`${iconSize} text-green-600`} />;
    case PaymentMethods.CHECK:
      return <FileText className={`${iconSize} text-purple-600`} />;
    case PaymentMethods.ACH:
      return <Building className={`${iconSize} text-orange-600`} />;
    case PaymentMethods.CASH:
      return <DollarSign className={`${iconSize} text-yellow-600`} />;
    case PaymentMethods.MPESA_STKPUSH:
      return <DollarSign className={`${iconSize} text-green-600`} />;
    case PaymentMethods.MPESA_PAYBILL:
      return <DollarSign className={`${iconSize} text-green-600`} />;
    default:
      return <CreditCard className={`${iconSize} text-gray-600`} />;
  }
};

const InfoCard = ({ title, children, className = "", icon: Icon }) => (
  <div className={`bg-white rounded-lg shadow-sm border p-4 sm:p-6 ${className}`}>
    <div className="flex items-center mb-4">
      {Icon && <Icon className="w-5 h-5 text-gray-600 mr-2" />}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
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
  const queryClient = useQueryClient();
  
  const paymentId = parseInt(params.paymentId);
  const isAdmin = session?.user?.role === ROLES.ADMIN;

  // Fetch payment data directly from API with all related data
  const {
    data: payment,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentsApi.getById(paymentId),
    enabled: !!paymentId && !!session,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutations for admin actions
  const refundMutation = useMutation({
    mutationFn: (refundData) => paymentsApi.refund(paymentId, refundData),
    onSuccess: () => {
      queryClient.invalidateQueries(['payment', paymentId]);
      queryClient.invalidateQueries(['payments']);
      alert('Payment refunded successfully');
    },
    onError: (error) => {
      alert(`Refund failed: ${error.message}`);
    }
  });

  const retryMutation = useMutation({
    mutationFn: () => paymentsApi.retry(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['payment', paymentId]);
      queryClient.invalidateQueries(['payments']);
      alert('Payment retry initiated');
    },
    onError: (error) => {
      alert(`Retry failed: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => paymentsApi.delete(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      router.push('/payments');
    },
    onError: (error) => {
      alert(`Delete failed: ${error.message}`);
    }
  });

  // Check access permissions
  useEffect(() => {
    if (payment && !isAdmin && payment.buyerId !== session?.user?.buyerId) {
      router.push('/payments');
    }
  }, [payment, isAdmin, session?.user?.buyerId, router]);

  const handleRefund = () => {
    const reason = prompt('Please enter refund reason:');
    if (reason) {
      refundMutation.mutate({ reason, amount: payment.amount });
    }
  };

  const handleRetry = () => {
    if (confirm('Retry this payment? This will attempt to process the payment again.')) {
      retryMutation.mutate();
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = async () => {
    try {
      // This would generate and download a receipt
      alert("Receipt download feature coming soon!");
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading payment details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payment</h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              <Link
                href="/payments"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Payments
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment not found
  if (!payment) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Not Found</h2>
            <p className="text-gray-600 mb-4">
              The payment you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link
              href="/payments"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Payments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/payments"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Payment Details
            </h1>
            <p className="text-gray-600">Transaction #{payment.transactionId}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrint}
            className="text-blue-500 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>

          <button
            onClick={handleDownloadReceipt}
            className="text-blue-500 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className=" w-4 h-4 mr-2" />
            Receipt
          </button>

          {isAdmin && (
            <div className="flex gap-2">
              {payment.status === PaymentStatuses.FAILED && (
                <button
                  onClick={handleRetry}
                  disabled={retryMutation.isLoading}
                  className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              )}

              {payment.status === PaymentStatuses.COMPLETED && (
                <button
                  onClick={handleRefund}
                  disabled={refundMutation.isLoading}
                  className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refund
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {payment.status === PaymentStatuses.FAILED && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">Payment Failed</h3>
              <p className="text-sm text-red-700 mt-1">
                This payment could not be processed. {payment.failureReason && `Reason: ${payment.failureReason}`}
              </p>
              {isAdmin && (
                <div className="mt-3">
                  <button
                    onClick={handleRetry}
                    className="text-sm font-medium text-red-700 hover:text-red-800"
                  >
                    Retry Payment →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {payment.status === PaymentStatuses.REFUNDED && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <RefreshCw className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Payment Refunded</h3>
              <p className="text-sm text-gray-700 mt-1">
                This payment has been refunded. {payment.refundReason && `Reason: ${payment.refundReason}`}
              </p>
              {payment.refundDate && (
                <p className="text-sm text-gray-600 mt-1">
                  Refunded on {new Date(payment.refundDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Payment Information */}
        <div className="lg:col-span-2">
          <InfoCard title="Payment Information" icon={CreditCard}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Transaction ID</label>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-gray-900">{payment.transactionId}</p>
                  <CopyButton text={payment.transactionId} label="transaction ID" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <StatusBadge status={payment.status} size="large" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(payment.amount)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Method</label>
                <div className="flex items-center">
                  <PaymentMethodIcon method={payment.paymentMethod} />
                  <p className="ml-2 text-gray-900 capitalize">
                    {payment.paymentMethod?.replace('_', ' ') || '—'}
                  </p>
                </div>
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

              {payment.processedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Processed Date</label>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {new Date(payment.processedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}

              {payment.reference && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Reference</label>
                  <div className="flex items-center">
                    <p className="text-gray-900 font-mono text-sm">{payment.reference}</p>
                    <CopyButton text={payment.reference} label="reference" />
                  </div>
                </div>
              )}

              {payment.description && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <p className="text-gray-900">{payment.description}</p>
                </div>
              )}

              {payment.notes && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                  <p className="text-gray-900">{payment.notes}</p>
                </div>
              )}
            </div>
          </InfoCard>
        </div>

        {/* Quick Actions */}
        <div>
          <InfoCard title="Quick Actions" icon={Receipt}>
            <div className="space-y-3">
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">Download Receipt</p>
                  <p className="text-sm text-blue-600">Get payment receipt</p>
                </div>
              </button>

              {payment.invoice && (
                <Link
                  href={`/invoices/${payment.invoice.id}`}
                  className="flex items-center w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">View Invoice</p>
                    <p className="text-sm text-green-600">Invoice #{payment.invoice.id}</p>
                  </div>
                </Link>
              )}

              {payment.unit && (
                <Link
                  href={`/units/${payment.unit.id}`}
                  className="flex items-center w-full px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Building className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-purple-900">View Property</p>
                    <p className="text-sm text-purple-600">Unit {payment.unit.unitNumber}</p>
                  </div>
                </Link>
              )}

              {isAdmin && payment.buyer && (
                <Link
                  href={`/buyers/${payment.buyer.id}`}
                  className="flex items-center w-full px-4 py-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-orange-900">View Customer</p>
                    <p className="text-sm text-orange-600">{payment.buyer.firstName} {payment.buyer.lastName}</p>
                  </div>
                </Link>
              )}

              <button
                onClick={handlePrint}
                className="flex items-center w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Printer className=" w-5 h-5 text-gray-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Print Details</p>
                  <p className="text-sm text-gray-600">Print this page</p>
                </div>
              </button>
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Customer Information - Admin Only */}
      {isAdmin && payment.buyer && (
        <InfoCard title="Customer Information" icon={User} className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {payment.buyer.firstName} {payment.buyer.lastName}
                  </p>
                  <p className="text-sm text-gray-600">Full Name</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">{payment.buyer.email}</p>
                  <p className="text-sm text-gray-600">Email Address</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">{payment.buyer.phone}</p>
                  <p className="text-sm text-gray-600">Phone Number</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {payment.buyer.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900">
                      {payment.buyer.address}<br />
                      {payment.buyer.city}, {payment.buyer.state} {payment.buyer.postalCode}
                    </p>
                    <p className="text-sm text-gray-600">Address</p>
                  </div>
                </div>
              )}

              {payment.buyer.occupation && (
                <div className="flex items-center space-x-3">
                  <Info className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900">{payment.buyer.occupation}</p>
                    <p className="text-sm text-gray-600">Occupation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </InfoCard>
      )}

      {/* Property Information */}
      {payment.unit && payment.project && (
        <InfoCard title="Property Information" icon={Building} className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{payment.project.name}</p>
                  <p className="text-sm text-gray-600">Project</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Hash className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">Unit {payment.unit.unitNumber}</p>
                  <p className="text-sm text-gray-600">Unit Number</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">{payment.unit.type} • {payment.unit.sqft} sq ft</p>
                  <p className="text-sm text-gray-600">Type & Size</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{formatPrice(payment.unit.price)}</p>
                  <p className="text-sm text-gray-600">Unit Price</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">
                    {payment.project.address}<br />
                    {payment.project.city}, {payment.project.state} {payment.project.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">Property Address</p>
                </div>
              </div>
            </div>
          </div>
        </InfoCard>
      )}

      {/* Payment Gateway Information */}
      {payment.gatewayResponse && (
        <InfoCard title="Gateway Information" icon={ExternalLink} className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {payment.gatewayResponse.transactionId && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Gateway Transaction ID</label>
                <div className="flex items-center">
                  <p className="text-sm font-mono text-gray-900">{payment.gatewayResponse.transactionId}</p>
                  <CopyButton text={payment.gatewayResponse.transactionId} label="gateway transaction ID" />
                </div>
              </div>
            )}

            {payment.gatewayResponse.authCode && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Authorization Code</label>
                <p className="text-sm font-mono text-gray-900">{payment.gatewayResponse.authCode}</p>
              </div>
            )}

            {payment.gatewayResponse.processorResponse && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Processor Response</label>
                <p className="text-sm text-gray-900">{payment.gatewayResponse.processorResponse}</p>
              </div>
            )}

            {payment.gatewayResponse.fees && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Processing Fees</label>
                <p className="text-sm text-gray-900">{formatPrice(payment.gatewayResponse.fees)}</p>
              </div>
            )}
          </div>
        </InfoCard>
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Admin Actions</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            {payment.status === PaymentStatuses.FAILED && (
              <button
                onClick={handleRetry}
                disabled={retryMutation.isLoading}
                className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {retryMutation.isLoading ? 'Retrying...' : 'Retry Payment'}
              </button>
            )}

            {payment.status === PaymentStatuses.COMPLETED && (
              <button
                onClick={handleRefund}
                disabled={refundMutation.isLoading}
                className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {refundMutation.isLoading ? 'Processing...' : 'Refund Payment'}
              </button>
            )}

            <button
              onClick={() => router.push(`/payments/${paymentId}/edit`)}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Payment
            </button>

            <button
              onClick={handleDelete}
              disabled={deleteMutation.isLoading}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete Payment'}
            </button>
          </div>
          <p className="text-sm text-red-600 mt-3">
            ⚠️ These actions are irreversible. Please use with caution.
          </p>
        </div>
      )}

      {/* User Help Section - Non-Admin Only */}
      {!isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help with This Payment?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Call Support</p>
                <p className="text-sm text-blue-700">1-800-SUPPORT</p>
                <p className="text-xs text-blue-600">Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Email Support</p>
                <p className="text-sm text-blue-700">payments@company.com</p>
                <p className="text-xs text-blue-600">Response within 24 hours</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Common Questions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Payment Failed:</strong> Contact support to retry or use a different payment method</li>
              <li>• <strong>Refund Request:</strong> Refunds typically process within 3-5 business days</li>
              <li>• <strong>Receipt Issues:</strong> Download your receipt or request a new copy via email</li>
              <li>• <strong>Payment Disputes:</strong> Contact support with your transaction ID for assistance</li>
            </ul>
          </div>

          {payment.status === PaymentStatuses.FAILED && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  Payment failed? Need to try again?
                </span>
                <a
                  href="tel:1-800-SUPPORT"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Call Support
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PaymentDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'unauthenticated') {
    return null;
  }

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
            <p className="text-gray-600">Please sign in to view payment details.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const canViewPayments = session.user.role === ROLES.ADMIN || 
                         session.user.role === ROLES.MANAGER ||
                         session.user.role === ROLES.CASHIER ||
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
