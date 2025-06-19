'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Invoices, InvoiceStatuses } from '@/data/invoices';
import { Units } from '@/data/units';
import { Buyers } from '@/data/buyers';
import { Projects } from '@/data/projects';
import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
import { 
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
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
  Phone,
  Mail
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case InvoiceStatuses.PAID:
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Paid'
        };
      case InvoiceStatuses.PENDING:
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          label: 'Pending'
        };
      case InvoiceStatuses.OVERDUE:
        return {
          color: 'bg-red-100 text-red-800',
          icon: AlertTriangle,
          label: 'Overdue'
        };
      case InvoiceStatuses.CANCELLED:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: X,
          label: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: FileText,
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const InvoiceRow = ({ invoice, onView, isAdmin }) => {
  const unit = Units.find(u => u.id === invoice.unitId);
  const buyer = Buyers.find(b => b.id === invoice.buyerId);
  const project = Projects.find(p => p.id === invoice.projectId);

  const isOverdue = invoice.status === InvoiceStatuses.PENDING && 
                   new Date(invoice.dueDate) < new Date();

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {invoice.invoiceNumber}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(invoice.issueDate).toLocaleDateString()}
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
                {buyer?.email}
              </div>
            </div>
          </div>
        </td>
      )}
      
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
        <div className="text-sm font-medium text-gray-900">
          {formatPrice(invoice.totalAmount)}
        </div>
        <div className="text-sm text-gray-500">
          Due: {new Date(invoice.dueDate).toLocaleDateString()}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={isOverdue ? InvoiceStatuses.OVERDUE : invoice.status} />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onView(invoice)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded"
            title="View Invoice"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

function InvoicesContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('issueDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = session?.user?.role === ROLES.ADMIN;

  // Get user's buyer ID for filtering
  const getUserBuyerId = () => {
    if (session?.user?.buyerId) {
      return session.user.buyerId;
    }
    
    // Fallback: find buyer by email if buyerId not in session
    const buyer = Buyers.find(b => b.email === session?.user?.email);
    return buyer?.id || null;
  };

  const userBuyerId = getUserBuyerId();

  // Get filtered invoices based on user role
  const getFilteredInvoices = () => {
    if (isAdmin) {
      return Invoices; // Admin sees all invoices
    } else {
      // Regular users only see their own invoices
      return Invoices.filter(invoice => invoice.buyerId === userBuyerId);
    }
  };

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let filtered = getFilteredInvoices();

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(invoice => {
        const buyer = Buyers.find(b => b.id === invoice.buyerId);
        const unit = Units.find(u => u.id === invoice.unitId);
        const project = Projects.find(p => p.id === invoice.projectId);
        
        return (
          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (buyer && `${buyer.firstName} ${buyer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (project && project.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (unit && unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => {
        if (statusFilter === 'overdue') {
          return invoice.status === InvoiceStatuses.PENDING && 
                 new Date(invoice.dueDate) < new Date();
        }
        return invoice.status === statusFilter;
      });
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
      
      filtered = filtered.filter(invoice => 
        new Date(invoice.issueDate) >= filterDate
      );
    }

    // Sort invoices
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'invoiceNumber':
          aValue = a.invoiceNumber;
          bValue = b.invoiceNumber;
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.issueDate);
          bValue = new Date(b.issueDate);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, dateRange, sortBy, sortOrder, isAdmin, userBuyerId]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredInvoices.length;
    const paid = filteredInvoices.filter(i => i.status === InvoiceStatuses.PAID).length;
    const pending = filteredInvoices.filter(i => i.status === InvoiceStatuses.PENDING).length;
    const overdue = filteredInvoices.filter(i => 
      i.status === InvoiceStatuses.PENDING && new Date(i.dueDate) < new Date()
    ).length;
    const cancelled = filteredInvoices.filter(i => i.status === InvoiceStatuses.CANCELLED).length;
    
    const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const paidAmount = filteredInvoices
      .filter(i => i.status === InvoiceStatuses.PAID)
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const pendingAmount = filteredInvoices
      .filter(i => i.status === InvoiceStatuses.PENDING)
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    return {
      total,
      paid,
      pending,
      overdue,
      cancelled,
      totalAmount,
      paidAmount,
      pendingAmount
    };
  }, [filteredInvoices]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewInvoice = (invoice) => {
    router.push(`/invoices/${invoice.id}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'Invoices' : 'Your Invoices'}
          </h1>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Manage and track all invoices'
              : 'View your invoices and payment status'
            }
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => router.push('/invoices/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {isAdmin ? 'Total Invoices' : 'Your Invoices'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formatPrice(summaryStats.totalAmount)} total value
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">{summaryStats.paid}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formatPrice(summaryStats.paidAmount)} {isAdmin ? 'collected' : 'paid'}
          </p>
        </div>

        {/* <div className="bg-white rounded-lg shadow-sm border p-6"> */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{summaryStats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formatPrice(summaryStats.pendingAmount)} outstanding
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{summaryStats.overdue}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-sm text-red-600 mt-2">
            {isAdmin ? 'Requires attention' : 'Please pay soon'}
          </p>
        </div>
      </div>

      {/* User Alert for Overdue Invoices - Non-Admin Only */}
      {!isAdmin && summaryStats.overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">
                {summaryStats.overdue === 1 ? 'You have an overdue invoice' : `You have ${summaryStats.overdue} overdue invoices`}
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Please review and pay your overdue invoices to avoid late fees. 
                Contact support if you need assistance with payment arrangements.
              </p>
              <div className="mt-3 flex items-center space-x-4">
                <button
                  onClick={() => setStatusFilter('overdue')}
                  className="text-sm font-medium text-red-700 hover:text-red-800"
                >
                  View Overdue Invoices →
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

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={isAdmin ? "Search invoices..." : "Search your invoices..."}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <option value={InvoiceStatuses.PENDING}>Pending</option>
                    <option value={InvoiceStatuses.PAID}>Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value={InvoiceStatuses.CANCELLED}>Cancelled</option>
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
                    <option value="issueDate-desc">Issue Date (Newest)</option>
                    <option value="issueDate-asc">Issue Date (Oldest)</option>
                    <option value="dueDate-asc">Due Date (Earliest)</option>
                    <option value="dueDate-desc">Due Date (Latest)</option>
                    <option value="totalAmount-desc">Amount (Highest)</option>
                    <option value="totalAmount-asc">Amount (Lowest)</option>
                    <option value="invoiceNumber-asc">Invoice # (A-Z)</option>
                    <option value="invoiceNumber-desc">Invoice # (Z-A)</option>
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
              Showing {filteredInvoices.length} of {isAdmin ? Invoices.length : getFilteredInvoices().length} invoices
            </span>
            <div className="flex items-center space-x-4">
              <span>Paid: {summaryStats.paid}</span>
              <span>Pending: {summaryStats.pending}</span>
              <span>Overdue: {summaryStats.overdue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('invoiceNumber')}
                >
                  <div className="flex items-center">
                    Invoice
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center">
                    Amount
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
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
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    onView={handleViewInvoice}
                    isAdmin={isAdmin}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? "6" : "5"} className="px-6 py-12 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isAdmin ? 'No Invoices Found' : 'No Invoices Available'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || statusFilter !== 'all' || dateRange !== 'all'
                        ? (isAdmin ? 'No invoices match your current filters.' : 'No invoices match your current filters.')
                        : (isAdmin ? 'Get started by creating your first invoice.' : 'You don\'t have any invoices yet.')
                      }
                    </p>
                    {(!searchTerm && statusFilter === 'all' && dateRange === 'all' && isAdmin) && (
                      <button
                        onClick={() => router.push('/invoices/new')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Invoice
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Bulk Actions */}
      {isAdmin && filteredInvoices.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bulk Actions:</span>
              <button className="flex items-center px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-1" />
                Export Selected
              </button>
              <button className="flex items-center px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <FileText className="w-4 h-4 mr-1" />
                Send Reminders
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

      {/* User Export - Non-Admin Only */}
      {!isAdmin && filteredInvoices.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Export your invoice history:</span>
            <button className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* User Help Section - Non-Admin Only */}
      {!isAdmin && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help with Your Invoices?</h3>
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
            <h4 className="font-medium text-blue-900 mb-2">Common Questions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Payment Methods:</strong> We accept credit cards, bank transfers, and checks</li>
              <li>• <strong>Payment Plans:</strong> Contact us to discuss payment arrangement options</li>
              <li>• <strong>Late Fees:</strong> Applied 15 days after due date - call us to avoid fees</li>
              <li>• <strong>Receipts:</strong> Download receipts directly from each invoice</li>
            </ul>
          </div>
        </div>
      )}

      {/* No Access Message for Users Without Buyer Records */}
      {!isAdmin && !userBuyerId && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">Account Setup Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                We couldn't find your buyer profile. Please contact support to complete your account setup 
                and access your invoices.
              </p>
              <div className="mt-3 flex items-center space-x-4">
                <a 
                  href="tel:1-800-SUPPORT" 
                  className="text-sm font-medium text-yellow-700 hover:text-yellow-800"
                >
                  Call Support →
                </a>
                <span className="text-yellow-400">|</span>
                <a 
                  href="mailto:support@company.com" 
                  className="text-sm font-medium text-yellow-700 hover:text-yellow-800"
                >
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoicesPage() {
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

  // Allow access for all authenticated users
  const canViewInvoices = session.user.role === ROLES.ADMIN || 
                         session.user.role === ROLES.MANAGER ||
                         session.user.role === ROLES.CASHIER ||
                         session.user.role === ROLES.USER;

  if (!canViewInvoices) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view invoices.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <InvoicesContent />
    </DashboardLayout>
  );
}
