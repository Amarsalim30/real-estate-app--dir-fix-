'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
// import { Buyers } from '@/data/buyers';
// import { Units } from '@/data/units';
// import { Projects } from '@/data/projects';
import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
import Link from 'next/link';
import { toast } from 'sonner'; 
import { useInvoices } from '@/hooks/useInvoices'; 
import { invoicesApi } from '@/lib/api/invoices';
import { useBuyers } from '@/hooks/useBuyers'; // Add this
import { useUnits } from '@/hooks/useUnits'; // Add this
import { useProjects } from '@/hooks/useProjects'; // Add this


import { 
  FileText, 
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
  Send,
  Printer
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Overdue' },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' },
    draft: { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Draft' }
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

function InvoiceCard({ invoice, onEdit, onDelete, onSend, onPrint, buyers, units, projects }) {
  const buyer = buyers?.find(b => b.id === invoice.buyerId);
  const unit = units?.find(u => u.id === invoice.unitId);
  const project = projects?.find(p => p.id === unit?.projectId);
  const isOverdue = invoice.status === 'pending' && new Date(invoice.dueDate) < new Date();
  const actualStatus = isOverdue ? 'overdue' : invoice.status;

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Invoice #{invoice.invoiceNumber}
              </h3>
              <StatusBadge status={actualStatus} />
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
                <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(invoice.totalAmount)}
              </p>
              <p className="text-sm text-gray-500">
                Created: {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onView(invoice)}
              className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </button>
            
            <button
              onClick={() => onEdit(invoice)}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>

            <button
              onClick={() => onPrint(invoice)}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {invoice.status === 'draft' && (
              <button
                onClick={() => onSend(invoice)}
                className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
              >
                <Send className="w-4 h-4 mr-1" />
                Send
              </button>
            )}
            
            {(invoice.status === 'pending' || invoice.status === 'overdue') && (
              <Link
                href={`/payments/new?invoiceId=${invoice.id}`}
                className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Record Payment
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InvoiceStats = ({ invoices }) => {
  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    const pending = invoices.filter(inv => inv.status === 'pending').length;
    const overdue = invoices.filter(inv => 
      inv.status === 'pending' && new Date(inv.dueDate) < new Date()
    ).length;
    const draft = invoices.filter(inv => inv.status === 'draft').length;

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'pending' && new Date(inv.dueDate) < new Date())
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      total,
      paid,
      pending,
      overdue,
      draft,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount
    };
  }, [invoices]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">{formatPrice(stats.totalAmount)}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Paid</p>
            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            <p className="text-sm text-gray-500 mt-1">{formatPrice(stats.paidAmount)}</p>
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
            <p className="text-sm font-medium text-gray-600">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-sm text-gray-500 mt-1">{formatPrice(stats.overdueAmount)}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

function InvoicesContent() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch all data using hooks
  const { invoices, loading: invoicesLoading, error: invoicesError, refetch } = useInvoices();
  const { buyers, loading: buyersLoading, error: buyersError } = useBuyers();
  const { units, loading: unitsLoading, error: unitsError } = useUnits();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();

  const isAdmin = session?.user?.role === ROLES.ADMIN;
  const isCashier = session?.user?.role === ROLES.CASHIER || isAdmin;

// Filter and sort invoices
const filteredInvoices = useMemo(() => {
  let filtered = invoices || [];

  // Search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(invoice => {
      const buyer = buyers?.find(b => b.id === invoice.buyerId); // Use buyers from hook
      const unit = units?.find(u => u.id === invoice.unitId); // Use units from hook
      const project = projects?.find(p => p.id === unit?.projectId); // Use projects from hook
      
      return (
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        `${buyer?.firstName} ${buyer?.lastName}`.toLowerCase().includes(term) ||
        buyer?.email?.toLowerCase().includes(term) ||
        unit?.unitNumber?.toLowerCase().includes(term) ||
        project?.name?.toLowerCase().includes(term)
      );
    });
  }

  // Status filter
  if (statusFilter !== 'all') {
    if (statusFilter === 'overdue') {
      filtered = filtered.filter(invoice => 
        invoice.status === 'pending' && new Date(invoice.dueDate) < new Date()
      );
    } else {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
  }

  // Sort
  filtered.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'buyerName') {
      const buyerA = buyers?.find(buyer => buyer.id === a.buyerId);
      const buyerB = buyers?.find(buyer => buyer.id === b.buyerId);
      aValue = `${buyerA?.firstName} ${buyerA?.lastName}`;
      bValue = `${buyerB?.firstName} ${buyerB?.lastName}`;
    } else if (sortBy === 'unitNumber') {
      const unitA = units?.find(unit => unit.id === a.unitId);
      const unitB = units?.find(unit => unit.id === b.unitId);
      aValue = unitA?.unitNumber;
      bValue = unitB?.unitNumber;
    } else if (sortBy === 'projectName') {
      const unitA = units?.find(unit => unit.id === a.unitId);
      const unitB = units?.find(unit => unit.id === b.unitId);
      const projectA = projects?.find(project => project.id === unitA?.projectId);
      const projectB = projects?.find(project => project.id === unitB?.projectId);
      aValue = projectA?.name;
      bValue = projectB?.name;
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return filtered;
}, [searchTerm, statusFilter, sortBy, sortOrder, invoices, buyers, units, projects]); // Add all dependencies


  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
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

  const handleView = (invoice) => {
    window.open(`/invoices/${invoice.id}`, '_blank');
  };

