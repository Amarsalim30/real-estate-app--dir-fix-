'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { PaymentMethods, PaymentStatuses } from '@/data/payments';
import { paymentsApi } from '@/lib/api/payments';
import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
import {useBuyers} from '@/hooks/useBuyers';
import { useInvoices} from '@/hooks/useInvoices';
import { useUnits } from '@/hooks/useUnits';

import { 
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ArrowUpDown,
  User,
  Building,
  RefreshCw,
  TrendingUp,
  FileText,
  Menu,
  X
} from 'lucide-react';

const StatusBadge = ({ status, size = 'normal' }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case PaymentStatuses.COMPLETED:
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Completed'
        };
      case PaymentStatuses.PENDING:
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          label: 'Pending'
        };
      case PaymentStatuses.FAILED:
        return {
          color: 'bg-red-100 text-red-800',
          icon: AlertTriangle,
          label: 'Failed'
        };
      case PaymentStatuses.REFUNDED:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: RefreshCw,
          label: 'Refunded'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: CreditCard,
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const sizeClasses = size === 'large' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';
  const iconSize = size === 'large' ? 'w-4 h-4' : 'w-3 h-3';

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium ${config.color}`}>
      <Icon className={`${iconSize} mr-1`} />
      {config.label}
    </span>
  );
};

const PaymentMethodIcon = ({ method }) => {
  switch (method) {
    case PaymentMethods.CREDIT_CARD:
      return <CreditCard className="w-4 h-4 text-blue-600" />;
    case PaymentMethods.WIRE_TRANSFER:
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case PaymentMethods.CHECK:
      return <FileText className="w-4 h-4 text-purple-600" />;
    case PaymentMethods.ACH:
      return <Building className="w-4 h-4 text-orange-600" />;
    case PaymentMethods.CASH:
      return <DollarSign className="w-4 h-4 text-yellow-600" />;
    case PaymentMethods.MPESA_STKPUSH:
      return <DollarSign className="w-4 h-4 text-green-600" />;
    case PaymentMethods.MPESA_PAYBILL:
      return <DollarSign className="w-4 h-4 text-green-600" />;
    default:
      return <CreditCard className="w-4 h-4 text-gray-600" />;
  }
};

// Mobile-optimized Payment Card Component
const PaymentCard = ({ payment, onView, isAdmin ,buyer,invoice ,units}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <PaymentMethodIcon method={payment.paymentMethod} />
        <span className="text-sm font-medium text-gray-900">
          {payment.transactionId}
        </span>
      </div>
      <StatusBadge status={payment.status} />
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Amount</span>
        <span className="text-lg font-semibold text-gray-900">
          {formatPrice(payment.amount)}
        </span>
      </div>
      
      {isAdmin && payment.buyer && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Customer</span>
          <span className="text-sm text-gray-900">
            {buyer.firstName} {buyer.lastName}
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Date</span>
        <span className="text-sm text-gray-900">
          {new Date(payment.paymentDate).toLocaleDateString()}
        </span>
      </div>
      
      {payment.project && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Property</span>
          <span className="text-sm text-gray-900 truncate max-w-32">
            {units.find(unit => unit.id === invoice.unitId)?.projectName}
          </span>
        </div>
      )}
    </div>
    
    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
      <button
        onClick={() => onView(payment)}
        className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
      >
        <Eye className="w-4 h-4 mr-1" />
        View
      </button>
      <button className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors">
        <Download className="w-4 h-4 mr-1" />
        Receipt
      </button>
    </div>
  </div>
);

// Desktop Payment Row Component
const PaymentRow = ({ payment, onView, isAdmin ,buyer ,invoice ,units }) => (
  <tr className="hover:bg-gray-50 border-b border-gray-200">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <PaymentMethodIcon method={payment.paymentMethod} />
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-900">
            {payment.transactionId}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(payment.paymentDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </td>
    
    {isAdmin && (
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown Buyer'}
            </div>
            <div className="text-sm text-gray-500">
              {buyer?.email || 'N/A'}
            </div>
          </div>
        </div>
      </td>
    )}
    
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">
        {formatPrice(payment.amount)}
      </div>
      <div className="text-sm text-gray-500 capitalize">
        {payment.paymentMethod?.replace('_', ' ') || ''}
      </div>
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <Building className="w-4 h-4 text-gray-400 mr-2" />
        <div>
          <div className="text-sm text-gray-900">
            {units.find(u => u.id === invoice.unitId)?.projectName|| 'Unknown Project'}
          </div>
          <div className="text-sm text-gray-500">
            Unit {units.find(u => u.id === invoice.unitId)?.unitNumber || 'N/A'}
          </div>
        </div>
      </div>
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap">
      <StatusBadge status={payment.status} />
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={() => onView(payment)}
          className="text-blue-600 hover:text-blue-900 p-1 rounded"
          title="View Payment"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          className="text-gray-400 hover:text-gray-600 p-1 rounded"
          title="Download Receipt"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
);

function PaymentsContent() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('paymentDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isMobile, setIsMobile] = useState(false);

  const {buyers}=useBuyers();
  const {invoices}=useInvoices();
  const {units}=useUnits();



  const isAdmin = session?.user?.role === ROLES.ADMIN;

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Build query parameters
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    paymentMethod: methodFilter !== 'all' ? methodFilter : undefined,
    dateRange: dateRange !== 'all' ? dateRange : undefined,
    sortBy,
    sortOrder,
    include: 'buyer,invoice,unit,project' // Include related data
  };

  // Fetch payments data directly from API
  const {
    data: paymentsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['payments', queryParams],
    queryFn: () => {
      if (isAdmin) {
        return paymentsApi.getAll(queryParams);
      } else {
        // For non-admin users, fetch only their payments
        const buyerId = session?.user?.buyerId;
        if (!buyerId) {
          throw new Error('User not linked to buyer account');
        }
        return paymentsApi.getByBuyer(buyerId, queryParams);
      }
    },
    enabled: !!session,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch payment statistics
  const {
    data: statsData,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['payment-stats', { 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      dateRange: dateRange !== 'all' ? dateRange : undefined
    }],
    queryFn: () => paymentsApi.getStats({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      dateRange: dateRange !== 'all' ? dateRange : undefined,
      buyerId: !isAdmin ? session?.user?.buyerId : undefined
    }),
    enabled: !!session,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  const payments = paymentsData || [];
  const totalCount = paymentsData?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const stats = statsData || {
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
    refundedAmount: 0
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleViewPayment = (payment) => {
    router.push(`/payments/${payment.id}`);
  };

  const handleExport = async () => {
    try {
      const blob = await paymentsApi.export(queryParams);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleRetryFailed = async () => {
    if (confirm('Retry all failed payments?')) {
      try {
        // This would need to be implemented in the API
        alert("Retry functionality will be implemented soon!");
      } catch (error) {
        console.error('Retry failed:', error);
        alert('Retry failed. Please try again.');
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setCurrentPage(1); // Reset to first page when filtering
    
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'method':
        setMethodFilter(value);
        break;
      case 'dateRange':
        setDateRange(value);
        break;
    }
  }, []);

  // Loading state
  if (isLoading && !paymentsData) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading payments...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Payments</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No access state
  if (!isAdmin && !session?.user?.buyerId) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Access</h3>
          <p className="text-gray-600">
            Your account is not linked to any buyer records. Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'Payments' : 'Your Payments'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {isAdmin 
              ? 'Track and manage all payment transactions'
              : 'View your payment history and transaction details'
            }
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => router.push('/payments/new')}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
            {formatPrice(stats.totalAmount)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
            {formatPrice(stats.completedAmount)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
            {formatPrice(stats.pendingAmount)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Failed</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <p className="text-xs sm:text-sm text-red-600 mt-1 sm:mt-2">
            {stats.failed > 0 ? 'Needs attention' : 'All good'}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={isAdmin ? "Search payments..." : "Search your payments..."}
                value={searchTerm}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value={PaymentStatuses.COMPLETED}>Completed</option>
                    <option value={PaymentStatuses.PENDING}>Pending</option>
                    <option value={PaymentStatuses.FAILED}>Failed</option>
                    <option value={PaymentStatuses.REFUNDED}>Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={methodFilter}
                    onChange={(e) => handleFilterChange('method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Methods</option>
                    <option value={PaymentMethods.MPESA_STKPUSH}>M-Pesa STK Push</option>
                    <option value={PaymentMethods.MPESA_PAYBILL}>M-Pesa Paybill</option>
                    <option value={PaymentMethods.CREDIT_CARD}>Credit Card</option>
                    <option value={PaymentMethods.WIRE_TRANSFER}>Wire Transfer</option>
                    <option value={PaymentMethods.CHECK}>Check</option>
                    <option value={PaymentMethods.ACH}>ACH</option>
                    <option value={PaymentMethods.CASH}>Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="1year">Last Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="paymentDate-desc">Date (Newest)</option>
                    <option value="paymentDate-asc">Date (Oldest)</option>
                    <option value="amount-desc">Amount (Highest)</option>
                    <option value="amount-asc">Amount (Lowest)</option>
                    <option value="transactionId-asc">Transaction ID (A-Z)</option>
                    <option value="transactionId-desc">Transaction ID (Z-A)</option>
                    <option value="status-asc">Status (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
            <span>
              Showing {payments.length} of {totalCount} payments
            </span>
            <div className="flex items-center space-x-4">
              <span>Completed: {stats.completed}</span>
              <span>Pending: {stats.pending}</span>
              <span>Failed: {stats.failed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List - Mobile Cards / Desktop Table */}
      {isMobile ? (
        // Mobile Card View
        <div className="space-y-4">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onView={handleViewPayment}
                isAdmin={isAdmin}
                buyer={buyers.find(b => b.id === payment.buyerId)}
                invoice={invoices.find(i => i.id === payment.invoiceId)}
                units={units}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg border p-8 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isAdmin ? 'No Payments Found' : 'No Payments Yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateRange !== 'all'
                  ? `No payments match your current filters.`
                  : isAdmin 
                    ? 'Payment transactions will appear here once recorded.'
                    : 'Your payment transactions will appear here once you make payments.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all' && methodFilter === 'all' && dateRange === 'all' && isAdmin) && (
                <button
                  onClick={() => router.push('/payments/new')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record New Payment
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        // Desktop Table View
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('transactionId')}
                  >
                    <div className="flex items-center">
                      Transaction
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                  )}
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      Amount & Method
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                      onView={handleViewPayment}
                      isAdmin={isAdmin}
                      buyer={buyers.find(b => b.id === payment.buyerId)}
                      invoice={invoices.find(i => i.id === payment.invoiceId)}
                      units={units}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? "6" : "5"} className="px-6 py-12 text-center">
                      <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isAdmin ? 'No Payments Found' : 'No Payments Yet'}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateRange !== 'all'
                          ? `No payments match your current filters.`
                          : isAdmin 
                            ? 'Payment transactions will appear here once recorded.'
                            : 'Your payment transactions will appear here once you make payments.'
                        }
                      </p>
                      {(!searchTerm && statusFilter === 'all' && methodFilter === 'all' && dateRange === 'all' && isAdmin) && (
                        <button
                          onClick={() => router.push('/payments/new')}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Record New Payment
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalCount} total payments)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={payments.length === 0}
          className="flex items-center justify-center px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export {isAdmin ? 'All' : 'Your'} Payments
        </button>

        {/* Admin Actions */}
        {isAdmin && stats.failed > 0 && (
          <button
            onClick={handleRetryFailed}
            className="flex items-center justify-center px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Failed Payments
          </button>
        )}
      </div>

      {/* Loading overlay for subsequent requests */}
      {isLoading && paymentsData && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Updating payments...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <PaymentsContent />
    </DashboardLayout>
  );
}
