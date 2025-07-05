'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';


import { InvoiceStatuses } from '@/data/invoices';
// import { Payments } from '@/data/payments';
// import { Units } from '@/data/units';
// import { Projects } from '@/data/projects';

import {useBuyer} from '@/hooks/useBuyers';
import {useInvoices} from '@/hooks/useInvoices';
import {usePayments} from '@/hooks/usePayments';
import {useUnits} from '@/hooks/useUnits';
import {useProjects} from '@/hooks/useProjects';

import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
import Link from 'next/link';
import { 
  ArrowLeft,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
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
  Plus,
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

const InvoiceRow = ({ invoice, onView ,Units , Projects, Payments }) => {
if (!Units || !Projects || !Payments) {
    return (
      <tr className="hover:bg-gray-50 border-b border-gray-200">
        <td colSpan="7" className="px-6 py-4 text-center text-gray-600">
          Loading invoice data...
        </td>
      </tr>
    );
  }

  const unit = Units.find(u => u.id === invoice.unitId);
  const project = Projects.find(p => p.id === invoice.projectId);
  const payments = Payments.filter(p => p.invoiceId === invoice.id);
  
  // Add validation for missing related data
  if (!unit || !project) {
    return (
      <tr className="hover:bg-gray-50 border-b border-gray-200">
        <td colSpan="7" className="px-6 py-4 text-center text-red-600">
          Missing data for invoice {invoice.invoiceNumber}
        </td>
      </tr>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = invoice.totalAmount - totalPaid;

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
        {totalPaid > 0 && (
          <div className="text-sm text-green-600">
            {formatPrice(totalPaid)} paid
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {new Date(invoice.dueDate).toLocaleDateString()}
        </div>
        {isOverdue && (
          <div className="text-sm text-red-600">
            Overdue
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        {remaining > 0 ? (
          <div className="text-sm font-medium text-red-600">
            {formatPrice(remaining)}
          </div>
        ) : (
          <div className="text-sm text-green-600">
            Paid in full
          </div>
        )}
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

function BuyerInvoicesContent() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const buyerId = parseInt(params.buyerId);
  const {buyer} = useBuyer(buyerId);

  const {invoices: Invoices, loading: invoicesLoading} = useInvoices();
  const {payments: Payments, loading: paymentsLoading} = usePayments();
  const {units: Units, loading: unitsLoading} = useUnits();
  const {projects: Projects, loading: projectsLoading} = useProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('issueDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = session?.user?.role === ROLES.ADMIN;
    const buyerInvoices = Invoices.filter(invoice => invoice.buyerId === buyerId);


  // // FIRST: Check if data is still loading
  // if (invoicesLoading || paymentsLoading || unitsLoading || projectsLoading) {
  //   return (
  //     <div className="p-6">
  //       <div className="flex items-center justify-center py-12">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //         <span className="ml-3 text-gray-600">Loading invoices...</span>
  //       </div>
  //     </div>
  //   );
  // }

  // // SECOND: Check if data failed to load (only after loading is complete)
  // if (!Invoices || !Payments || !Units || !Projects) {
  //   return (
  //     <div className="p-6">
  //       <div className="text-center py-12">
  //         <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">Data Loading Error</h3>
  //         <p className="text-gray-600">Unable to load invoice data. Please refresh the page.</p>
  //         <button 
  //           onClick={() => window.location.reload()} 
  //           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //         >
  //           Refresh Page
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // Get buyer's invoices - add safety check


    // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
      if (!buyerInvoices || !Array.isArray(buyerInvoices)) {
    return [];
  }
    let filtered = buyerInvoices;

  // Filter by search term
  if (searchTerm && filtered.length > 0) {
    filtered = filtered.filter(invoice => {
      const unit = Units?.find(u => u.id === invoice.unitId);
      const project = Projects?.find(p => p.id === invoice.projectId);
      
      return (
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project && project.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (unit && unit.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }

  // Filter by status
  if (statusFilter !== 'all' && filtered.length > 0) {
    filtered = filtered.filter(invoice => {
      if (statusFilter === 'overdue') {
        return invoice.status === InvoiceStatuses.PENDING && 
               new Date(invoice.dueDate) < new Date();
      }
      return invoice.status === statusFilter;
    });
  }

  // Filter by date range
  if (dateRange !== 'all' && filtered.length > 0) {
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

  // Sort invoices - ensure we still have an array
  if (Array.isArray(filtered) && filtered.length > 0) {
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'invoiceNumber':
          aValue = a.invoiceNumber || '';
          bValue = b.invoiceNumber || '';
          break;
        case 'totalAmount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate || 0);
          bValue = new Date(b.dueDate || 0);
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          aValue = new Date(a.issueDate || 0);
          bValue = new Date(b.issueDate || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  return filtered;
}, [buyerInvoices, searchTerm, statusFilter, dateRange, sortBy, sortOrder, Units, Projects]);


// Calculate summary statistics
const summaryStats = useMemo(() => {
  // Safety check
  if (!Array.isArray(filteredInvoices) || !Array.isArray(Payments)) {
    return {
      total: 0, paid: 0, pending: 0, overdue: 0, cancelled: 0,
      totalAmount: 0, paidAmount: 0, pendingAmount: 0,
      totalPaidAmount: 0, outstandingAmount: 0
    };
  }

  const total = filteredInvoices.length;
  const paid = filteredInvoices.filter(i => i.status === InvoiceStatuses.PAID).length;
  const pending = filteredInvoices.filter(i => i.status === InvoiceStatuses.PENDING).length;
  const overdue = filteredInvoices.filter(i => 
    i.status === InvoiceStatuses.PENDING && new Date(i.dueDate) < new Date()
  ).length;
  const cancelled = filteredInvoices.filter(i => i.status === InvoiceStatuses.CANCELLED).length;
  
  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
  const paidAmount = filteredInvoices
    .filter(i => i.status === InvoiceStatuses.PAID)
    .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
  const pendingAmount = filteredInvoices
    .filter(i => i.status === InvoiceStatuses.PENDING)
    .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);

  // Calculate total paid across all invoices (including partial payments)
  const allPayments = Payments.filter(p => 
    filteredInvoices.some(inv => inv.id === p.invoiceId)
  );
  const totalPaidAmount = allPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const outstandingAmount = totalAmount - totalPaidAmount;

  return {
    total, paid, pending, overdue, cancelled,
    totalAmount, paidAmount, pendingAmount,
    totalPaidAmount, outstandingAmount
  };
}, [filteredInvoices, Payments]);


  if (!buyer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Buyer Not Found</h2>
          <p className="text-gray-600 mb-4">The buyer you're looking for doesn't exist.</p>
          <Link
            href="/buyers"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Buyers
          </Link>
        </div>
      </div>
    );
  }


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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href={`/buyers/${buyerId}`}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Invoices for {buyer.firstName} {buyer.lastName}
            </h1>
            <p className="text-gray-600">Manage and track all invoices for this buyer</p>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.open(`mailto:${buyer.email}`, '_blank')}
              className=" text-blue-600 flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="text-blue-600 w-4 h-4 mr-2" />
              Email Buyer
            </button>
            <button
              onClick={() => router.push(`/invoices/new?buyerId=${buyerId}`)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </button>
          </div>
        )}
      </div>

      {/* Buyer Info Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {buyer.firstName} {buyer.lastName}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{buyer.email}</span>
              <span>{buyer.phone}</span>
              <span>Member since {new Date(buyer.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Credit Score</div>
            <div className={`text-lg font-semibold ${
              buyer.creditScore >= 750 ? 'text-green-600' :
              buyer.creditScore >= 700 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {buyer.creditScore || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
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
            {formatPrice(summaryStats.totalPaidAmount)} collected
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                {formatPrice(summaryStats.outstandingAmount)}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {summaryStats.pending} pending invoices
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{summaryStats.overdue}</p>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-sm text-red-600 mt-2">
            {summaryStats.overdue > 0 ? 'Requires attention' : 'All current'}
          </p>
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
                placeholder="Search invoices..."
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
              Showing {filteredInvoices.length} of {buyerInvoices.length} invoices
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
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center">
                    Due Date
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
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
                    Units={Units}
                    Projects={Projects}
                    Payments={Payments}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || statusFilter !== 'all' || dateRange !== 'all'
                        ? 'No invoices match your current filters.'
                        : 'This buyer has no invoices yet.'
                      }
                    </p>
                    {(!searchTerm && statusFilter === 'all' && dateRange === 'all' && isAdmin) && (
                      <button
                        onClick={() => router.push(`/invoices/new?buyerId=${buyerId}`)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Invoice
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Summary */}
      {filteredInvoices.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(summaryStats.totalPaidAmount)}
              </div>
              <div className="text-sm text-green-700 mt-1">Total Paid</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {formatPrice(summaryStats.outstandingAmount)}
              </div>
              <div className="text-sm text-yellow-700 mt-1">Outstanding Balance</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {summaryStats.outstandingAmount > 0 
                  ? `${((summaryStats.totalPaidAmount / summaryStats.totalAmount) * 100).toFixed(1)}%`
                  : '100%'
                }
              </div>
              <div className="text-sm text-blue-700 mt-1">Payment Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
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
                <Mail className="w-4 h-4 mr-1" />
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
    </div>
  );
}

export default function BuyerInvoicesPage() {
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
            <p className="text-gray-600">Please sign in to view buyer invoices.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const canViewInvoices = session.user.role === ROLES.ADMIN || 
                         session.user.role === ROLES.MANAGER ||
                         session.user.role === ROLES.CASHIER;

  if (!canViewInvoices) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600">You don't have permission to view buyer invoices.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BuyerInvoicesContent />
    </DashboardLayout>
  );
}
