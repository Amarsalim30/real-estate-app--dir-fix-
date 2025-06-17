'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Payments } from '@/data/payments';
import { Invoices } from '@/data/invoices';
import { Projects } from '@/data/projects';
import { Units } from '@/data/units';
import { formatPrice } from '@/utils/format';
import { ROLES } from '@/lib/roles';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

const MetricCard = ({ title, value, change, changeType, icon: Icon, color = "blue" }) => {
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
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
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

const CashflowChart = ({ data, title, type = 'bar' }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Simple chart representation */}
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
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                {formatPrice(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function CashflowContent() {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState('12m'); // 1m, 3m, 6m, 12m
  const [viewType, setViewType] = useState('overview'); // overview, detailed, projections

  const isAdmin = session?.user?.role === ROLES.ADMIN;

  // Calculate cashflow metrics
  const cashflowData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get date range based on selection
    const getDateRange = () => {
      const months = timeRange === '1m' ? 1 : timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
      const startDate = new Date(currentYear, currentMonth - months + 1, 1);
      return { startDate, endDate: now };
    };

    const { startDate, endDate } = getDateRange();

    // Filter payments within date range
    const filteredPayments = Payments?.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= startDate && paymentDate <= endDate;
    }) || [];

    // Filter invoices within date range
    const filteredInvoices = Invoices?.filter(invoice => {
      const invoiceDate = new Date(invoice.issueDate);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    }) || [];

    // Calculate totals
    const totalIncome = filteredPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const pendingIncome = filteredPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const totalInvoiced = filteredInvoices
      .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);

    const outstandingInvoices = filteredInvoices
      .filter(i => i.status === 'pending')
      .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);

    // Calculate monthly breakdown
    const monthlyData = [];
    const months = timeRange === '1m' ? 1 : timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
    
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthPayments = filteredPayments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= monthStart && paymentDate <= monthEnd && payment.status === 'completed';
      });

      const monthIncome = monthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      monthlyData.push({
        label: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: monthIncome,
        date: monthDate
      });
    }

    // Calculate project breakdown
    const projectBreakdown = Projects?.map(project => {
      const projectPayments = filteredPayments.filter(payment => {
        const unit = Units?.find(u => u.id === payment.unitId);
        return unit?.projectId === project.id && payment.status === 'completed';
      });

      const projectIncome = projectPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      return {
        label: project.name,
        value: projectIncome,
        id: project.id
      };
    }).filter(item => item.value > 0) || [];

    // Calculate payment method breakdown
    const paymentMethodBreakdown = {};
    filteredPayments
      .filter(p => p.status === 'completed')
      .forEach(payment => {
        const method = payment.paymentMethod || 'unknown';
        paymentMethodBreakdown[method] = (paymentMethodBreakdown[method] || 0) + (payment.amount || 0);
      });

    const paymentMethodData = Object.entries(paymentMethodBreakdown).map(([method, amount]) => ({
      label: method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: amount
    }));

    return {
      totalIncome,
      pendingIncome,
      totalInvoiced,
      outstandingInvoices,
      monthlyData,
      projectBreakdown,
      paymentMethodData,
      filteredPayments,
      filteredInvoices
    };
  }, [timeRange]);

  // Calculate growth rates
  const growthMetrics = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Current month payments
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    
    const currentMonthPayments = Payments?.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= currentMonthStart && paymentDate <= currentMonthEnd && payment.status === 'completed';
    }) || [];

    const currentMonthIncome = currentMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Previous month payments
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthEnd = new Date(currentYear, currentMonth, 0);
    
    const prevMonthPayments = Payments?.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= prevMonthStart && paymentDate <= prevMonthEnd && payment.status === 'completed';
    }) || [];

    const prevMonthIncome = prevMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Calculate growth
    const incomeGrowth = prevMonthIncome > 0 ? 
      ((currentMonthIncome - prevMonthIncome) / prevMonthIncome * 100).toFixed(1) : 0;

    const incomeGrowthType = currentMonthIncome >= prevMonthIncome ? 'positive' : 'negative';

        return {
      incomeGrowth: `${Math.abs(incomeGrowth)}%`,
      incomeGrowthType,
      currentMonthIncome,
      prevMonthIncome
    };
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cashflow</h1>
          <p className="text-gray-600">Monitor your financial performance and cash flow</p>
        </div>
        
        <div className="flex space-x-3">
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
          
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Income"
          value={formatPrice(cashflowData.totalIncome)}
          change={growthMetrics.incomeGrowth}
          changeType={growthMetrics.incomeGrowthType}
          icon={DollarSign}
          color="green"
        />
        
        <MetricCard
          title="Pending Income"
          value={formatPrice(cashflowData.pendingIncome)}
          icon={TrendingUp}
          color="yellow"
        />
        
        <MetricCard
          title="Total Invoiced"
          value={formatPrice(cashflowData.totalInvoiced)}
          icon={BarChart3}
          color="blue"
        />
        
        <MetricCard
          title="Outstanding"
          value={formatPrice(cashflowData.outstandingInvoices)}
          icon={Calendar}
          color="red"
        />
      </div>

      {/* View Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'detailed', label: 'Detailed Analysis' },
              { id: 'projections', label: 'Projections' }
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Income Trend */}
              <CashflowChart
                title="Monthly Income Trend"
                data={cashflowData.monthlyData}
                type="line"
              />

              {/* Project Revenue Breakdown */}
              <CashflowChart
                title="Revenue by Project"
                data={cashflowData.projectBreakdown}
                type="bar"
              />

              {/* Payment Methods */}
              <CashflowChart
                title="Payment Methods"
                data={cashflowData.paymentMethodData}
                type="pie"
              />

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Transactions</h3>
                <div className="space-y-4">
                  {cashflowData.filteredPayments
                    .filter(p => p.status === 'completed')
                    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                    .slice(0, 5)
                    .map(payment => {
                      const unit = Units?.find(u => u.id === payment.unitId);
                      const project = Projects?.find(p => p.id === unit?.projectId);
                      
                      return (
                        <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Unit {unit?.unitNumber || 'N/A'} - {project?.name || 'Unknown Project'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Date N/A'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-green-600">
                            +{formatPrice(payment.amount || 0)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {viewType === 'detailed' && (
            <div className="space-y-8">
              {/* Detailed Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Income Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Payments:</span>
                      <span className="font-medium">{formatPrice(cashflowData.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Payments:</span>
                      <span className="font-medium text-yellow-600">{formatPrice(cashflowData.pendingIncome)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-900 font-semibold">Total Expected:</span>
                      <span className="font-semibold">{formatPrice(cashflowData.totalIncome + cashflowData.pendingIncome)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Invoiced:</span>
                      <span className="font-medium">{formatPrice(cashflowData.totalInvoiced)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Outstanding:</span>
                      <span className="font-medium text-red-600">{formatPrice(cashflowData.outstandingInvoices)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-900 font-semibold">Collection Rate:</span>
                      <span className="font-semibold">
                        {cashflowData.totalInvoiced > 0 ? 
                          `${(((cashflowData.totalInvoiced - cashflowData.outstandingInvoices) / cashflowData.totalInvoiced) * 100).toFixed(1)}%` : 
                          '0%'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Growth Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month:</span>
                      <span className="font-medium">{formatPrice(growthMetrics.currentMonthIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Month:</span>
                      <span className="font-medium">{formatPrice(growthMetrics.prevMonthIncome)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-900 font-semibold">Growth:</span>
                      <span className={`font-semibold ${
                        growthMetrics.incomeGrowthType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {growthMetrics.incomeGrowthType === 'positive' ? '+' : '-'}{growthMetrics.incomeGrowth}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Performing Projects */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Projects</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-sm font-medium text-gray-600">Project</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-600">Revenue</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-600">Units Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cashflowData.projectBreakdown
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 5)
                          .map(project => {
                            const projectData = Projects?.find(p => p.id === project.id);
                            const soldUnits = Units?.filter(u => u.projectId === project.id && u.status === 'sold').length || 0;
                            
                            return (
                              <tr key={project.id} className="border-b border-gray-100">
                                <td className="py-3 text-sm font-medium text-gray-900">{project.label}</td>
                                <td className="py-3 text-sm text-gray-900 text-right">{formatPrice(project.value)}</td>
                                <td className="py-3 text-sm text-gray-900 text-right">{soldUnits}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Method Analysis */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Analysis</h4>
                  <div className="space-y-4">
                    {cashflowData.paymentMethodData
                      .sort((a, b) => b.value - a.value)
                      .map((method, index) => {
                        const percentage = cashflowData.totalIncome > 0 ? 
                          (method.value / cashflowData.totalIncome * 100).toFixed(1) : 0;
                        
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">{method.label}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">{formatPrice(method.value)}</div>
                                <div className="text-xs text-gray-500">{percentage}%</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewType === 'projections' && (
            <div className="space-y-8">
              {/* Projection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Next Month Projection</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(growthMetrics.currentMonthIncome * 1.1)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Based on current trends</p>
                </div>

                                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Quarterly Forecast</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(cashflowData.totalIncome * 3.2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Q1 2024 projection</p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Annual Target</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(cashflowData.totalIncome * 12)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">2024 revenue goal</p>
                </div>
              </div>

              {/* Projection Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast</h4>
                  <div className="space-y-4">
                    {[
                      { month: 'January 2024', projected: cashflowData.totalIncome * 1.05, confidence: 'High' },
                      { month: 'February 2024', projected: cashflowData.totalIncome * 1.12, confidence: 'High' },
                      { month: 'March 2024', projected: cashflowData.totalIncome * 1.18, confidence: 'Medium' },
                      { month: 'April 2024', projected: cashflowData.totalIncome * 1.25, confidence: 'Medium' },
                      { month: 'May 2024', projected: cashflowData.totalIncome * 1.30, confidence: 'Low' },
                      { month: 'June 2024', projected: cashflowData.totalIncome * 1.35, confidence: 'Low' }
                    ].map((forecast, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{forecast.month}</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            forecast.confidence === 'High' ? 'bg-green-100 text-green-800' :
                            forecast.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {forecast.confidence} Confidence
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(forecast.projected)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Assumptions</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Market Growth</h5>
                      <p className="text-sm text-blue-800">
                        Assuming 15% annual market growth based on current real estate trends
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">Project Completion</h5>
                      <p className="text-sm text-green-800">
                        New project launches expected to increase sales by 25%
                      </p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h5 className="font-medium text-yellow-900 mb-2">Seasonal Factors</h5>
                      <p className="text-sm text-yellow-800">
                        Q2-Q3 typically show 20% higher sales activity
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-purple-900 mb-2">Economic Conditions</h5>
                      <p className="text-sm text-purple-800">
                        Stable interest rates and employment levels assumed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Potential Risks</h5>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Market Downturn</p>
                          <p className="text-xs text-gray-600">Could reduce sales by 20-30%</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Construction Delays</p>
                          <p className="text-xs text-gray-600">May postpone revenue recognition</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Interest Rate Changes</p>
                          <p className="text-xs text-gray-600">Could affect buyer financing</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Mitigation Strategies</h5>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Diversified Portfolio</p>
                          <p className="text-xs text-gray-600">Multiple projects and price points</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Flexible Pricing</p>
                          <p className="text-xs text-gray-600">Ability to adjust based on market</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Strong Partnerships</p>
                          <p className="text-xs text-gray-600">Reliable contractors and suppliers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Follow Up Required</span>
            </div>
            <p className="text-sm text-yellow-700">
              {cashflowData.outstandingInvoices > 0 ? 
                `${formatPrice(cashflowData.outstandingInvoices)} in outstanding invoices need follow-up` :
                'No outstanding invoices requiring follow-up'
              }
            </p>
          </div>
          
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Growth Opportunity</span>
            </div>
            <p className="text-sm text-blue-700">
              Consider launching marketing campaign for underperforming projects
            </p>
          </div>
          
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <PieChart className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Optimization</span>
            </div>
            <p className="text-sm text-green-700">
              Review payment terms to improve cash flow timing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CashflowPage() {
  return (
      <CashflowContent />
  );
}

