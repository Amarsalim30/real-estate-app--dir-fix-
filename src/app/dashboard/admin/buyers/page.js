'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Buyers } from '@/data/buyers';
import { Units } from '@/data/units';
import { Projects } from '@/data/projects';
import { Payments } from '@/data/payments';
import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  Home,
  Star,
  MoreVertical,
  UserPlus,
  Download,
  ArrowUpDown
} from 'lucide-react';

const CustomerStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', label: 'Active' };
      case 'prospect':
        return { color: 'bg-blue-100 text-blue-800', label: 'Prospect' };
      case 'inactive':
        return { color: 'bg-gray-100 text-gray-800', label: 'Inactive' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const CustomerCard = ({ customer, onView, onEdit, onContact }) => {
  const customerUnits = Units?.filter(unit => 
    unit.reservedBy === customer.id || unit.soldTo === customer.id
  ) || [];
  
  const customerPayments = Payments?.filter(payment => 
    payment.buyerId === customer.id
  ) || [];
  
  const totalSpent = customerPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-blue-600">
              {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h3>
            <p className="text-sm text-gray-600">{customer.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <CustomerStatusBadge status={customer.status || 'prospect'} />
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-gray-900">{customerUnits.length}</div>
          <div className="text-sm text-gray-600">Units</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-gray-900">{formatPrice(totalSpent)}</div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          {customer.phone || 'No phone'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {customer.address ? `${customer.address.city}, ${customer.address.state}` : 'No address'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          Joined {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Unknown'}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onView(customer)}
          className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </button>
        <button
          onClick={() => onContact(customer)}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Mail className="w-4 h-4 mr-1" />
          Contact
        </button>
      </div>
    </div>
  );
};

function CustomersContent() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const isAdmin = session?.user?.role === ROLES.ADMIN;

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = Buyers?.filter(buyer => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !buyer.firstName?.toLowerCase().includes(searchLower) &&
          !buyer.lastName?.toLowerCase().includes(searchLower) &&
          !buyer.email?.toLowerCase().includes(searchLower) &&
          !buyer.phone?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        const buyerStatus = buyer.status || 'prospect';
        if (buyerStatus !== statusFilter) {
          return false;
        }
      }

      return true;
    }) || [];

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
          bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'date':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'spent':
          const aSpent = Payments?.filter(p => p.buyerId === a.id).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
          const bSpent = Payments?.filter(p => p.buyerId === b.id).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
          aValue = aSpent;
          bValue = bSpent;
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
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCustomers = filteredCustomers.length;
    const activeCustomers = filteredCustomers.filter(c => (c.status || 'prospect') === 'active').length;
    const prospects = filteredCustomers.filter(c => (c.status || 'prospect') === 'prospect').length;
    const totalRevenue = filteredCustomers.reduce((sum, customer) => {
      const customerPayments = Payments?.filter(p => p.buyerId === customer.id) || [];
      return sum + customerPayments.reduce((pSum, payment) => pSum + (payment.amount || 0), 0);
    }, 0);

    return {
      totalCustomers,
      activeCustomers,
      prospects,
      totalRevenue
    };
  }, [filteredCustomers]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleContactCustomer = (customer) => {
    // Open email client or show contact modal
    window.location.href = `mailto:${customer.email}`;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          {isAdmin && (
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalCustomers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.activeCustomers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Star className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Prospects</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.prospects}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(summaryStats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
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
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inactive</option>
            </select>

            <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium rounded-r-lg border-l ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onView={handleViewCustomer}
              onContact={handleContactCustomer}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="name">Customer</SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="spent">Total Spent</SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="date">Join Date</SortButton>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => {
                  const customerUnits = Units?.filter(unit => 
                    unit.reservedBy === customer.id || unit.soldTo === customer.id
                  ) || [];
                  
                  const customerPayments = Payments?.filter(payment => 
                    payment.buyerId === customer.id
                  ) || [];
                  
                  const totalSpent = customerPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-semibold text-blue-600">
                              {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.phone || 'No phone'}</div>
                        <div className="text-sm text-gray-500">
                          {customer.address ? `${customer.address.city}, ${customer.address.state}` : 'No address'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{customerUnits.length}</div>
                        <div className="text-sm text-gray-500">
                          {customerUnits.filter(u => u.status === 'sold').length} sold, {customerUnits.filter(u => u.status === 'reserved').length} reserved
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(totalSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CustomerStatusBadge status={customer.status || 'prospect'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleContactCustomer(customer)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Info */}
                <div className="lg:col-span-1">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-semibold text-blue-600">
                        {selectedCustomer.firstName?.charAt(0)}{selectedCustomer.lastName?.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedCustomer.email}</p>
                    <div className="mt-2">
                      <CustomerStatusBadge status={selectedCustomer.status || 'prospect'} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedCustomer.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-gray-900">
                        {selectedCustomer.address ? 
                          `${selectedCustomer.address.street}, ${selectedCustomer.address.city}, ${selectedCustomer.address.state} ${selectedCustomer.address.zipCode}` :
                          'Not provided'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Annual Income</label>
                      <p className="text-gray-900">{selectedCustomer.annualIncome ? formatPrice(selectedCustomer.annualIncome) : 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Credit Score</label>
                      <p className="text-gray-900">{selectedCustomer.creditScore || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Join Date</label>
                      <p className="text-gray-900">
                        {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Activity */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Units */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Units</h4>
                      <div className="space-y-3">
                        {Units?.filter(unit => 
                          unit.reservedBy === selectedCustomer.id || unit.soldTo === selectedCustomer.id
                        ).map(unit => {
                          const project = Projects?.find(p => p.id === unit.projectId);
                          return (
                            <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Unit {unit.unitNumber}</div>
                                <div className="text-sm text-gray-600">{project?.name}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">{formatPrice(unit.price)}</div>
                                <div className="text-sm text-gray-600 capitalize">{unit.status}</div>
                              </div>
                            </div>
                          );
                        }) || (
                          <p className="text-gray-500 text-center py-4">No units found</p>
                        )}
                      </div>
                    </div>

                    {/* Payment History */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h4>
                      <div className="space-y-3">
                        {Payments?.filter(payment => payment.buyerId === selectedCustomer.id)
                          .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                          .map(payment => {
                            const unit = Units?.find(u => u.id === payment.unitId);
                            return (
                              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    Payment for Unit {unit?.unitNumber || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Date N/A'} • 
                                    <span className="capitalize ml-1">{payment.paymentMethod?.replace('_', ' ')}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">{formatPrice(payment.amount)}</div>
                                  <div className="text-sm">
                                    <StatusBadge status={payment.status} type="payment" />
                                  </div>
                                </div>
                              </div>
                            );
                          }) || (
                          <p className="text-gray-500 text-center py-4">No payments found</p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Notes</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{selectedCustomer.notes || 'No notes available'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleContactCustomer(selectedCustomer)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomersPage() {
  return (
      <CustomersContent />
  );
}
