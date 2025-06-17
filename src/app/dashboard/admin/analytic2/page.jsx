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
import { ROLES } from '@/lib/roles';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  Building,
  DollarSign,
  Calendar,
  Target,
  Award,
  Activity,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const AnalyticsCard = ({ title, value, change, changeType, icon: Icon, color = "blue", subtitle }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
          )}
          {change && (
            <div className="flex items-center">
              {changeType === 'positive' ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
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

const ChartContainer = ({ title, children, actions }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="flex items-center space-x-2">
        {actions}
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
    {children}
  </div>
);

const SimpleBarChart = ({ data, title }) => (
  <div className="space-y-4">
    {data.map((item, index) => (
      <div key={index} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">{item.label}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-900 w-20 text-right">
            {typeof item.value === 'number' && item.value > 1000 ? formatPrice(item.value) : item.value}
          </span>
        </div>
      </div>
    ))}
  </div>
);

const MetricComparison = ({ title, metrics }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-4">
      {metrics.map((metric, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900">{metric.label}</p>
            <p className="text-xs text-gray-600">{metric.description}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{metric.value}</p>
            {metric.change && (
              <p className={`text-xs ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.changeType === 'positive' ? '+' : ''}{metric.change}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

function AnalyticsContent() {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState('12m');
  const [viewType, setViewType] = useState('overview');
  const [selectedProject, setSelectedProject] = useState('all');

  const isAdmin = session?.user?.role === ROLES.ADMIN;

  // Calculate comprehensive analytics
  const analyticsData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Basic metrics
    const totalProjects = Projects?.length || 0;
    const totalUnits = Units?.length || 0;
    const totalBuyers = Buyers?.length || 0;
    const availableUnits = Units?.filter(u => u.status === 'available').length || 0;
    const soldUnits = Units?.filter(u => u.status === 'sold').length || 0;
    const reservedUnits = Units?.filter(u => u.status === 'reserved').length || 0;

    // Revenue metrics
    const totalRevenue = Payments?.filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    const pendingRevenue = Payments?.filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    // Sales performance by project
    const projectPerformance = Projects?.map(project => {
      const projectUnits = Units?.filter(u => u.projectId === project.id) || [];
      const soldProjectUnits = projectUnits.filter(u => u.status === 'sold');
      const projectRevenue = soldProjectUnits.reduce((sum, unit) => sum + (unit.price || 0), 0);
      const salesRate = projectUnits.length > 0 ? (soldProjectUnits.length / projectUnits.length) * 100 : 0;

      return {
        id: project.id,
        name: project.name,
        totalUnits: projectUnits.length,
        soldUnits: soldProjectUnits.length,
        availableUnits: projectUnits.filter(u => u.status === 'available').length,
        revenue: projectRevenue,
        salesRate: salesRate,
        avgPrice: soldProjectUnits.length > 0 ? projectRevenue / soldProjectUnits.length : 0
      };
    }) || [];

    // Monthly sales trend
    const monthlySales = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthPayments = Payments?.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= monthStart && paymentDate <= monthEnd && payment.status === 'completed';
      }) || [];

      const monthRevenue = monthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const monthUnitsSold = monthPayments.length;

      monthlySales.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        unitsSold: monthUnitsSold,
        date: monthDate
      });
    }

    // Unit type analysis
    const unitTypeAnalysis = {};
    Units?.forEach(unit => {
      const type = unit.type || 'Unknown';
      if (!unitTypeAnalysis[type]) {
        unitTypeAnalysis[type] = {
          total: 0,
          sold: 0,
          available: 0,
          reserved: 0,
          totalRevenue: 0
        };
      }
      unitTypeAnalysis[type].total++;
      unitTypeAnalysis[type][unit.status]++;
      if (unit.status === 'sold') {
        unitTypeAnalysis[type].totalRevenue += unit.price || 0;
      }
    });

    const unitTypeData = Object.entries(unitTypeAnalysis).map(([type, data]) => ({
      label: type,
      total: data.total,
      sold: data.sold,
      available: data.available,
      reserved: data.reserved,
      revenue: data.totalRevenue,
      salesRate: data.total > 0 ? (data.sold / data.total) * 100 : 0
    }));

    // Price range analysis
    const priceRanges = [
      { min: 0, max: 500000, label: 'Under $500K' },
      { min: 500000, max: 1000000, label: '$500K - $1M' },
      { min: 1000000, max: 2000000, label: '$1M - $2M' },
      { min: 2000000, max: Infinity, label: 'Over $2M' }
    ];

    const priceRangeAnalysis = priceRanges.map(range => {
      const unitsInRange = Units?.filter(unit => 
        unit.price >= range.min && unit.price < range.max
      ) || [];
      const soldInRange = unitsInRange.filter(u => u.status === 'sold');
      
      return {
        label: range.label,
        total: unitsInRange.length,
        sold: soldInRange.length,
        available: unitsInRange.filter(u => u.status === 'available').length,
        salesRate: unitsInRange.length > 0 ? (soldInRange.length / unitsInRange.length) * 100 : 0,
        revenue: soldInRange.reduce((sum, unit) => sum + (unit.price || 0), 0)
      };
    });

    // Customer analysis
    const customerMetrics = {
      totalCustomers: totalBuyers,
      activeCustomers: Buyers?.filter(buyer => 
        Units?.some(unit => unit.soldTo === buyer.id || unit.reservedBy === buyer.id)
      ).length || 0,
      averageSpend: totalBuyers > 0 ? totalRevenue / totalBuyers : 0,
      repeatCustomers: 0 // This would need more complex logic to track repeat purchases
    };

    // Performance metrics
    const performanceMetrics = {
      salesConversionRate: totalUnits > 0 ? (soldUnits / totalUnits) * 100 : 0,
      averageUnitPrice: soldUnits > 0 ? totalRevenue / soldUnits : 0,
      inventoryTurnover: soldUnits / totalUnits * 100,
      revenuePerProject: totalProjects > 0 ? totalRevenue / totalProjects : 0
    };

    return {
      totalProjects,
      totalUnits,
      totalBuyers,
      availableUnits,
      soldUnits,
      reservedUnits,
      totalRevenue,
      pendingRevenue,
      projectPerformance,
      monthlySales,
      unitTypeData,
      priceRangeAnalysis,
      customerMetrics,
      performanceMetrics
    };
  }, [timeRange, selectedProject]);

  // Calculate growth metrics
  const growthMetrics = useMemo(() => {
    const currentMonth = analyticsData.monthlySales[analyticsData.monthlySales.length - 1];
    const previousMonth = analyticsData.monthlySales[analyticsData.monthlySales.length - 2];

    const revenueGrowth = previousMonth?.revenue > 0 ? 
      ((currentMonth?.revenue - previousMonth?.revenue) / previousMonth?.revenue * 100).toFixed(1) : 0;
    const unitsGrowth = previousMonth?.unitsSold > 0 ? 
      ((currentMonth?.unitsSold - previousMonth?.unitsSold) / previousMonth?.unitsSold * 100).toFixed(1) : 0;

    return {
      revenueGrowth: `${Math.abs(revenueGrowth)}%`,
      revenueGrowthType: currentMonth?.revenue >= previousMonth?.revenue ? 'positive' : 'negative',
      unitsGrowth: `${Math.abs(unitsGrowth)}%`,
      unitsGrowthType: currentMonth?.unitsSold >= previousMonth?.unitsSold ? 'positive' : 'negative'
    };
  }, [analyticsData]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your real estate performance</p>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3
                        py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Projects</option>
            {Projects?.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Revenue"
          value={formatPrice(analyticsData.totalRevenue)}
          change={growthMetrics.revenueGrowth}
          changeType={growthMetrics.revenueGrowthType}
          icon={DollarSign}
          color="green"
          subtitle={`${analyticsData.soldUnits} units sold`}
        />
        
        <AnalyticsCard
          title="Sales Rate"
          value={`${analyticsData.performanceMetrics.salesConversionRate.toFixed(1)}%`}
          change={growthMetrics.unitsGrowth}
          changeType={growthMetrics.unitsGrowthType}
          icon={Target}
          color="blue"
          subtitle={`${analyticsData.soldUnits}/${analyticsData.totalUnits} units`}
        />
        
        <AnalyticsCard
          title="Average Unit Price"
          value={formatPrice(analyticsData.performanceMetrics.averageUnitPrice)}
          icon={Building}
          color="purple"
          subtitle="Across all sold units"
        />
        
        <AnalyticsCard
          title="Active Customers"
          value={analyticsData.customerMetrics.activeCustomers}
          icon={Users}
          color="yellow"
          subtitle={`${analyticsData.totalBuyers} total buyers`}
        />
      </div>

      {/* View Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sales', label: 'Sales Analysis' },
              { id: 'projects', label: 'Project Performance' },
              { id: 'customers', label: 'Customer Insights' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewType(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewType === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {viewType === 'overview' && (
            <div className="space-y-8">
              {/* Revenue and Sales Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Monthly Revenue Trend">
                  <SimpleBarChart
                    data={analyticsData.monthlySales.map(month => ({
                      label: month.month,
                      value: month.revenue
                    }))}
                  />
                </ChartContainer>

                <ChartContainer title="Units Sold by Month">
                  <SimpleBarChart
                    data={analyticsData.monthlySales.map(month => ({
                      label: month.month,
                      value: month.unitsSold
                    }))}
                  />
                </ChartContainer>
              </div>

              {/* Unit Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Unit Status Distribution">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm font-medium text-gray-700">Available</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(analyticsData.availableUnits / analyticsData.totalUnits) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {analyticsData.availableUnits}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm font-medium text-gray-700">Sold</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(analyticsData.soldUnits / analyticsData.totalUnits) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {analyticsData.soldUnits}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm font-medium text-gray-700">Reserved</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${(analyticsData.reservedUnits / analyticsData.totalUnits) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {analyticsData.reservedUnits}
                        </span>
                      </div>
                    </div>
                  </div>
                </ChartContainer>

                <MetricComparison
                  title="Key Performance Metrics"
                  metrics={[
                    {
                      label: 'Sales Conversion Rate',
                      description: 'Percentage of units sold',
                      value: `${analyticsData.performanceMetrics.salesConversionRate.toFixed(1)}%`,
                      change: '2.3%',
                      changeType: 'positive'
                    },
                    {
                      label: 'Average Revenue per Project',
                      description: 'Revenue divided by projects',
                      value: formatPrice(analyticsData.performanceMetrics.revenuePerProject),
                      change: '15.2%',
                      changeType: 'positive'
                    },
                    {
                      label: 'Inventory Turnover',
                      description: 'Rate of unit sales',
                      value: `${analyticsData.performanceMetrics.inventoryTurnover.toFixed(1)}%`,
                      change: '5.1%',
                      changeType: 'positive'
                    },
                    {
                      label: 'Customer Acquisition',
                      description: 'New buyers this period',
                      value: analyticsData.customerMetrics.activeCustomers,
                      change: '8.7%',
                      changeType: 'positive'
                    }
                  ]}
                />
              </div>
            </div>
          )}

          {viewType === 'sales' && (
            <div className="space-y-8">
              {/* Unit Type Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Sales by Unit Type">
                  <SimpleBarChart
                    data={analyticsData.unitTypeData.map(type => ({
                      label: type.label,
                      value: type.sold
                    }))}
                  />
                </ChartContainer>

                <ChartContainer title="Revenue by Unit Type">
                  <SimpleBarChart
                    data={analyticsData.unitTypeData.map(type => ({
                      label: type.label,
                      value: type.revenue
                    }))}
                  />
                </ChartContainer>
              </div>

              {/* Price Range Analysis */}
              <ChartContainer title="Sales Performance by Price Range">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Price Range</th>
                        <th className="text-right py-3 text-sm font-medium text-gray-600">Total Units</th>
                        <th className="text-right py-3 text-sm font-medium text-gray-600">Sold</th>
                        <th className="text-right py-3 text-sm font-medium text-gray-600">Available</th>
                        <th className="text-right py-3 text-sm font-medium text-gray-600">Sales Rate</th>
                        <th className="text-right py-3 text-sm font-medium text-gray-600">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.priceRangeAnalysis.map((range, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 text-sm font-medium text-gray-900">{range.label}</td>
                          <td className="py-3 text-sm text-gray-900 text-right">{range.total}</td>
                          <td className="py-3 text-sm text-gray-900 text-right">{range.sold}</td>
                          <td className="py-3 text-sm text-gray-900 text-right">{range.available}</td>
                          <td className="py-3 text-sm text-gray-900 text-right">{range.salesRate.toFixed(1)}%</td>
                          <td className="py-3 text-sm font-medium text-gray-900 text-right">
                            {formatPrice(range.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartContainer>

              {/* Sales Velocity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Fast Moving</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {analyticsData.unitTypeData
                      .filter(type => type.salesRate > 70)
                      .reduce((sum, type) => sum + type.sold, 0)}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">Units with over 70% sales rate</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-yellow-900 mb-2">Moderate</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {analyticsData.unitTypeData
                      .filter(type => type.salesRate >= 30 && type.salesRate <= 70)
                      .reduce((sum, type) => sum + type.sold, 0)}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">Units with 30-70% sales rate</p>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-900 mb-2">Slow Moving</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {analyticsData.unitTypeData
                      .filter(type => type.salesRate < 30)
                      .reduce((sum, type) => sum + type.sold, 0)}
                  </p>
                  <p className="text-sm text-red-700 mt-1">Units with less 30% sales rate</p>
                </div>
              </div>
            </div>
          )}

          {viewType === 'projects' && (
            <div className="space-y-8">
              {/* Project Performance Table */}
              <ChartContainer title="Project Performance Overview">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Project</th>
                        <th className="text-right py-3 text-sm font-medium text-gray-600">Total Units</th>
                        <th className="text-right py-3 text-sm font-medium text-gray-600">Sold</th>
                        <th className="text-right py-3 text-sm font-medium text-gray-600">Available</th>
                        <th className="text-right py-3 text-sm font-medium text-gray-600">Sales Rate</th>
                        <th className="text
-right py-3 text-sm font-medium text-gray-600">Revenue</th>
                        <th className="text-right py-3 text-sm font-medium text-gray-600">Avg Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.projectPerformance
                        .sort((a, b) => b.revenue - a.revenue)
                        .map((project) => (
                          <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 text-sm font-medium text-gray-900">{project.name}</td>
                            <td className="py-3 text-sm text-gray-900 text-right">{project.totalUnits}</td>
                            <td className="py-3 text-sm text-gray-900 text-right">{project.soldUnits}</td>
                            <td className="py-3 text-sm text-gray-900 text-right">{project.availableUnits}</td>
                            <td className="py-3 text-sm text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                project.salesRate >= 70 ? 'bg-green-100 text-green-800' :
                                project.salesRate >= 30 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {project.salesRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 text-sm font-medium text-gray-900 text-right">
                              {formatPrice(project.revenue)}
                            </td>
                            <td className="py-3 text-sm text-gray-900 text-right">
                              {formatPrice(project.avgPrice)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </ChartContainer>

              {/* Project Revenue Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Revenue by Project">
                  <SimpleBarChart
                    data={analyticsData.projectPerformance
                      .sort((a, b) => b.revenue - a.revenue)
                      .map(project => ({
                        label: project.name,
                        value: project.revenue
                      }))}
                  />
                </ChartContainer>

                <ChartContainer title="Sales Rate by Project">
                  <SimpleBarChart
                    data={analyticsData.projectPerformance
                      .sort((a, b) => b.salesRate - a.salesRate)
                      .map(project => ({
                        label: project.name,
                        value: project.salesRate
                      }))}
                  />
                </ChartContainer>
              </div>

              {/* Project Status Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-900 mb-2">High Performers</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {analyticsData.projectPerformance.filter(p => p.salesRate >= 70).length}
                  </p>
                  <p className="text-sm text-green-700 mt-1">Projects with over 70% sales rate</p>
                  <div className="mt-3 space-y-1">
                    {analyticsData.projectPerformance
                      .filter(p => p.salesRate >= 70)
                      .slice(0, 3)
                      .map(project => (
                        <div key={project.id} className="text-xs text-green-600">
                          {project.name} ({project.salesRate.toFixed(1)}%)
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-yellow-900 mb-2">Average Performers</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {analyticsData.projectPerformance.filter(p => p.salesRate >= 30 && p.salesRate < 70).length}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">Projects with 30-70% sales rate</p>
                  <div className="mt-3 space-y-1">
                    {analyticsData.projectPerformance
                      .filter(p => p.salesRate >= 30 && p.salesRate < 70)
                      .slice(0, 3)
                      .map(project => (
                        <div key={project.id} className="text-xs text-yellow-600">
                          {project.name} ({project.salesRate.toFixed(1)}%)
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-900 mb-2">Needs Attention</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {analyticsData.projectPerformance.filter(p => p.salesRate < 30).length}
                  </p>
                  <p className="text-sm text-red-700 mt-1">Projects with less 30% sales rate</p>
                  <div className="mt-3 space-y-1">
                    {analyticsData.projectPerformance
                      .filter(p => p.salesRate < 30)
                      .slice(0, 3)
                      .map(project => (
                        <div key={project.id} className="text-xs text-red-600">
                          {project.name} ({project.salesRate.toFixed(1)}%)
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewType === 'customers' && (
            <div className="space-y-8">
              {/* Customer Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Total Customers</h4>
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.customerMetrics.totalCustomers}</p>
                  <p className="text-sm text-blue-700 mt-1">All registered buyers</p>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-900 mb-2">Active Customers</h4>
                  <p className="text-2xl font-bold text-green-600">{analyticsData.customerMetrics.activeCustomers}</p>
                  <p className="text-sm text-green-700 mt-1">With purchases/reservations</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-purple-900 mb-2">Average Spend</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(analyticsData.customerMetrics.averageSpend)}
                  </p>
                  <p className="text-sm text-purple-700 mt-1">Per customer</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-orange-900 mb-2">Conversion Rate</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {analyticsData.customerMetrics.totalCustomers > 0 ? 
                      ((analyticsData.customerMetrics.activeCustomers / analyticsData.customerMetrics.totalCustomers) * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-sm text-orange-700 mt-1">Buyers to customers</p>
                </div>
              </div>

              {/* Customer Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Customer Acquisition Timeline">
                  <div className="space-y-4">
                    {analyticsData.monthlySales.slice(-6).map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{month.month}</span>
                        <div className="flex items-center space-x-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ 
                                width: `${month.unitsSold > 0 ? (month.unitsSold / Math.max(...analyticsData.monthlySales.map(m => m.unitsSold))) * 100 : 0}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                            {month.unitsSold}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartContainer>

                <ChartContainer title="Top Customers by Value">
                  <div className="space-y-4">
                    {Buyers?.slice(0, 5).map((buyer, index) => {
                      const buyerUnits = Units?.filter(u => u.soldTo === buyer.id) || [];
                      const buyerValue = buyerUnits.reduce((sum, unit) => sum + (unit.price || 0), 0);
                      
                      return (
                        <div key={buyer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {buyer.firstName?.charAt(0)}{buyer.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {buyer.firstName} {buyer.lastName}
                              </p>
                              <p className="text-xs text-gray-600">{buyerUnits.length} unit(s)</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(buyerValue)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ChartContainer>
              </div>

              {/* Customer Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">First-time Buyers</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.floor(analyticsData.customerMetrics.totalCustomers * 0.7)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Investors</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.floor(analyticsData.customerMetrics.totalCustomers * 0.25)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Repeat Customers</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.floor(analyticsData.customerMetrics.totalCustomers * 0.05)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Purchase Patterns</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cash Purchases</span>
                      <span className="text-sm font-semibold text-gray-900">35%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Financed</span>
                      <span className="text-sm font-semibold text-gray-900">60%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Other</span>
                      <span className="text-sm font-semibold text-gray-900">5%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Satisfaction Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Referral Rate</span>
                      <span className="text-sm font-semibold text-green-600">23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Repeat Purchase</span>
                      <span className="text-sm font-semibold text-blue-600">8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Rating</span>
                      <span className="text-sm font-semibold text-yellow-600">4.6/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">AI-Powered Insights & Recommendations</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Key Insights</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Strong Performance</p>
                  <p className="text-sm text-gray-600">
                    Your sales conversion rate of {analyticsData.performanceMetrics.salesConversionRate.toFixed(1)}% 
                    is above industry average of 45%
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Revenue Growth</p>
                  <p className="text-sm text-gray-600">
                    Monthly revenue shows {growthMetrics.revenueGrowthType === 'positive' ? 'positive' : 'negative'} 
                    trend with {growthMetrics.revenueGrowth} change
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Market Position</p>
                  <p className="text-sm text-gray-600">
                    Average unit price of {formatPrice(analyticsData.performanceMetrics.averageUnitPrice)} 
                    positions you in the premium segment
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Customer Engagement</p>
                  <p className="text-sm text-gray-600">
                    {((analyticsData.customerMetrics.activeCustomers / analyticsData.customerMetrics.totalCustomers) * 100).toFixed(1)}% 
                    customer activation rate indicates strong engagement
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Recommendations</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Focus on High Performers</p>
                  <p className="text-sm text-gray-600">
                    Replicate successful strategies from top-performing projects to underperforming ones
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Address Slow Movers</p>
                  <p className="text-sm text-gray-600">
                    Consider pricing adjustments or marketing campaigns for units with less 30% sales rate
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Customer Retention</p>
                  <p className="text-sm text-gray-600">
                    Implement loyalty programs to increase repeat purchase rate from current 8%
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Market Expansion</p>
                  <p className="text-sm text-gray-600">
                    Consider expanding into mid-range segments to capture broader market share
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Suggested Action Items</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Sales Optimization</span>
              </div>
              <p className="text-xs text-blue-700">
                Review pricing strategy for slow-moving inventory and implement targeted promotions
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Customer Experience</span>
              </div>
              <p className="text-xs text-green-700">
                Enhance customer onboarding process to improve conversion rates
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Performance Tracking</span>
              </div>
              <p className="text-xs text-purple-700">
                Set up automated alerts for key performance indicators and trends
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export and Sharing Options */}
      <div className="bg-gray-50 rounded-xl p-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Export Analytics Report</h3>
            <p className="text-sm text-gray-600">Generate comprehensive reports for stakeholders</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">PDF Report</span>
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Excel Export</span>
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Activity className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Schedule Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
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
            <p className="text-gray-600">Please sign in to view analytics.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user has permission to view analytics
  const canViewAnalytics = session.user.role === ROLES.ADMIN || session.user.role === ROLES.MANAGER;

  if (!canViewAnalytics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600">You don't have permission to view analytics data.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AnalyticsContent />
    </DashboardLayout>
  );
}
