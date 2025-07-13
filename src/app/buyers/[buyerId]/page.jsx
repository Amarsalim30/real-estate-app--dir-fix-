'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';

// import { Buyers } from '@/data/buyers';
// import { Invoices } from '@/data/invoices';
// import { Payments } from '@/data/payments';
// import { Units } from '@/data/units';
// import { Projects } from '@/data/projects';

import { useBuyer } from '@/hooks/useBuyers';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { useUnits } from '@/hooks/useUnits';
import { useProjects } from '@/hooks/useProjects';
import { formatPrice } from '@/utils/format';
import { ROLES, hasPermission } from '@/lib/roles';
import Link from 'next/link';
import { 
  ArrowLeft,
  User,
  Mail,
  Plus,
  Phone,
  MapPin,
  Calendar,
  Building,
  CreditCard,
  FileText,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Download,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Home,
  Receipt,
  TrendingUp,
  Activity,
  Copy,
  Check
} from 'lucide-react';

const InfoCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
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

const PropertyCard = ({ unit, project, invoice, payments }) => {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = invoice.totalAmount - totalPaid;
  const status = unit.soldTo ? 'sold' : 'reserved';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{project.name}</h4>
          <p className="text-sm text-gray-600">Unit {unit.unitNumber}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          status === 'sold' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {status === 'sold' ? 'Owned' : 'Reserved'}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Purchase Price:</span>
          <span className="font-medium">{formatPrice(invoice.totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Paid:</span>
          <span className="font-medium text-green-600">{formatPrice(totalPaid)}</span>
        </div>
        {remaining > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Remaining:</span>
            <span className="font-medium text-red-600">{formatPrice(remaining)}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{unit.type} • {unit.sqft} sq ft</span>
          <Link
            href={`/units/${unit.id}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export function BuyerProfileContent() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
const buyerId = useMemo(() => {
  const id = Number(params.buyerId);
  return isNaN(id) ? null : id;
}, [params.buyerId]);

  // const [Loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

const { buyer, loading, error } = useBuyer(buyerId);

  const { invoices: Invoices } = useInvoices();
  const { payments: Payments } = usePayments();
  const { units: Units } = useUnits();
  const { projects: Projects } = useProjects();

  const isAdmin = session?.user?.role === ROLES.ADMIN;
  const isOwnProfile = session?.user?.id === buyerId;
  

  console.log('Buyer Profile Content:', { buyer, loading, error });


// Calculate buyer statistics
const buyerStats = useMemo(() => {
  if (!buyer || !Invoices || !Payments || !Units) {
    return {
      properties: 0,
      ownedProperties: 0,
      reservedProperties: 0,
      totalInvoiced: 0,
      totalPaid: 0,
      outstanding: 0,
      invoiceCount: 0,
      paymentCount: 0,
      completedPayments: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      invoices: [],
      payments: [],
      units: []
    };
  }

  const buyerInvoices = Invoices.filter(inv => inv.buyerId === buyer.id) || [];
  const buyerPayments = Payments.filter(pay => pay.buyerId === buyer.id) || [];
  const buyerUnits = Units.filter(unit => 
    unit.soldTo === buyer.id || unit.reservedBy === buyer.id
  ) || [];

  const totalInvoiced = buyerInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = buyerPayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
  const outstanding = totalInvoiced - totalPaid;

  const completedPayments = buyerPayments.filter(p => p.status === 'completed').length;
  const pendingInvoices = buyerInvoices.filter(i => i.status === 'pending').length;
  const overdueInvoices = buyerInvoices.filter(i => 
    i.status === 'pending' && new Date(i.dueDate) < new Date()
  ).length;

  return {
    properties: buyerUnits.length,
    ownedProperties: buyerUnits.filter(u => u.soldTo === buyer.id).length,
    reservedProperties: buyerUnits.filter(u => u.reservedBy === buyer.id).length,
    totalInvoiced,
    totalPaid,
    outstanding,
    invoiceCount: buyerInvoices.length,
    paymentCount: buyerPayments.length,
    completedPayments,
    pendingInvoices,
    overdueInvoices,
    invoices: buyerInvoices,
    payments: buyerPayments,
    units: buyerUnits
  };
}, [buyer, Invoices, Payments, Units]);


  const handleEdit = () => {
    router.push(`/buyers/${buyerId}/edit`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this buyer? This action cannot be undone.')) {
      // Handle delete logic
      console.log('Delete buyer:', buyer);
      router.push('/buyers');
    }
  };

if (loading || !buyer) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

if (error) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Buyer</h2>
        <p className="text-gray-600 mb-4">{error}</p>
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


  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/buyers"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
{buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Loading...'}
              </h1>
              <p className="text-gray-600">{buyer.email}</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Properties</p>
              <p className="text-2xl font-bold text-blue-600">{buyerStats.properties}</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {buyerStats.ownedProperties} owned, {buyerStats.reservedProperties} reserved
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(buyerStats.totalPaid)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {buyerStats.completedPayments} payments made
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className={`text-2xl font-bold ${buyerStats.outstanding > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {formatPrice(buyerStats.outstanding)}
              </p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${buyerStats.outstanding > 0 ? 'text-red-600' : 'text-gray-400'}`} />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {buyerStats.pendingInvoices} pending invoices
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Credit Score</p>
              <p className={`text-2xl font-bold ${
                buyer.creditScore >= 750 ? 'text-green-600' :
                buyer.creditScore >= 700 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {buyer.creditScore || 'N/A'}
              </p>
            </div>
            <Star className={`w-8 h-8 ${
              buyer.creditScore >= 750 ? 'text-green-600' :
              buyer.creditScore >= 700 ? 'text-yellow-600' : 'text-red-600'
            }`} />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {buyer.creditScore >= 750 ? 'Excellent' :
             buyer.creditScore >= 700 ? 'Good' : 'Fair'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Personal Information */}
        <div className="lg:col-span-2">
          <InfoCard title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <div className="flex items-center">
                  <p className="text-gray-900">{buyer.firstName} {buyer.lastName}</p>
                  <CopyButton text={`${buyer.firstName} ${buyer.lastName}`} label="name" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <div className="flex items-center">
                  <p className="text-gray-900">{buyer.email}</p>
                  <CopyButton text={buyer.email} label="email" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <div className="flex items-center">
                  <p className="text-gray-900">{buyer.phoneNumber}</p>
                  <CopyButton text={buyer.phoneNumber} label="phone" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                <p className="text-gray-900">
                  {buyer.dateOfBirth ? new Date(buyer.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">KRA pin</label>
                <p className="text-gray-900">{buyer.kraPin || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">National ID</label>
                <p className="text-gray-900">
                  {buyer.nationalId ? buyer.nationalId : 'Not provided'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-2">Address</label>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-gray-900">
                    {buyer.address|| 'Kenya'}<br />
                    {buyer.city}, {buyer.state} {buyer.postalCode}
                  </p>
                </div>
              </div>
            </div>

            {buyer.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-2">Notes</label>
                <p className="text-gray-900">{buyer.notes}</p>
              </div>
            )}
          </InfoCard>
        </div>

        {/* Quick Actions */}
        <div>
          <InfoCard title="Quick Actions">
            <div className="space-y-3">
              <Link
                href={`/buyers/${buyer.id}/invoices`}
                className="flex items-center w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-900">View Invoices</p>
                  <p className="text-sm text-blue-600">{buyerStats.invoiceCount} total</p>
                </div>
              </Link>

              <Link
                href={`/buyers/${buyer.id}/statement`}
                className="flex items-center w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Receipt className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-900">Account Statement</p>
                  <p className="text-sm text-green-600">Full transaction history</p>
                </div>
              </Link>

              <Link
                href={`mailto:${buyer.email}`}
                className="flex items-center w-full px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-purple-900">Send Email</p>
                  <p className="text-sm text-purple-600">Contact buyer</p>
                </div>
              </Link>

              <Link
                href={`tel:${buyer.phone}`}
                className="flex items-center w-full px-4 py-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <Phone className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-orange-900">Call Buyer</p>
                  <p className="text-sm text-orange-600">{buyer.phone}</p>
                </div>
              </Link>

              {isAdmin && (
                <button
                  onClick={() => router.push(`/invoices/new?buyerId=${buyer.id}`)}
                  className="flex items-center w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Create Invoice</p>
                    <p className="text-sm text-gray-600">New billing</p>
                  </div>
                </button>
              )}
            </div>
          </InfoCard>

          {/* Account Status */}
          <InfoCard title="Account Status" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account Status</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  buyerStats.outstanding > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {buyerStats.outstanding > 0 ? 'Outstanding Balance' : 'Current'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="text-gray-900">
                  {new Date(buyer.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-gray-900">
                  {new Date(buyer.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Preferred Contact</span>
                <span className="text-gray-900 capitalize">
                  {buyer.preferredContactMethod || 'Email'}
                </span>
              </div>

              {buyerStats.overdueInvoices > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        {buyerStats.overdueInvoices} Overdue Invoice{buyerStats.overdueInvoices > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-red-600">Requires immediate attention</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Properties */}
      {buyerStats.units.length > 0 && (
        <InfoCard title="Properties" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buyerStats.units.map(unit => {
              const project = Projects.find(p => p.id === unit.projectId);
              const invoice = buyerStats.invoices.find(inv => inv.unitId === unit.id);
              const unitPayments = buyerStats.payments.filter(pay => pay.unitId === unit.id);
              
              return (
                <PropertyCard
                  key={unit.id}
                  unit={unit}
                  project={project}
                  invoice={invoice}
                  payments={unitPayments}
                />
              );
            })}
          </div>
        </InfoCard>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invoices */}
        <InfoCard title="Recent Invoices">
          <div className="space-y-3">
            {buyerStats.invoices.slice(0, 5).map(invoice => {
              const unit = Units.find(u => u.id === invoice.unitId);
              const project = Projects.find(p => p.id === invoice.projectId);
              
              return (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-xs text-gray-600">
                        {project?.name} - Unit {unit?.unitNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(invoice.totalAmount)}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {buyerStats.invoices.length === 0 && (
              <p className="text-gray-500 text-center py-4">No invoices found</p>
            )}
            
            {buyerStats.invoices.length > 5 && (
              <Link
                href={`/buyers/${buyer.id}/invoices`}
                className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
              >
                View All Invoices ({buyerStats.invoices.length})
              </Link>
            )}
          </div>
        </InfoCard>

        {/* Recent Payments */}
        <InfoCard title="Recent Payments">
          <div className="space-y-3">
            {buyerStats.payments.slice(0, 5).map(payment => {
              const unit = Units.find(u => u.id === payment.unitId);
              const project = Projects.find(p => p.id === Units.find(u => u.id === payment.unitId)?.projectId);
              
              return (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {payment.transactionId}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {formatPrice(payment.amount)}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {buyerStats.payments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No payments found</p>
            )}
            
            {buyerStats.payments.length > 5 && (
              <Link
                href={`/payments?buyerId=${buyer.id}`}
                className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
              >
                View All Payments ({buyerStats.payments.length})
              </Link>
            )}
          </div>
        </InfoCard>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Admin Actions</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Buyer
            </button>
            
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Buyer
            </button>
            
            <button
              onClick={() => router.push(`/invoices/new?buyerId=${buyer.id}`)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Invoice
            </button>
          </div>
          <p className="text-sm text-red-600 mt-2">
            ⚠️ These actions are irreversible. Please use with caution.
          </p>
        </div>
      )}
    </div>
  );
}

export default function BuyerProfilePage() {
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
            <p className="text-gray-600">Please sign in to view buyer details.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const canViewBuyers = session.user.role === ROLES.ADMIN || 
                       session.user.role === ROLES.MANAGER ||
                       session.user.role === ROLES.CASHIER;

  if (!canViewBuyers) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600">You don't have permission to view buyer details.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BuyerProfileContent />
    </DashboardLayout>
  );
}