const handleEdit = async (invoice) => {
  // Navigate to edit page or open edit modal
  console.log('Edit invoice:', invoice);
};

const handleDelete = async (invoice) => {
  if (confirm('Are you sure you want to delete this invoice?')) {
    try {
      await invoicesApi.delete(invoice.id);
      toast.success('Invoice deleted successfully');
      refetch(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete invoice');
      console.error('Delete error:', error);
    }
  }
};

const handleSend = async (invoice) => {
  try {
    await invoicesApi.sendReminder(invoice.id);
    toast.success('Invoice sent successfully');
    refetch(); // Refresh the list
  } catch (error) {
    toast.error('Failed to send invoice');
    console.error('Send error:', error);
  }
};

const handlePrint = async (invoice) => {
  try {
    const pdfBlob = await invoicesApi.getPdf(invoice.id);
    const url = window.URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  } catch (error) {
    toast.error('Failed to generate PDF');
    console.error('PDF error:', error);
  }
};

const handleBulkAction = async (action) => {
  try {
    switch (action) {
      case 'export':
        // Handle export logic
        break;
      case 'send-reminders':
        // Handle bulk reminder sending
        break;
      case 'export-overdue':
        const overdueInvoices = await invoicesApi.getOverdue();
        // Handle overdue export
        break;
      default:
        break;
    }
  } catch (error) {
    toast.error(`Failed to ${action}`);
    console.error('Bulk action error:', error);
  }
};
// Check if any data is loading
const isLoading = invoicesLoading || buyersLoading || unitsLoading || projectsLoading;

// Check for any errors
const hasError = invoicesError || buyersError || unitsError || projectsError;
const errorMessage = invoicesError || buyersError || unitsError || projectsError;

if (isLoading) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoices data...</p>
        </div>
      </div>
    </div>
  );
}

if (hasError) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}



  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
          <p className="text-gray-600">Manage and track all invoices</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => handleBulkAction('export')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          
<button 
  onClick={refetch} // Change from generic function to refetch
  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
>
  <RefreshCw className="w-4 h-4 mr-2" />
  Refresh
</button>

          
          {isCashier && (
            <Link
              href="/invoices/new"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Link>
          )}
        </div>
      </div>

      {/* Statistics */}
      <InvoiceStats invoices={filteredInvoices} />

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search invoices, buyers, units..."
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
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
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
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="totalAmount-desc">Amount (High to Low)</option>
              <option value="totalAmount-asc">Amount (Low to High)</option>
              <option value="buyerName-asc">Buyer Name (A-Z)</option>
              <option value="buyerName-desc">Buyer Name (Z-A)</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
            </span>
            
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
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

      {/* Invoices Grid */}
      {paginatedInvoices.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {paginatedInvoices.map((invoice) => (
    <InvoiceCard
      key={invoice.id}
      invoice={invoice}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onSend={handleSend}
      onPrint={handlePrint}
      buyers={buyers} // Pass buyers data
      units={units}   // Pass units data
      projects={projects} // Pass projects data
    />
  ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
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
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Get started by creating your first invoice.'}
          </p>
          {isCashier && (
            <Link
              href="/invoices/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
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
              href="/invoices/new"
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Link>
            
            <button
              onClick={() => handleBulkAction('send-reminders')}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Reminders
            </button>
            
            <button
              onClick={() => handleBulkAction('export-overdue')}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Overdue
            </button>
          </div>
        </div>
      )}

{/* Overdue Invoices Alert */}
{filteredInvoices.filter(inv => 
  inv.status === 'pending' && new Date(inv.dueDate) < new Date()
).length > 0 && (
  <div className="fixed top-20 right-6 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
    <div className="flex items-start space-x-3">
      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
      <div>
        <h4 className="text-sm font-medium text-red-900">Overdue Invoices</h4>
        <p className="text-sm text-red-700 mt-1">
          You have {filteredInvoices.filter(inv => 
            inv.status === 'pending' && new Date(inv.dueDate) < new Date()
          ).length} overdue invoices requiring attention.
        </p>
        <button
          onClick={() => setStatusFilter('overdue')}
          className="text-sm text-red-600 hover:text-red-700 font-medium mt-2"
        >
          View overdue invoices →
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default function InvoicesPage() {
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
            <p className="text-gray-600">Please sign in to view invoices.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user has permission to view invoices
  const canViewInvoices = session.user.role === ROLES.ADMIN || 
                         session.user.role === ROLES.CASHIER || 
                         session.user.role === ROLES.MANAGER;

  if (!canViewInvoices) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Insufficient Permissions</h2>
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
