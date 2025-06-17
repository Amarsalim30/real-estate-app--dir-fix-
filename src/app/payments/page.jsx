'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Payments } from '@/data/payments2';
import { Buyers } from '@/data/buyers';
import { Units } from '@/data/units';
import { Projects } from '@/data/projects';
import { Invoices } from '@/data/invoices';
import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
import Link from 'next/link';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  User,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Plus,
  RefreshCw,
  ArrowUpDown,
  MoreVertical,
  Edit,
  Trash2,
  Receipt,
  Printer,
  TrendingUp,
  TrendingDown,
  Activity
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
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
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const PaymentCard = ({ payment, onView, onEdit, onDelete, onPrint }) => {
  const buyer = Buyers?.find(b => b.id === payment.buyerId);
  const invoice = Invoices?.find(i => i.id === payment.invoiceId);
  const unit = Units?.find(u => u.id === invoice?.unitId);
  const project = Projects?.find(p => p.id === unit?.projectId);

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment #{payment.paymentNumber}
              </h3>
              <StatusBadge status={payment.status} />
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{buyer?.firstName} {buyer?.lastName}</span>
              </div>
              
              {unit && (
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>{project?.name} - Unit {unit.unitNumber}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Paid: {new Date(payment.paymentDate).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center space-x-2">
                <PaymentMethodBadge method={payment.paymentMethod} />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(payment.amount)}
              </p>
              <p className="text-sm text-gray-500">
                {invoice && `Invoice #${invoice.invoiceNumber}`}
              </p>
            </div>

            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {payment.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">{payment.description}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <Link
              href={`/payments/${payment.id}`}
              className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Link>
            
            <button
              onClick={() => onPrint(payment)}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print Receipt
            </button>

            {payment.status === 'pending' && (
              <button
                onClick={() => onEdit(payment)}
                className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {payment.status === 'failed' && (
              <button className="flex items-center px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors">
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </button>
            )}
            
            {payment.status === 'completed' && invoice && (
              <Link
                href={`/invoices/${invoice.id}`}
                className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
              >
                <Receipt className="w-4 h-4 mr-1" />
                View Invoice
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentStats = ({ payments }) => {
  const stats = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter(p => p.status === 'completed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate this month vs last month
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const thisMonthPayments = payments.filter(p => 
      new Date(p.paymentDate) >= thisMonth && p.status === 'completed'
    );
    const lastMonthPayments = payments.filter(p => 
      new Date(p.paymentDate) >= lastMonth && 
      new Date(p.paymentDate) < thisMonth && 
      p.status === 'completed'
    );

    const thisMonthAmount = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const lastMonthAmount = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const monthlyGrowth = lastMonthAmount > 0 
      ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount * 100).toFixed(1)
      : 0;

    return {
      total,
      completed,
      pending,
      failed,
      totalAmount,
      completedAmount,
      pendingAmount,
      thisMonthAmount,
      monthlyGrowth: parseFloat(monthlyGrowth)
    };
  }, [payments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">{formatPrice(stats.totalAmount)}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-500 mt-1">{formatPrice(stats.completedAmount)}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">{formatPrice(stats.pendingAmount)}</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-purple-600">{formatPrice(stats.thisMonthAmount)}</p>
            <div className="flex items-center mt-1">
              {stats.monthlyGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stats.monthlyGrowth)}%
              </span>
            </div>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

function PaymentsContent() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('paymentDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const isAdmin = session?.user?.role === ROLES.ADMIN;
  const isCashier = session?.user?.role === ROLES.CASHIER || isAdmin;

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let filtered = Payments || [];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => {
        const buyer = Buyers?.find(b => b.id === payment.buyerId);
        const invoice = Invoices?.find(i => i.id === payment.invoiceId);
        const unit = Units?.find(u => u.id === invoice?.unitId);
        const project = Projects?.find(p => p.id === unit?.projectId);
        
        return (
          payment.paymentNumber?.toLowerCase().includes(term) ||
          `${buyer?.firstName} ${buyer?.lastName}`.toLowerCase().includes(term) ||
          buyer?.email?.toLowerCase().includes(term) ||
          unit?.unitNumber?.toLowerCase().includes(term) ||
          project?.name?.toLowerCase().includes(term) ||
          payment.description?.toLowerCase().includes(term)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Payment method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === methodFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'paymentDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortBy === 'buyerName') {
        const buyerA = Buyers?.find(buyer => buyer.id === a.buyerId);
        const buyerB = Buyers?.find(buyer => buyer.id === b.buyerId);
        aValue = `${buyerA?.firstName} ${buyerA?.lastName}`;
        bValue = `${buyerB?.firstName} ${buyerB?.lastName}`;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchTerm, statusFilter, methodFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleView = (payment) => {
    window.open(`/payments/${payment.id}`, '_blank');
  };

  const handleEdit = (payment) => {
    console.log('Edit payment:', payment);
  };

  const handleDelete = (payment) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      console.log('Delete payment:', payment);
    }
  };

  const handlePrint = (payment) => {
    window.open(`/payments/${payment.id}/receipt`, '_blank');
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
          <p className="text-gray-600">Track and manage all payment transactions</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => handleBulkAction('export')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          
          <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          
          {isCashier && (
            <Link
              href="/payments/new"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Link>
          )}
        </div>
      </div>

      {/* Statistics */}
      <PaymentStats payments={filteredPayments} />

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search payments, buyers, units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="paymentDate-desc">Newest First</option>
              <option value="paymentDate-asc">Oldest First</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="buyerName-asc">Buyer Name (A-Z)</option>
              <option value="buyerName-desc">Buyer Name (Z-A)</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
            </span>
            
            {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setMethodFilter('all');
                  setCurrentPage(1);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payments Grid */}
      {paginatedPayments.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {paginatedPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPrint={handlePrint}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || methodFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'No payment transactions have been recorded yet.'}
          </p>
          {isCashier && (
            <Link
              href="/payments/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions Panel */}
      {isCashier && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border p-4">
          <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <Link
              href="/payments/new"
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Link>
            
            <button
              onClick={() => handleBulkAction('reconcile')}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Reconcile
            </button>
            
            <button
              onClick={() => handleBulkAction('export-monthly')}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Monthly Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  const { data: session, status } = useSession();

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
            <p className="text-gray-600">Please sign in to view payments.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const canViewPayments = session.user.role === ROLES.ADMIN || 
                         session.user.role === ROLES.CASHIER || 
                                                  session.user.role === ROLES.MANAGER;

  if (!canViewPayments) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600">You don't have permission to view payments.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PaymentsContent />
    </DashboardLayout>
  );
}
