'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import { Buyers } from '@/data/buyers';
import { Payments } from '@/data/payments';
import { Invoices } from '@/data/invoices';
import { formatPrice } from '@/utils/format';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building, 
  Users, 
  Home,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const MetricCard = ({ title, value, change, changeType, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className="flex items-center">
              {changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};


    const ChartCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

function AnalyticsContent() {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedProject, setSelectedProject] = useState('all');

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Revenue calculations
    const thisMonthRevenue = Payments?.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= thisMonth;
    }).reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    const lastMonthRevenue = Payments?.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= lastMonth && paymentDate < thisMonth;
    }).reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    const revenueChange = lastMonthRevenue > 0 ? 
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

    // Units sold this month vs last month
    const thisMonthSold = Units?.filter(unit => {
      if (unit.status !== 'sold' || !unit.soldDate) return false;
      const soldDate = new Date(unit.soldDate);
      return soldDate >= thisMonth;
    }).length || 0;

    const lastMonthSold = Units?.filter(unit => {
      if (unit.status !== 'sold' || !unit.soldDate) return false;
      const soldDate = new Date(unit.soldDate);
      return soldDate >= lastMonth && soldDate < thisMonth;
    }).length || 0;

    const salesChange = lastMonthSold > 0 ? 
      ((thisMonthSold - lastMonthSold) / lastMonthSold * 100).toFixed(1) : 0;

    // New buyers this month
    const thisMonthBuyers = Buyers?.filter(buyer => {
      const createdDate = new Date(buyer.createdAt);
      return createdDate >= thisMonth;
    }).length || 0;

    const lastMonthBuyers = Buyers?.filter(buyer => {
      const createdDate = new Date(buyer.createdAt);
      return createdDate >= lastMonth && createdDate < thisMonth;
    }).length || 0;

    const buyersChange = lastMonthBuyers > 0 ? 
      ((thisMonthBuyers - lastMonthBuyers) / lastMonthBuyers * 100).toFixed(1) : 0;

    // Project completion rate
    const completedProjects = Projects?.filter(p => p.status === 'completed').length || 0;
    const totalProjects = Projects?.length || 0;
    const completionRate = totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(1) : 0;

    return {
      revenue: {
        current: thisMonthRevenue,
        change: revenueChange,
        changeType: revenueChange >= 0 ? 'increase' : 'decrease'
      },
      sales: {
        current: thisMonthSold,
        change: salesChange,
        changeType: salesChange >= 0 ? 'increase' : 'decrease'
      },
      buyers: {
        current: thisMonthBuyers,
        change: buyersChange,
        changeType: buyersChange >= 0 ? 'increase' : 'decrease'
      },
      completion: {
        rate: completionRate
      }
    };
  }, [timeRange]);

  // Sales by project data
  const salesByProject = useMemo(() => {
    return Projects?.map(project => {
      const projectUnits = Units?.filter(unit => unit.projectId === project.id) || [];
      const soldUnits = projectUnits.filter(unit => unit.status === 'sold').length;
      const totalRevenue = projectUnits
        .filter(unit => unit.status === 'sold')
        .reduce((sum, unit) => sum + (unit.price || 0), 0);
      
      return {
        name: project.name,
        sold: soldUnits,
        total: projectUnits.length,
        revenue: totalRevenue,
        percentage: projectUnits.length > 0 ? ((soldUnits / projectUnits.length) * 100).toFixed(1) : 0
      };
    }) || [];
  }, []);

  // Monthly revenue trend (last 6 months)
  const monthlyRevenue = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const monthRevenue = Payments?.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= monthDate && paymentDate < nextMonth;
      }).reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      months.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      });
    }
    
    return months;
  }, []);

  // Unit status distribution
  const unitStatusData = useMemo(() => {
    const available = Units?.filter(unit => unit.status === 'available').length || 0;
    const reserved = Units?.filter(unit => unit.status === 'reserved').length || 0;
    const sold = Units?.filter(unit => unit.status === 'sold').length || 0;
    const total = available + reserved + sold;

    return [
      { status: 'Available', count: available, percentage: total > 0 ? ((available / total) * 100).toFixed(1) : 0, color: 'bg-green-500' },
      { status: 'Reserved', count: reserved, percentage: total > 0 ? ((reserved / total) * 100).toFixed(1) : 0, color: 'bg-yellow-500' },
      { status: 'Sold', count: sold, percentage: total > 0 ? ((sold / total) * 100).toFixed(1) : 0, color: 'bg-blue-500' }
    ];
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your real estate portfolio</p>
        </div>
        
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Projects</option>
            {Projects?.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Monthly Revenue"
          value={formatPrice(analyticsData.revenue.current)}
          change={`${analyticsData.revenue.change}%`}
          changeType={analyticsData.revenue.changeType}
          icon={DollarSign}
          color="green"
        />
        
        <MetricCard
          title="Units Sold This Month"
          value={analyticsData.sales.current}
          change={`${analyticsData.sales.change}%`}
          changeType={analyticsData.sales.changeType}
          icon={Home}
          color="blue"
        />
        
        <MetricCard
          title="New Buyers"
          value={analyticsData.buyers.current}
          change={`${analyticsData.buyers.change}%`}
          changeType={analyticsData.buyers.changeType}
          icon={Users}
          color="purple"
        />
        
        <MetricCard
          title="Project Completion"
          value={`${analyticsData.completion.rate}%`}
          icon={Building}
          color="orange"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend (Last 6 Months)">
          <div className="space-y-4">
            {monthlyRevenue.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{month.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.max((month.revenue / Math.max(...monthlyRevenue.map(m => m.revenue))) * 100, 5)}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                    {formatPrice(month.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Unit Status Distribution */}
        <ChartCard title="Unit Status Distribution">
          <div className="space-y-4">
            {unitStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${item.color}`} />
                  <span className="text-sm font-medium text-gray-600">{item.status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Units?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Units</div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Sales by Project */}
        <ChartCard title="Sales Performance by Project" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Sold/Total</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Sales Rate</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesByProject.map((project, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-gray-600">
                        {project.sold}/{project.total}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {project.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(project.revenue)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* Top Performers */}
        <ChartCard title="Top Performing Units">
          <div className="space-y-4">
            {Units?.filter(unit => unit.status === 'sold')
              .sort((a, b) => (b.price || 0) - (a.price || 0))
              .slice(0, 5)
              .map((unit, index) => {
                const project = Projects?.find(p => p.id === unit.projectId);
                return (
                  <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Unit {unit.unitNumber}</div>
                        <div className="text-sm text-gray-600">{project?.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatPrice(unit.price)}</div>
                      <div className="text-sm text-gray-600">{unit.sqft} sq ft</div>
                    </div>
                  </div>
                );
              }) || (
              <div className="text-center py-8 text-gray-500">
                No sold units available
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Payment Analytics */}
        <ChartCard title="Payment Analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Payments?.filter(p => p.status === 'completed').length || 0}
                </div>
                <div className="text-sm text-green-600">Completed Payments</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Payments?.filter(p => p.status === 'pending').length || 0}
                </div>
                <div className="text-sm text-orange-600">Pending Payments</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Payment Methods</h4>
              <div className="space-y-2">
                {['wire_transfer', 'check', 'credit_card', 'cash'].map(method => {
                  const count = Payments?.filter(p => p.paymentMethod === method).length || 0;
                  const total = Payments?.length || 1;
                  const percentage = ((count / total) * 100).toFixed(1);
                  
                  return (
                    <div key={method} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {method.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Buyer Analytics */}
        <ChartCard title="Buyer Analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Buyers?.length || 0}
                </div>
                <div className="text-sm text-blue-600">Total Buyers</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Buyers?.filter(b => {
                    const createdDate = new Date(b.createdAt);
                    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    return createdDate >= thirtyDaysAgo;
                  }).length || 0}
                </div>
                <div className="text-sm text-purple-600">New This Month</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Average Buyer Profile</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg. Annual Income:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(
                      Buyers?.reduce((sum, buyer) => sum + (buyer.annualIncome || 0), 0) / (Buyers?.length || 1)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg. Credit Score:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(
                      Buyers?.reduce((sum, buyer) => sum + (buyer.creditScore || 0), 0) / (Buyers?.length || 1)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Preferred Contact:</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {Buyers?.reduce((acc, buyer) => {
                      acc[buyer.preferredContactMethod] = (acc[buyer.preferredContactMethod] || 0) + 1;
                      return acc;
                    }, {}) && Object.entries(
                      Buyers?.reduce((acc, buyer) => {
                        acc[buyer.preferredContactMethod] = (acc[buyer.preferredContactMethod] || 0) + 1;
                        return acc;
                      }, {}) || {}
                    ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <ChartCard title="Recent Activity Timeline">
        <div className="space-y-4">
          {/* Combine recent activities from different sources */}
          {[
            ...Payments?.slice(0, 3).map(payment => ({
              type: 'payment',
              date: payment.paymentDate,
              description: `Payment received: ${formatPrice(payment.amount)}`,
              icon: DollarSign,
              color: 'text-green-600 bg-green-100'
            })) || [],
            ...Units?.filter(unit => unit.status === 'sold').slice(0, 2).map(unit => ({
              type: 'sale',
              date: unit.soldDate,
              description: `Unit ${unit.unitNumber} sold for ${formatPrice(unit.price)}`,
              icon: Home,
              color: 'text-blue-600 bg-blue-100'
            })) || [],
            ...Buyers?.slice(0, 2).map(buyer => ({
              type: 'buyer',
              date: buyer.createdAt,
              description: `New buyer registered: ${buyer.firstName} ${buyer.lastName}`,
              icon: Users,
              color: 'text-purple-600 bg-purple-100'
            })) || []
          ]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 8)
          .map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}>
                <activity.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {activity.date ? new Date(activity.date).toLocaleDateString() : 'Date not available'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Export and Actions */}
      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Export PDF
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Export Excel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  );
}


export default function AnalyticsPage() {
  return (
      <AnalyticsContent />
  );
}
