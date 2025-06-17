'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import { Buyers } from '@/data/buyers';
import { Invoices } from '@/data/invoices';
import { Payments } from '@/data/payments';
import { formatPrice } from '@/utils/formatPrice';
import { ROLES } from '@/lib/roles';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState('30'); // days

  // Check admin authorization
  if (!session?.user || session.user.role !== ROLES.ADMIN) {
    router.push('/dashboard');
    return null;
  }

  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    const totalProjects = Projects.length;
    const totalUnits = Units.length;
    const availableUnits = Units.filter(unit => unit.status === 'available').length;
    const reservedUnits = Units.filter(unit => unit.status === 'reserved').length;
    const soldUnits = Units.filter(unit => unit.status === 'sold').length;
    
    const totalRevenue = Invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalPayments = Payments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstandingBalance = totalRevenue - totalPayments;
    
    const activeBuyers = Buyers.length;
    const pendingInvoices = Invoices.filter(invoice => invoice.status === 'pending').length;
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSales = Units.filter(unit => 
      unit.soldDate && unit.soldDate >= thirtyDaysAgo
    ).length;
    
    const recentPayments = Payments.filter(payment => 
      payment.paymentDate >= thirtyDaysAgo
    );
    
    const recentPaymentAmount = recentPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      totalProjects,
      totalUnits,
      availableUnits,
      reservedUnits,
      soldUnits,
      totalRevenue,
      totalPayments,
      outstandingBalance,
      activeBuyers,
      pendingInvoices,
      recentSales,
      recentPaymentAmount,
      salesRate: totalUnits > 0 ? ((soldUnits + reservedUnits) / totalUnits * 100).toFixed(1) : 0
    };
  }, []);

  // Recent transactions for activity feed
  const recentActivity = useMemo(() => {
    const activities = [];
    
    // Recent payments
    const recentPayments = Payments
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 5)
      .map(payment => {
        const buyer = Buyers.find(b => b.id === payment.buyerId);
        const unit = Units.find(u => u.id === payment.unitId);
        return {
          id: `payment-${payment.id}`,
          type: 'payment',
          date: payment.paymentDate,
          description: `Payment received from ${buyer?.firstName} ${buyer?.lastName} for Unit ${unit?.unitNumber}`,
          amount: payment.amount,
          status: payment.status
        };
      });
    
    // Recent sales
    const recentSales = Units
      .filter(unit => unit.soldDate)
      .sort((a, b) => new Date(b.soldDate) - new Date(a.soldDate))
      .slice(0, 5)
      .map(unit => {
        const buyer = Buyers.find(b => b.id === unit.soldTo);
        const project = Projects.find(p => p.id === unit.projectId);
        return {
          id: `sale-${unit.id}`,
          type: 'sale',
          date: unit.soldDate,
          description: `Unit ${unit.unitNumber} in ${project?.name} sold to ${buyer?.firstName} ${buyer?.lastName}`,
          amount: unit.price,
          status: 'completed'
        };
      });
    
    // Recent reservations
    const recentReservations = Units
      .filter(unit => unit.reservedDate)
      .sort((a, b) => new Date(b.reservedDate) - new Date(a.reservedDate))
      .slice(0, 5)
      .map(unit => {
        const buyer = Buyers.find(b => b.id === unit.reservedBy);
        const project = Projects.find(p => p.id === unit.projectId);
        return {
          id: `reservation-${unit.id}`,
          type: 'reservation',
          date: unit.reservedDate,
          description: `Unit ${unit.unitNumber} in ${project?.name} reserved by ${buyer?.firstName} ${buyer?.lastName}`,
          amount: unit.price,
          status: 'reserved'
        };
      });
    
    return [...activities, ...recentPayments, ...recentSales, ...recentReservations]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, []);

  // Project performance data
  const projectPerformance = useMemo(() => {
    return Projects.map(project => {
      const projectUnits = Units.filter(unit => unit.projectId === project.id);
      const soldUnits = projectUnits.filter(unit => unit.status === 'sold');
      const reservedUnits = projectUnits.filter(unit => unit.status === 'reserved');
      const totalRevenue = soldUnits.reduce((sum, unit) => sum + unit.price, 0);
      
      return {
        ...project,
        totalUnits: projectUnits.length,
        soldUnits: soldUnits.length,
        reservedUnits: reservedUnits.length,
        availableUnits: projectUnits.filter(unit => unit.status === 'available').length,
        totalRevenue,
        salesRate: projectUnits.length > 0 ? ((soldUnits.length + reservedUnits.length) / projectUnits.length * 100).toFixed(1) : 0
      };
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        collapsed={collapsed} 
        toggleSidebar={() => setCollapsed(!collapsed)}
        currentPath="/dashboard/admin"
      />

      <div className="flex-1 flex flex-col">
        <Header session={session} />
        
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Overview of your real estate business</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">{formatPrice(metrics.totalRevenue)}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Outstanding: {formatPrice(metrics.outstandingBalance)}
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Units Sold</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.soldUnits}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {metrics.recentSales} this month
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🏠</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Sales Rate</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.salesRate}%</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {metrics.soldUnits + metrics.reservedUnits} of {metrics.totalUnits} units
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Active Buyers</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.activeBuyers}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {metrics.pendingInvoices} pending invoices
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-xl">👥</span>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Status Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Available</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.availableUnits}</div>
                    <div className="text-sm text-gray-500">
                      {((metrics.availableUnits / metrics.totalUnits) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">Reserved</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.reservedUnits}</div>
                    <div className="text-sm text-gray-500">
                      {((metrics.reservedUnits / metrics.totalUnits) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-700">Sold</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.soldUnits}</div>
                    <div className="text-sm text-gray-500">
                      {((metrics.soldUnits / metrics.totalUnits) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Visual Progress Bar */}
              <div className="mt-6">
                <div className="flex rounded-full overflow-hidden h-3">
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(metrics.availableUnits / metrics.totalUnits) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-blue-500" 
                    style={{ width: `${(metrics.reservedUnits / metrics.totalUnits) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-gray-500" 
                    style={{ width: `${(metrics.soldUnits / metrics.totalUnits) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                      activity.type === 'sale' ? 'bg-blue-100 text-blue-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.type === 'payment' ? '💳' : 
                       activity.type === 'sale' ? '🏠' : '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {activity.date.toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(activity.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Performance */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Project Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reserved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projectPerformance.map(project => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{project.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.totalUnits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.soldUnits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.reservedUnits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${project.salesRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{project.salesRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatPrice(project.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'under_construction' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/admin/projects/new')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🏗️</div>
                  <div className="font-medium text-gray-900">Add Project</div>
                  <div className="text-sm text-gray-500">Create new project</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/buyers')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-medium text-gray-900">Manage Buyers</div>
                  <div className="text-sm text-gray-500">View all buyers</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/invoices')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📄</div>
                  <div className="font-medium text-gray-900">Invoices</div>
                  <div className="text-sm text-gray-500">Manage invoices</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/reports')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium text-gray-900">Reports</div>
                  <div className="text-sm text-gray-500">View analytics</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}