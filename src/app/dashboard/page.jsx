'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Invoices, InvoiceStatuses } from '@/data/invoices';
import { Payments, PaymentStatuses } from '@/data/payments';
import { Units } from '@/data/units';
import { Projects } from '@/data/projects';
import { Buyers } from '@/data/buyers';
import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
import Link from 'next/link';
import { 
  Building,
  CreditCard,
  FileText,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Phone,
  Mail,
  MapPin,
  Home,
  Receipt,
  Bell,
  Settings,
  HelpCircle,
  ArrowRight,
  Star,
  Shield,
  Activity,
  PieChart,
  BarChart3
} from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, onClick }) => (
  <div 
    className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center">
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-sm text-green-600">{trend}</span>
      </div>
    )}
  </div>
);

const QuickActionCard = ({ title, description, icon: Icon, color, onClick, href }) => {
  const content = (
    <div className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all hover:scale-105 cursor-pointer`}>
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
};

const RecentActivityItem = ({ icon: Icon, title, description, date, status, color }) => (
  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100')} mt-0.5`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-xs text-gray-500 mt-1">{date}</p>
    </div>
    {status && (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        status === 'completed' ? 'bg-green-100 text-green-800' :
        status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        status === 'overdue' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    )}
  </div>
);

const PropertyCard = ({ unit, project, status, onClick }) => (
  <div 
    className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      <div className="absolute top-4 left-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          status === 'sold' ? 'bg-green-100 text-green-800' :
          status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {status === 'sold' ? 'Owned' : status === 'reserved' ? 'Reserved' : 'Available'}
        </span>
      </div>
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-lg font-semibold">{project?.name}</h3>
        <p className="text-sm opacity-90">Unit {unit?.unitNumber}</p>
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{unit?.type} • {unit?.sqft} sq ft</span>
        <span className="text-lg font-bold text-gray-900">{formatPrice(unit?.price)}</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <MapPin className="w-4 h-4 mr-1" />
        {project?.city}, {project?.state}
      </div>
    </div>
  </div>
);

function DashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Get user's buyer information
  const getUserBuyerId = () => {
    if (session?.user?.buyerId) {
      return session.user.buyerId;
    }
    
    const buyer = Buyers.find(b => b.email === session?.user?.email);
    return buyer?.id || null;
  };

  const userBuyerId = getUserBuyerId();
  const buyer = Buyers.find(b => b.id === userBuyerId);
  const isAdmin = session?.user?.role === ROLES.ADMIN;

  // Get user's data
  const userInvoices = useMemo(() => {
    if (isAdmin) return Invoices;
    return Invoices.filter(invoice => invoice.buyerId === userBuyerId);
  }, [userBuyerId, isAdmin]);

  const userPayments = useMemo(() => {
    if (isAdmin) return Payments;
    return Payments.filter(payment => payment.buyerId === userBuyerId);
  }, [userBuyerId, isAdmin]);

  const userUnits = useMemo(() => {
    if (isAdmin) return Units;
    return Units.filter(unit => 
      unit.soldTo === userBuyerId || unit.reservedBy === userBuyerId
    );
  }, [userBuyerId, isAdmin]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalInvoices = userInvoices.length;
    const paidInvoices = userInvoices.filter(i => i.status === InvoiceStatuses.PAID).length;
    const pendingInvoices = userInvoices.filter(i => i.status === InvoiceStatuses.PENDING).length;
    const overdueInvoices = userInvoices.filter(i => 
      i.status === InvoiceStatuses.PENDING && new Date(i.dueDate) < new Date()
    ).length;

    const totalAmount = userInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const paidAmount = userInvoices
      .filter(i => i.status === InvoiceStatuses.PAID)
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const pendingAmount = userInvoices
      .filter(i => i.status === InvoiceStatuses.PENDING)
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    const completedPayments = userPayments.filter(p => p.status === PaymentStatuses.COMPLETED).length;
    const totalPaymentAmount = userPayments
      .filter(p => p.status === PaymentStatuses.COMPLETED)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const ownedUnits = userUnits.filter(u => u.soldTo === userBuyerId).length;
    const reservedUnits = userUnits.filter(u => u.reservedBy === userBuyerId).length;

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      completedPayments,
      totalPaymentAmount,
      ownedUnits,
      reservedUnits
    };
  }, [userInvoices, userPayments, userUnits, userBuyerId]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities = [];

    // Add recent payments
    userPayments
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 3)
      .forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          icon: CreditCard,
          title: 'Payment Processed',
          description: `${formatPrice(payment.amount)} payment completed`,
          date: new Date(payment.paymentDate).toLocaleDateString(),
          status: payment.status,
          color: 'text-green-600'
        });
      });

    // Add recent invoices
    userInvoices
      .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
      .slice(0, 2)
      .forEach(invoice => {
        const isOverdue = invoice.status === InvoiceStatuses.PENDING && 
                         new Date(invoice.dueDate) < new Date();
        activities.push({
          id: `invoice-${invoice.id}`,
          icon: FileText,
          title: 'Invoice Generated',
          description: `Invoice ${invoice.invoiceNumber} for ${formatPrice(invoice.totalAmount)}`,
          date: new Date(invoice.issueDate).toLocaleDateString(),
          status: isOverdue ? 'overdue' : invoice.status,
          color: 'text-blue-600'
        });
      });

    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [userPayments, userInvoices]);

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session.user.name || buyer?.firstName || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin 
                ? 'Here\'s your admin dashboard overview' 
                : 'Here\'s what\'s happening with your properties and account'
              }
            </p>
          </div>
          
        </div>
      </div>

      {/* Alert for Overdue Invoices */}
      {!isAdmin && stats.overdueInvoices > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900">
                {stats.overdueInvoices === 1 ? 'You have an overdue invoice' : `You have ${stats.overdueInvoices} overdue invoices`}
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Please review and pay your overdue invoices to avoid late fees.
              </p>
              <div className="mt-3 flex items-center space-x-4">
                <Link
                  href="/invoices"
                  className="text-sm font-medium text-red-700 hover:text-red-800"
                >
                  View Invoices →
                </Link>
                <span className="text-red-400">|</span>
                <a href="tel:1-800-SUPPORT" className="text-sm font-medium text-red-700 hover:text-red-800">
                  Call Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
          {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isAdmin ? (
          <>
            <StatCard
              title="Total Properties"
              value={Units.length}
              subtitle={`${Units.filter(u => u.status === 'available').length} available`}
              icon={Building}
              color="text-blue-600"
              onClick={() => router.push('/units')}
            />
            <StatCard
              title="Total Revenue"
              value={formatPrice(stats.totalPaymentAmount)}
              subtitle={`${stats.completedPayments} payments`}
              icon={DollarSign}
              color="text-green-600"
              onClick={() => router.push('/payments')}
            />
            <StatCard
              title="Active Invoices"
              value={stats.totalInvoices}
              subtitle={`${stats.pendingInvoices} pending`}
              icon={FileText}
              color="text-purple-600"
              onClick={() => router.push('/invoices')}
            />
            <StatCard
              title="Total Buyers"
              value={Buyers.length}
              subtitle="Registered buyers"
              icon={User}
              color="text-orange-600"
              onClick={() => router.push('/buyers')}
            />
          </>
        ) : (
          <>
            <StatCard
              title="My Properties"
              value={stats.ownedUnits + stats.reservedUnits}
              subtitle={`${stats.ownedUnits} owned, ${stats.reservedUnits} reserved`}
              icon={Home}
              color="text-blue-600"
              onClick={() => setActiveTab('properties')}
            />
            <StatCard
              title="Total Invested"
              value={formatPrice(stats.paidAmount)}
              subtitle={`${stats.completedPayments} payments made`}
              icon={DollarSign}
              color="text-green-600"
              onClick={() => router.push('/payments')}
            />
            <StatCard
              title="Outstanding Balance"
              value={formatPrice(stats.pendingAmount)}
              subtitle={`${stats.pendingInvoices} pending invoices`}
              icon={Receipt}
              color={stats.overdueInvoices > 0 ? "text-red-600" : "text-yellow-600"}
              onClick={() => router.push('/invoices')}
            />
            <StatCard
              title="Account Status"
              value={stats.overdueInvoices > 0 ? "Action Required" : "Good Standing"}
              subtitle={buyer?.creditScore ? `Credit Score: ${buyer.creditScore}` : "Verified account"}
              icon={stats.overdueInvoices > 0 ? AlertTriangle : Shield}
              color={stats.overdueInvoices > 0 ? "text-red-600" : "text-green-600"}
            />
          </>
        )}
      </div>

      {/* Tab Navigation for Non-Admin Users */}
      {!isAdmin && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'properties', name: 'My Properties', icon: Home },
                { id: 'invoices', name: 'Invoices', icon: FileText },
                { id: 'payments', name: 'Payments', icon: CreditCard },
                { id: 'profile', name: 'Profile', icon: User }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {(isAdmin || activeTab === 'overview') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {isAdmin ? (
                  <>
                    <QuickActionCard
                      title="Add New Property"
                      description="List a new unit for sale"
                      icon={Building}
                      color="text-blue-600"
                      href="/units/new"
                    />
                    <QuickActionCard
                      title="Create Invoice"
                      description="Generate a new invoice"
                      icon={FileText}
                      color="text-purple-600"
                      href="/invoices/new"
                    />
                    <QuickActionCard
                      title="Record Payment"
                      description="Log a new payment"
                      icon={CreditCard}
                      color="text-green-600"
                      href="/payments/new"
                    />
                    <QuickActionCard
                      title="Add Buyer"
                      description="Register a new buyer"
                      icon={User}
                      color="text-orange-600"
                      href="/buyers/new"
                    />
                  </>
                ) : (
                  <>
                    <QuickActionCard
                      title="Pay Outstanding Invoices"
                      description="View and pay pending invoices"
                      icon={CreditCard}
                      color="text-green-600"
                      href="/invoices"
                    />
                    <QuickActionCard
                      title="View Payment History"
                      description="See all your payments"
                      icon={Receipt}
                      color="text-blue-600"
                      href="/payments"
                    />
                    <QuickActionCard
                      title="Browse Properties"
                      description="Explore available units"
                      icon={Building}
                      color="text-purple-600"
                      href="/projects"
                    />
                    <QuickActionCard
                      title="Update Profile"
                      description="Manage your account info"
                      icon={Settings}
                      color="text-gray-600"
                      onClick={() => setActiveTab('profile')}
                    />
                    <QuickActionCard
                      title="Get Support"
                      description="Contact our support team"
                      icon={HelpCircle}
                      color="text-orange-600"
                      href="tel:1-800-SUPPORT"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Link
                  href={isAdmin ? "/dashboard/activity" : "/invoices"}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-1">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <RecentActivityItem
                      key={activity.id}
                      icon={activity.icon}
                      title={activity.title}
                      description={activity.description}
                      date={activity.date}
                      status={activity.status}
                      color={activity.color}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400">Your recent transactions will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Properties Tab */}
      {!isAdmin && activeTab === 'properties' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
            <Link
              href="/projects"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse More Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {userUnits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userUnits.map((unit) => {
                const project = Projects.find(p => p.id === unit.projectId);
                const status = unit.soldTo === userBuyerId ? 'sold' : 'reserved';
                return (
                  <PropertyCard
                    key={unit.id}
                    unit={unit}
                    project={project}
                    status={status}
                    onClick={() => router.push(`/units/${unit.id}`)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased or reserved any properties yet. Browse our available units to get started.
              </p>
              <Link
                href="/projects"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Properties
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {!isAdmin && activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">My Invoices</h2>
            <Link
              href="/invoices"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Invoices →
            </Link>
          </div>

          {userInvoices.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
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
                    {userInvoices.slice(0, 5).map((invoice) => {
                      const isOverdue = invoice.status === InvoiceStatuses.PENDING && 
                                       new Date(invoice.dueDate) < new Date();
                      return (
                        <tr key={invoice.id} className="hover:bg-gray-50">
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
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(invoice.totalAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                              {new Date(invoice.dueDate).toLocaleDateString()}
                              {isOverdue && <span className="block text-xs">OVERDUE</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              invoice.status === InvoiceStatuses.PAID ? 'bg-green-100 text-green-800' :
                              isOverdue ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status === InvoiceStatuses.PAID ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                                                          <Link
                                href={`/invoices/${invoice.id}`}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="View Invoice"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              {invoice.status === InvoiceStatuses.PENDING && (
                                <button
                                  onClick={() => router.push(`/invoices/${invoice.id}/pay`)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded"
                                  title="Pay Now"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>
                              )}
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
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Yet</h3>
              <p className="text-gray-600">
                Your invoices will appear here once you make a purchase or reservation.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {!isAdmin && activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
            <Link
              href="/payments"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Payments →
            </Link>
          </div>

          {userPayments.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
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
                    {userPayments.slice(0, 5).map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.transactionId || `Payment #${payment.id}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(payment.paymentDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(payment.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {payment.paymentMethod.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === PaymentStatuses.COMPLETED ? 'bg-green-100 text-green-800' :
                            payment.status === PaymentStatuses.PENDING ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/payments/${payment.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="View Payment"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              className="text-gray-400 hover:text-gray-600 p-1 rounded"
                              title="Download Receipt"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Yet</h3>
              <p className="text-gray-600">
                Your payment history will appear here once you make your first payment.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {!isAdmin && activeTab === 'profile' && buyer && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                    <p className="text-gray-900">{buyer.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                    <p className="text-gray-900">{buyer.lastName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                  <p className="text-gray-900">{buyer.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                  <p className="text-gray-900">{buyer.phone}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                  <p className="text-gray-900">
                    {buyer.dateOfBirth ? new Date(buyer.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Occupation</label>
                  <p className="text-gray-900">{buyer.occupation || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Street Address</label>
                  <p className="text-gray-900">{buyer.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                    <p className="text-gray-900">{buyer.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                    <p className="text-gray-900">{buyer.state}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">ZIP Code</label>
                  <p className="text-gray-900">{buyer.zipCode}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Preferred Contact Method</label>
                  <p className="text-gray-900 capitalize">{buyer.preferredContactMethod || 'Email'}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
              <div className="space-y-4">
                {buyer.annualIncome && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Annual Income</label>
                    <p className="text-gray-900">{formatPrice(buyer.annualIncome)}</p>
                  </div>
                )}
                
                {buyer.creditScore && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Credit Score</label>
                    <div className="flex items-center">
                      <p className="text-gray-900 mr-2">{buyer.creditScore}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        buyer.creditScore >= 750 ? 'bg-green-100 text-green-800' :
                        buyer.creditScore >= 700 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {buyer.creditScore >= 750 ? 'Excellent' :
                         buyer.creditScore >= 700 ? 'Good' : 'Fair'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Account Status</label>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      stats.overdueInvoices > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {stats.overdueInvoices > 0 ? 'Action Required' : 'Good Standing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {new Date(buyer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Properties Owned</span>
                  <span className="font-medium text-gray-900">{stats.ownedUnits}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Properties Reserved</span>
                  <span className="font-medium text-gray-900">{stats.reservedUnits}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Invested</span>
                  <span className="font-medium text-green-600">{formatPrice(stats.paidAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Outstanding Balance</span>
                  <span className={`font-medium ${stats.pendingAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatPrice(stats.pendingAmount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Payments Made</span>
                  <span className="font-medium text-gray-900">{stats.completedPayments}</span>
                </div>
              </div>
                           <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Settings className="w-4 h-4 mr-2" />
                  Update Profile Information
                </button>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {buyer.notes && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Notes</h3>
              <p className="text-gray-700">{buyer.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Admin-specific sections */}
      {isAdmin && (
        <>
          {/* Admin Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Sales Performance */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Units Sold This Month</span>
                  <span className="text-2xl font-bold text-green-600">
                    {Units.filter(u => u.status === 'sold').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Units Reserved</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {Units.filter(u => u.status === 'reserved').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available Units</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {Units.filter(u => u.status === 'available').length}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {((Units.filter(u => u.status === 'sold').length / Units.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(stats.totalPaymentAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pending Collections</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {formatPrice(stats.pendingAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Sale Price</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(Units.reduce((sum, unit) => sum + unit.price, 0) / Units.length)}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Collection Rate</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {((stats.paidAmount / (stats.paidAmount + stats.pendingAmount)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <div className="flex items-center space-x-2">
                <Link
                  href="/payments"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Payments
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href="/invoices"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Invoices
                </Link>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Customer</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Payments, ...Invoices.map(inv => ({...inv, type: 'invoice'}))]
                    .sort((a, b) => new Date(b.paymentDate || b.issueDate) - new Date(a.paymentDate || a.issueDate))
                    .slice(0, 8)
                    .map((transaction) => {
                      const isPayment = transaction.paymentDate;
                      const buyer = Buyers.find(b => b.id === transaction.buyerId);
                      return (
                        <tr key={`${isPayment ? 'payment' : 'invoice'}-${transaction.id}`} className="border-b border-gray-100">
                          <td className="py-3 text-sm text-gray-900">
                            {new Date(transaction.paymentDate || transaction.issueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isPayment ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isPayment ? 'Payment' : 'Invoice'}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-900">
                            {buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown'}
                          </td>
                          <td className="py-3 text-sm font-medium text-gray-900">
                            {formatPrice(transaction.amount || transaction.totalAmount)}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'completed' || transaction.status === 'paid' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              href={`/${isPayment ? 'payments' : 'invoices'}/${transaction.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Support Section for Non-Admin Users */}
      {!isAdmin && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Our support team is here to help you with any questions about your properties, payments, or account.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Call Support</p>
                    <p className="text-sm text-gray-600">1-800-SUPPORT</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">support@company.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Business Hours</p>
                    <p className="text-sm text-gray-600">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
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

  if (!session?.user) {
    router.push('/login');
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
