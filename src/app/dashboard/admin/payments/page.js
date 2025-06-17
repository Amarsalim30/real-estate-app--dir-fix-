'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Payments } from '@/data/payments';
import { Invoices } from '@/data/invoices';
import { Buyers } from '@/data/buyers';
import { Units } from '@/data/units';
import { Projects } from '@/data/projects';
import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  ArrowUpDown
} from 'lucide-react';

const StatusBadge = ({ status, type = 'payment' }) => {
  const getStatusConfig = () => {
    if (type === 'payment') {
      switch (status) {
        case 'completed':
          return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' };
        case 'pending':
          return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' };
        case 'failed':
          return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Failed' };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Unknown' };
      }
    } else {
      switch (status) {
        case 'paid':
          return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' };
        case 'pending':
          return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' };
        case 'overdue':
          return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Overdue' };
        case 'cancelled':
          return { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Cancelled' };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Unknown' };
      }
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const PaymentMethodBadge = ({ method }) => {
  const getMethodConfig = () => {
    switch (method) {
      case 'wire_transfer':
        return { color: 'bg-blue-100 text-blue-800', label: 'Wire Transfer' };
      case 'credit_card':
        return { color: 'bg-purple-100 text-purple-800', label: 'Credit Card' };
      case 'check':
        return { color: 'bg-green-100 text-green-800', label: 'Check' };
      case 'cash':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Cash' };
      case 'ach':
        return { color: 'bg-indigo-100 text-indigo-800', label: 'ACH' };
      case 'financing':
        return { color: 'bg-orange-100 text-orange-800', label: 'Financing' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  const config = getMethodConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};
function TransactionsContent() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const isAdmin = session?.user?.role === ROLES.ADMIN;

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let filtered = Payments?.filter(payment => {
      // Admin sees all, users see only their own
      if (!isAdmin && payment.buyerId !== parseInt(session?.user?.id)) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const buyer = Buyers?.find(b => b.id === payment.buyerId);
        const unit = Units?.find(u => u.id === payment.unitId);
        const searchLower = searchTerm.toLowerCase();
        
        if (
          !buyer?.firstName?.toLowerCase().includes(searchLower) &&
          !buyer?.lastName?.toLowerCase().includes(searchLower) &&
          !buyer?.email?.toLowerCase().includes(searchLower) &&
          !unit?.unitNumber?.toLowerCase().includes(searchLower) &&
          !payment.paymentMethod?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && payment.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (dateRange !== 'all') {
        const paymentDate = new Date(payment.paymentDate);
        const now = new Date();
        let cutoffDate;

        switch (dateRange) {
          case '7d':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            return true;
        }

        if (paymentDate < cutoffDate) {
          return false;
        }
      }

      return true;
    }) || [];

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'date':
          aValue = new Date(a.paymentDate);
          bValue = new Date(b.paymentDate);
          break;
        case 'buyer':
          const buyerA = Buyers?.find(buyer => buyer.id === a.buyerId);
          const buyerB = Buyers?.find(buyer => buyer.id === b.buyerId);
          aValue = `${buyerA?.firstName || ''} ${buyerA?.lastName || ''}`.toLowerCase();
          bValue = `${buyerB?.firstName || ''} ${buyerB?.lastName || ''}`.toLowerCase();
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, dateRange, sortBy, sortOrder, isAdmin, session?.user?.id]);

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let filtered = Invoices?.filter(invoice => {
      // Admin sees all, users see only their own
      if (!isAdmin && invoice.buyerId !== parseInt(session?.user?.id)) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const buyer = Buyers?.find(b => b.id === invoice.buyerId);
        const searchLower = searchTerm.toLowerCase();
        
        if (
          !buyer?.firstName?.toLowerCase().includes(searchLower) &&
          !buyer?.lastName?.toLowerCase().includes(searchLower) &&
          !buyer?.email?.toLowerCase().includes(searchLower) &&
          !invoice.invoiceNumber?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && invoice.status !== statusFilter) {
        return false;
      }

      return true;
    }) || [];

    // Sort invoices
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'amount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'date':
          aValue = new Date(a.issueDate);
          bValue = new Date(b.issueDate);
          break;
        case 'buyer':
          const buyerA = Buyers?.find(buyer => buyer.id === a.buyerId);
          const buyerB = Buyers?.find(buyer => buyer.id === b.buyerId);
          aValue = `${buyerA?.firstName || ''} ${buyerA?.lastName || ''}`.toLowerCase();
          bValue = `${buyerB?.firstName || ''} ${buyerB?.lastName || ''}`.toLowerCase();
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, sortBy, sortOrder, isAdmin, session?.user?.id]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalPayments = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalInvoices = filteredInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
    const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;
    const pendingInvoices = filteredInvoices.filter(i => i.status === 'pending').length;

    return {
      totalPayments,
      totalInvoices,
      pendingPayments,
      pendingInvoices
    };
  }, [filteredPayments, filteredInvoices]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-600 hover:text-gray-900"
    >
      <span>{children}</span>
      <ArrowUpDown className="w-4 h-4" />
    </button>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-gray-600">Manage payments and invoices</p>
        </div>
        
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          {isAdmin && (
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FileText className="w-4 h-4 mr-2" />
              Create Invoice
            </button>
          )}
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(summaryStats.totalPayments)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(summaryStats.totalInvoices)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.pendingPayments}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.pendingInvoices}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payments
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {filteredPayments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invoices
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {filteredInvoices.length}
              </span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton field="date">Date</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton field="buyer">Buyer</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton field="amount">Amount</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton field="status">Status</SortButton>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => {
                    const buyer = Buyers?.find(b => b.id === payment.buyerId);
                    const unit = Units?.find(u => u.id === payment.unitId);
                    const project = Projects?.find(p => p.id === unit?.projectId);

                    return (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown Buyer'}
                          </div>
                          <div className="text-sm text-gray-500">{buyer?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Unit {unit?.unitNumber || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{project?.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(payment.amount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PaymentMethodBadge method={payment.paymentMethod} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={payment.status} type="payment" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredPayments.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton field="date">Issue Date</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton field="buyer">Buyer</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton field="amount">Amount</SortButton>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortButton field="status">Status</SortButton>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => {
                    const buyer = Buyers?.find(b => b.id === invoice.buyerId);
                    const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status === 'pending';

                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown Buyer'}
                          </div>
                          <div className="text-sm text-gray-500">{buyer?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(invoice.totalAmount || 0)}
                        </td>
                                               <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                          </div>
                          {isOverdue && (
                            <div className="text-xs text-red-500">Overdue</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={isOverdue ? 'overdue' : invoice.status} type="invoice" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredInvoices.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
      <TransactionsContent />
  );
}
