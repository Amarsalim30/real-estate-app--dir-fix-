'use client';
import { useState, useMemo ,useEffect} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useBuyers } from '@/hooks/useBuyers';
import { useProjects } from '@/hooks/useProjects';
import { useUnits } from '@/hooks/useUnits';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { formatPrice } from '@/utils/format';
import { ROLES, hasPermission } from '@/lib/roles';
import Link from 'next/link';
import { 
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ArrowUpDown,
  Download,
  Star,
  DollarSign
} from 'lucide-react';

const BuyerCard = ({ buyer, stats, onView, onEdit }) => (
  <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {buyer.firstName} {buyer.lastName}
            </h3>
            <p className="text-sm text-gray-600">{buyer.email}</p>
          </div>
        </div>
        
        {buyer.creditScore && (
          <div className="text-right">
            <div className="text-sm text-gray-500">Credit Score</div>
            <div className={`text-lg font-bold ${
              buyer.creditScore >= 750 ? 'text-green-600' :
              buyer.creditScore >= 700 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {buyer.creditScore}
            </div>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          {buyer.phone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {buyer.city}, {buyer.state}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{stats.properties}</div>
          <div className="text-xs text-gray-600">Properties</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{formatPrice(stats.totalPaid)}</div>
          <div className="text-xs text-gray-600">Paid</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${stats.outstanding > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {formatPrice(stats.outstanding)}
          </div>
          <div className="text-xs text-gray-600">Outstanding</div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          stats.outstanding > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {stats.outstanding > 0 ? 'Has Outstanding Balance' : 'Account Current'}
        </span>
        
        <div className="text-xs text-gray-500">
          Member since {new Date(buyer.createdAt).getFullYear()}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onView(buyer)}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Profile
        </button>
        <button
          onClick={() => onEdit(buyer)}
          className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <Edit className="w-4 h-4" />
        </button>
        <Link
          href={`mailto:${buyer.email}`}
          className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <Mail className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </div>
);

const BuyerRow = ({ buyer, stats, onView, onEdit }) => (
  <tr className="hover:bg-gray-50 border-b border-gray-200">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">
            {buyer.firstName} {buyer.lastName}
          </div>
          <div className="text-sm text-gray-500">{buyer.email}</div>
        </div>
      </div>
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">{buyer.phone}</div>
      <div className="text-sm text-gray-500">{buyer.city}, {buyer.state}</div>
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap text-center">
      <div className="text-sm font-medium text-gray-900">{stats.properties}</div>
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-green-600">{formatPrice(stats.totalPaid)}</div>
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap">
      <div className={`text-sm font-medium ${stats.outstanding > 0 ? 'text-red-600' : 'text-gray-600'}`}>
        {formatPrice(stats.outstanding)}
      </div>
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap">
      {buyer.creditScore && (
        <div className={`text-sm font-medium ${
          buyer.creditScore >= 750 ? 'text-green-600' :
          buyer.creditScore >= 700 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {buyer.creditScore}
        </div>
      )}
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        stats.outstanding > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
      }`}>
        {stats.outstanding > 0 ? 'Outstanding' : 'Current'}
      </span>
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={() => onView(buyer)}
          className="text-blue-600 hover:text-blue-900 p-1 rounded"
          title="View Profile"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(buyer)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded"
          title="Edit Buyer"
        >
          <Edit className="w-4 h-4" />
        </button>
        <Link
          href={`mailto:${buyer.email}`}
          className="text-gray-400 hover:text-gray-600 p-1 rounded"
          title="Send Email"
        >
          <Mail className="w-4 h-4" />
        </Link>
      </div>
    </td>
  </tr>
);

function BuyersContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table'); // table or cards
  const [showFilters, setShowFilters] = useState(false);
  const { projects, loading: isLoading, error } = useProjects();
  const { buyers } = useBuyers();
  const { units } = useUnits();
  const { invoices } = useInvoices();
  const { payments } = usePayments();


  // Calculate buyer statistics
  const buyersWithStats = useMemo(() => {
    if (!buyers || !Array.isArray(buyers)) return [];
    if (!invoices || !Array.isArray(invoices)) return [];
    if (!payments || !Array.isArray(payments)) return [];
    if (!units || !Array.isArray(units)) return [];

    return buyers.map(buyer => {
      const buyerInvoices = invoices.filter(inv => inv.buyerId === buyer.id);
      const buyerPayments = payments.filter(pay => pay.buyerId === buyer.id);
      const buyerUnits = units.filter(unit => 
        unit.soldTo === buyer.id || unit.reservedBy === buyer.id
      );

      const totalInvoiced = buyerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const totalPaid = buyerPayments.reduce((sum, pay) => sum + pay.amount, 0);
      const outstanding = totalInvoiced - totalPaid;

      return {
        ...buyer,
        stats: {
          properties: buyerUnits.length,
          totalInvoiced,
          totalPaid,
          outstanding,
          invoiceCount: buyerInvoices.length,
          paymentCount: buyerPayments.length
        }
      };
    });
  }, [buyers, invoices, payments, units]);

  // Filter and sort buyers
  const filteredBuyers = useMemo(() => {
    if (!buyersWithStats || !Array.isArray(buyersWithStats)) {
      return [];
    }
    
    let filtered = buyersWithStats;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(buyer =>
        `${buyer.firstName} ${buyer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.phone.includes(searchTerm) ||
        buyer.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(buyer => {
        switch (statusFilter) {
          case 'current':
            return buyer.stats.outstanding <= 0;
          case 'outstanding':
            return buyer.stats.outstanding > 0;
          case 'active':
            return buyer.stats.properties > 0;
          case 'inactive':
            return buyer.stats.properties === 0;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'properties':
          aValue = a.stats.properties;
          bValue = b.stats.properties;
          break;
        case 'totalPaid':
          aValue = a.stats.totalPaid;
          bValue = b.stats.totalPaid;
          break;
        case 'outstanding':
          aValue = a.stats.outstanding;
          bValue = b.stats.outstanding;
          break;
        case 'creditScore':
          aValue = a.creditScore || 0;
          bValue = b.creditScore || 0;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [buyersWithStats, searchTerm, statusFilter, sortBy, sortOrder]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredBuyers.length;
    const active = filteredBuyers.filter(b => b.stats.properties > 0).length;
    const withOutstanding = filteredBuyers.filter(b => b.stats.outstanding > 0).length;
    const totalRevenue = filteredBuyers.reduce((sum, b) => sum + b.stats.totalPaid, 0);
    const totalOutstanding = filteredBuyers.reduce((sum, b) => sum + b.stats.outstanding, 0);
    const avgCreditScore = filteredBuyers
      .filter(b => b.creditScore)
      .reduce((sum, b, _, arr) => sum + b.creditScore / arr.length, 0);

    return {
      total,
      active,
      withOutstanding,
      totalRevenue,
      totalOutstanding,
      avgCreditScore: Math.round(avgCreditScore)
    };
  }, [filteredBuyers]);

    if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const handleViewBuyer = (buyer) => {
    router.push(`/buyers/${buyer.id}`);
  };

  const handleEditBuyer = (buyer) => {
    router.push(`/buyers/${buyer.id}/edit`);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyers Management</h1>
          <p className="text-gray-600">Manage and track all registered buyers</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </button>
          
          <button
            onClick={() => router.push('/buyers/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Buyer
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Buyers</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {summaryStats.active} active buyers
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(summaryStats.totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            From all buyers
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">{formatPrice(summaryStats.totalOutstanding)}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {summaryStats.withOutstanding} buyers with balance
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Credit Score</p>
              <p className="text-2xl font-bold text-purple-600">{summaryStats.avgCreditScore || 'N/A'}</p>
            </div>
            <Star className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Across all buyers
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
                placeholder="Search buyers..."
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
                    <option value="all">All Buyers</option>
                    <option value="active">Active (Has Properties)</option>
                    <option value="inactive">Inactive (No Properties)</option>
                    <option value="current">Account Current</option>
                    <option value="outstanding">Has Outstanding Balance</option>
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
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="properties-desc">Most Properties</option>
                    <option value="totalPaid-desc">Highest Revenue</option>
                    <option value="outstanding-desc">Highest Outstanding</option>
                    <option value="creditScore-desc">Highest Credit Score</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setSortBy('createdAt');
                      setSortOrder('desc');
                    }}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredBuyers?.length || 0} of {buyers?.length || 0} buyers
            </span>
            <div className="flex items-center space-x-4">
              <span>Active: {summaryStats.active}</span>
              <span>Outstanding: {summaryStats.withOutstanding}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buyers List */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuyers.length > 0 ? (
            filteredBuyers.map((buyer) => (
              <BuyerCard
                key={buyer.id}
                buyer={buyer}
                stats={buyer.stats}
                onView={handleViewBuyer}
                onEdit={handleEditBuyer}
              />
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow-sm border p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Buyers Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'No buyers match your current filters.'
                  : 'Get started by adding your first buyer.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <button
                  onClick={() => router.push('/buyers/new')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Buyer
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Buyer
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('properties')}
                  >
                    <div className="flex items-center justify-center">
                      Properties
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalPaid')}
                  >
                    <div className="flex items-center">
                      Total Paid
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('outstanding')}
                  >
                    <div className="flex items-center">
                      Outstanding
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('creditScore')}
                  >
                    <div className="flex items-center">
                      Credit Score
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuyers.length > 0 ? (
                  filteredBuyers.map((buyer) => (
                    <BuyerRow
                      key={buyer.id}
                      buyer={buyer}
                      stats={buyer.stats}
                      onView={handleViewBuyer}
                      onEdit={handleEditBuyer}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Buyers Found</h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No buyers match your current filters.'
                          : 'Get started by adding your first buyer.'
                        }
                      </p>
                      {(!searchTerm && statusFilter === 'all') && (
                        <button
                          onClick={() => router.push('/buyers/new')}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Buyer
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

      {/* Bulk Actions */}
      {filteredBuyers.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bulk Actions:</span>
              <button className="flex items-center px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <Mail className="w-4 h-4 mr-1" />
                Send Email
              </button>
              <button className="flex items-center px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <FileText className="w-4 h-4 mr-1" />
                Generate Reports
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

export default function BuyersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  if (status === 'unauthenticated') {
    return null; // prevent rendering until redirected
  }

    if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Admin only access
  if (!hasPermission(session.user.role, 'buyers', 'read')) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view buyers.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BuyersContent />
    </DashboardLayout>
  );
}
