'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Payments, PaymentMethods, PaymentStatuses } from '@/data/payments';
import { Invoices } from '@/data/invoices';
import { Units } from '@/data/units';
import { Buyers } from '@/data/buyers';
import { Projects } from '@/data/projects';
import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
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
  X,
  ChevronDown,
  ArrowUpDown,
  User,
  Building,
  RefreshCw,
  TrendingUp,
  FileText
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
    default:
      return <CreditCard className="w-4 h-4 text-gray-600" />;
  }
};

const PaymentRow = ({ payment, onView }) => {
  const invoice = Invoices.find(i => i.id === payment.invoiceId);
  const unit = Units.find(u => u.id === payment.unitId);
  const buyer = Buyers.find(b => b.id === payment.buyerId);
  const project = Projects.find(p => p.id === invoice?.projectId);

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {payment.transactionId}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(payment.paymentDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </td>
      
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
              {buyer?.email}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatPrice(payment.amount)}
        </div>
        <div className="flex items-center mt-1">
          <PaymentMethodIcon method={payment.paymentMethod} />
          <span className="ml-2 text-sm text-gray-500 capitalize">
            {payment.paymentMethod.replace('_', ' ')}
          </span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Building className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">
              {project?.name || 'Unknown Project'}
            </div>
            <div className="text-sm text-gray-500">
              Unit {unit?.unitNumber || 'N/A'}
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
};

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

  const isAdmin = session?.user?.role === ROLES.ADMIN;

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let filtered = Payments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payment => {
        const buyer = Buyers.find(b => b.id === payment.buyerId);
        const unit = Units.find(u => u.id === payment.unitId);
        const invoice = Invoices.find(i => i.id === payment.invoiceId);
        const project = Projects.find(p => p.id === invoice?.projectId);
        
        return (
          payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (buyer && `${buyer.firstName} ${buyer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (project && project.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (unit && unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Filter by payment method
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === methodFilter);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
        case '1year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(payment => 
        new Date(payment.paymentDate) >= filterDate
      );
    }

    // Sort payments
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'transactionId':
          aValue = a.transactionId;
          bValue = b.transactionId;
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'paymentMethod':
          aValue = a.paymentMethod;
          bValue = b.paymentMethod;
          break;
        default:
          aValue = new Date(a.paymentDate);
          bValue = new Date(b.paymentDate);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, methodFilter, dateRange, sortBy, sortOrder]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredPayments.length;
    const completed = filteredPayments.filter(p => p.status === PaymentStatuses.COMPLETED).length;
    const pending = filteredPayments.filter(p => p.status === PaymentStatuses.PENDING).length;
    const failed = filteredPayments.filter(p => p.status === PaymentStatuses.FAILED).length;
    const refunded = filteredPayments.filter(p => p.status === PaymentStatuses.REFUNDED).length;
    
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const completedAmount = filteredPayments
      .filter(p => p.status === PaymentStatuses.COMPLETED)
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = filteredPayments
      .filter(p => p.status === PaymentStatuses.PENDING)
      .reduce((sum, payment) => sum + payment.amount, 0);
    const refundedAmount = filteredPayments
      .filter(p => p.status === PaymentStatuses.REFUNDED)
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      total,
      completed,
      pending,
      failed,
      refunded,
      totalAmount,
      completedAmount,
      pendingAmount,
      refundedAmount
    };
  }, [filteredPayments]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewPayment = (payment) => {
    router.push(`/payments/${payment.id}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments</h1>
          <p className="text-gray-600">Track and manage all payment transactions</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => router.push('/payments/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formatPrice(summaryStats.totalAmount)} total value
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{summaryStats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formatPrice(summaryStats.completedAmount)} processed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{summaryStats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formatPrice(summaryStats.pendingAmount)} processing
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{summaryStats.failed}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-sm text-red-600 mt-2">Requires attention</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Methods</option>
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
                    onChange={(e) => setDateRange(e.target.value)}
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
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredPayments.length} of {Payments.length} payments
            </span>
            <div className="flex items-center space-x-4">
              <span>Completed: {summaryStats.completed}</span>
              <span>Pending: {summaryStats.pending}</span>
              <span>Failed: {summaryStats.failed}</span>
            </div>
          </div>
          {/* see here */}
                  </div>
      </div>

      {/* Payments Table */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
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
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    onView={handleViewPayment}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateRange !== 'all'
                        ? 'No payments match your current filters.'
                        : 'Payment transactions will appear here once recorded.'
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

      {/* Payment Method Distribution */}
      {filteredPayments.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-4">
              {Object.values(PaymentMethods).map(method => {
                const methodPayments = filteredPayments.filter(p => p.paymentMethod === method);
                const methodAmount = methodPayments.reduce((sum, p) => sum + p.amount, 0);
                const percentage = summaryStats.totalAmount > 0 ? (methodAmount / summaryStats.totalAmount) * 100 : 0;
                
                return (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <PaymentMethodIcon method={method} />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {method.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right min-w-0">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPrice(methodAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {methodPayments.length} payments
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {filteredPayments
                .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                .slice(0, 5)
                .map(payment => {
                  const buyer = Buyers.find(b => b.id === payment.buyerId);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <PaymentMethodIcon method={payment.paymentMethod} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(payment.amount)}
                        </p>
                        <StatusBadge status={payment.status} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {isAdmin && filteredPayments.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bulk Actions:</span>
              <button className="flex items-center px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-1" />
                Export Selected
              </button>
              <button className="flex items-center px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry Failed
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-1" />
                Export All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user) {
    router.push('/login');
    return null;
  }

  return (
    <DashboardLayout>
      <PaymentsContent />
    </DashboardLayout>
  );
}

