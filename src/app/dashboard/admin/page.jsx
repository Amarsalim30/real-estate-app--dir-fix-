"use client";
import { Building, Users, Award, TrendingUp, MapPin, Phone, Mail, Star, CheckCircle, X, Home, Info, Search, Calculator, MessageSquare, DollarSign, Receipt } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { formatPrice, formatCompactPrice } from "@/utils/format";
import { Projects } from "@/data/projects";
import { Units } from "@/data/units";
import { Buyers } from "@/data/buyers";
import { Invoices } from "@/data/invoices";
import { Payments } from "@/data/payments";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Header from "@/components/layout/header";

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "primary" }) => {
    const colorClasses = {
        primary: "bg-blue-50 text-blue-600 border-blue-200",
        green: "bg-green-50 text-green-600 border-green-200",
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        orange: "bg-orange-50 text-orange-600 border-orange-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200"
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <div className="flex items-center mt-2">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 font-medium">{trendValue}</span>
                            <span className="text-sm text-gray-500 ml-1">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={cn("p-3 rounded-lg", colorClasses[color])}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

const ProjectCard = ({ project }) => {
    const progressColor = project.constructionProgress >= 80 ? "bg-green-500" :
        project.constructionProgress >= 50 ? "bg-blue-500" : "bg-orange-500";

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.location}</p>
                </div>
                <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    project.status === "completed" ? "bg-green-100 text-green-800" :
                        project.status === "under_construction" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                )}>
                    {project.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                </span>
            </div>

            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Construction Progress</span>
                        <span className="font-medium">{project.constructionProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={cn("h-2 rounded-full transition-all", progressColor)}
                            style={{ width: `${project.constructionProgress || 0}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600">Total Units</p>
                        <p className="font-semibold">{project.totalUnits || 0}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Sold</p>
                        <p className="font-semibold text-green-600">{project.soldUnits || 0}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Available</p>
                        <p className="font-semibold text-blue-600">{project.availableUnits || 0}</p>
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">Price Range</p>
                    <p className="font-semibold text-gray-900">
                        {project.priceRange ? 
                            `${formatCompactPrice(project.priceRange.min)} - ${formatCompactPrice(project.priceRange.max)}` :
                            'Price not available'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

const RecentActivity = () => {
    const recentPayments = Array.isArray(Payments) ? Payments.slice(0, 5) : [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {recentPayments.length > 0 ? recentPayments.map((payment) => {
                    const buyer = Array.isArray(Buyers) ? Buyers.find(b => b.id === payment.buyerId) : null;
                    const unit = Array.isArray(Units) ? Units.find(u => u.id === payment.unitId) : null;

                    return (
                        <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Payment received from {buyer?.firstName || 'Unknown'} {buyer?.lastName || 'Buyer'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Unit {unit?.unitNumber || 'N/A'} • {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Date N/A'}
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-green-600">
                                {formatPrice(payment.amount || 0)}
                            </span>
                        </div>
                    );
                }) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
            </div>
        </div>
    );
};

function DashboardContent() {
    const { data: session, status } = useSession();
    const [dashboardData, setDashboardData] = useState({
        totalProjects: 0,
        totalUnits: 0,
        totalBuyers: 0,
        totalRevenue: 0,
        availableUnits: 0,
        soldUnits: 0,
        pendingInvoices: 0,
        thisMonthRevenue: 0,
        pendingPayments: 0,
        averageUnitPrice: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const calculateDashboardData = () => {
            try {
                setLoading(true);
                
                // Ensure data arrays exist and are arrays
                const projectsArray = Array.isArray(Projects) ? Projects : [];
                const unitsArray = Array.isArray(Units) ? Units : [];
                const buyersArray = Array.isArray(Buyers) ? Buyers : [];
                const paymentsArray = Array.isArray(Payments) ? Payments : [];
                const invoicesArray = Array.isArray(Invoices) ? Invoices : [];

                // Calculate basic statistics
                const totalProjects = projectsArray.length;
                const totalUnits = unitsArray.length;
                const totalBuyers = buyersArray.length;
                
                // Calculate revenue with error handling
                const totalRevenue = paymentsArray.reduce((sum, payment) => {
                    const amount = typeof payment.amount === 'number' ? payment.amount : 0;
                    return sum + amount;
                }, 0);

                // Calculate unit statistics
                const availableUnits = unitsArray.filter(unit => unit.status === 'available').length;
                const soldUnits = unitsArray.filter(unit => unit.status === 'sold').length;
                
                // Calculate invoice statistics
                const pendingInvoices = invoicesArray.filter(invoice => invoice.status === 'pending').length;
                
                // Calculate this month's revenue
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const thisMonthRevenue = paymentsArray
                    .filter(payment => {
                        if (!payment.paymentDate) return false;
                        const paymentDate = new Date(payment.paymentDate);
                        return paymentDate.getMonth() === currentMonth && 
                               paymentDate.getFullYear() === currentYear;
                    })
                    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

                // Calculate pending payments
                const pendingPayments = invoicesArray
                    .filter(invoice => invoice.status === 'pending')
                    .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);

                // Calculate average unit price
                const averageUnitPrice = unitsArray.length > 0 ? 
                    unitsArray.reduce((sum, unit) => sum + (unit.price || 0), 0) / unitsArray.length : 0;

                setDashboardData({
                    totalProjects,
                    totalUnits,
                    totalBuyers,
                    totalRevenue,
                    availableUnits,
                    soldUnits,
                    pendingInvoices,
                    thisMonthRevenue,
                    pendingPayments,
                    averageUnitPrice
                });
                
                setError(null);
            } catch (err) {
                console.error('Error calculating dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        calculateDashboardData();
    }, []);

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {session?.user?.name || 'Admin'}!
                </h1>
                <p className="text-gray-600">
                    Here's what's happening with your real estate portfolio today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Projects"
                    value={dashboardData.totalProjects}
                    icon={Building}
                    color="primary"
                />
                <StatCard
                    title="Total Units"
                    value={dashboardData.totalUnits}
                    icon={Home}
                    color="blue"
                />
                <StatCard
                    title="Active Buyers"
                    value={dashboardData.totalBuyers}
                    icon={Users}
                    color="green"
                />
                <StatCard
                    title="Total Revenue"
                    value={formatCompactPrice(dashboardData.totalRevenue)}
                    icon={DollarSign}
                    trend={true}
                    trendValue="+12.5%"
                    color="purple"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Available Units"
                    value={dashboardData.availableUnits}
                    icon={Home}
                    color="green"
                />
                <StatCard
                    title="Sold Units"
                    value={dashboardData.soldUnits}
                    icon={TrendingUp}
                    color="blue"
                />
                <StatCard
                    title="Pending Invoices"
                    value={dashboardData.pendingInvoices}
                    icon={Receipt}
                    color="orange"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Projects Overview */}
                <div className="lg:col-span-2">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Projects</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Array.isArray(Projects) && Projects.length > 0 ? Projects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            )) : (
                                <div className="col-span-2 text-center py-8">
                                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No projects available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Units Overview */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Units Overview</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Array.isArray(Units) && Units.length > 0 ? Units.slice(0, 5).map((unit) => {
                                        const project = Array.isArray(Projects) ? Projects.find(p => p.id === unit.projectId) : null;
                                        return (
                                            <tr key={unit.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {project?.name || 'Unknown Project'} - {unit.unitNumber || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Floor {unit.floor || 'N/A'} • {unit.sqft || 0} sqft
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {unit.type || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formatPrice(unit.price || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn(
                                                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                                                        unit.status === 'available' ? "bg-green-100 text-green-800" :
                                                            unit.status === 'reserved' ? "bg-yellow-100 text-yellow-800" :
                                                                unit.status === 'sold' ? "bg-blue-100 text-blue-800" :
                                                                    "bg-gray-100 text-gray-800"
                                                    )}>
                                                        {unit.status?.charAt(0).toUpperCase() + unit.status?.slice(1) || 'Unknown'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                <Home className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                No units available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {Array.isArray(Units) && Units.length > 5 && (
                            <div className="mt-4 text-center">
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                                    View All Units →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recent Activity */}
                    <RecentActivity />

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                <Building className="w-4 h-4 mr-2" />
                                Add New Project
                            </button>
                            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                <Home className="w-4 h-4 mr-2" />
                                Add New Unit
                            </button>
                            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                <Users className="w-4 h-4 mr-2" />
                                Add New Buyer
                            </button>
                            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                <Receipt className="w-4 h-4 mr-2" />
                                Create Invoice
                            </button>
                        </div>
                    </div>

                    {/* Recent Buyers */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Buyers</h3>
                        <div className="space-y-4">
                            {Array.isArray(Buyers) && Buyers.length > 0 ? Buyers.slice(0, 3).map((buyer) => (
                                <div key={buyer.id} className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-600">
                                            {(buyer.firstName?.charAt(0) || 'U')}{(buyer.lastName?.charAt(0) || 'U')}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {buyer.firstName || 'Unknown'} {buyer.lastName || 'Buyer'}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {buyer.email || 'No email'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">
                                            {buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-4">
                                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No recent buyers</p>
                                </div>
                            )}
                        </div>
                        {Array.isArray(Buyers) && Buyers.length > 3 && (
                            <div className="mt-4 text-center">
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                                    View All Buyers →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Revenue</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {formatPrice(dashboardData.totalRevenue)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Pending Payments</span>
                                <span className="text-sm font-semibold text-orange-600">
                                    {formatPrice(dashboardData.pendingPayments)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">This Month</span>
                                <span className="text-sm font-semibold text-green-600">
                                    {formatPrice(dashboardData.thisMonthRevenue)}
                                </span>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-900">Average Unit Price</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatPrice(dashboardData.averageUnitPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Charts/Analytics */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Performance */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
                    <div className="space-y-4">
                        {Array.isArray(Projects) && Projects.length > 0 ? Projects.map((project) => {
                            const totalUnits = project.totalUnits || 0;
                            const soldUnits = project.soldUnits || 0;
                            const soldPercentage = totalUnits > 0 ? (soldUnits / totalUnits) * 100 : 0;
                            
                            return (
                                <div key={project.id}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-900">{project.name}</span>
                                        <span className="text-gray-600">
                                            {soldUnits}/{totalUnits} sold ({Math.round(soldPercentage)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-8">
                                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No projects to display</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Unit Status Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Status Distribution</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                                <span className="text-sm text-gray-600">Available</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                                {dashboardData.availableUnits} units
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                                <span className="text-sm text-gray-600">Reserved</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                                {Array.isArray(Units) ? Units.filter(u => u.status === 'reserved').length : 0} units
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                                <span className="text-sm text-gray-600">Sold</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                                {dashboardData.soldUnits} units
                            </span>
                        </div>
                        
                        {/* Visual representation */}
                        <div className="mt-6">
                            <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                {dashboardData.totalUnits > 0 && (
                                    <div className="h-full flex">
                                        <div 
                                            className="bg-green-500 h-full"
                                            style={{ 
                                                width: `${(dashboardData.availableUnits / dashboardData.totalUnits) * 100}%` 
                                            }}
                                        />
                                        <div 
                                            className="bg-yellow-500 h-full"
                                            style={{ 
                                                width: `${((Array.isArray(Units) ? Units.filter(u => u.status === 'reserved').length : 0) / dashboardData.totalUnits) * 100}%` 
                                            }}
                                        />
                                        <div 
                                            className="bg-blue-500 h-full"
                                            style={{ 
                                                width: `${(dashboardData.soldUnits / dashboardData.totalUnits) * 100}%` 
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Analytics Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Monthly Revenue Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Revenue Growth</span>
                            <span className="text-sm font-semibold text-green-600">+12.5%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Units Sold</span>
                            <span className="text-sm font-semibold text-blue-600">+8.3%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">New Buyers</span>
                            <span className="text-sm font-semibold text-purple-600">+15.2%</span>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCompactPrice(dashboardData.thisMonthRevenue)}
                                </p>
                                <p className="text-sm text-gray-500">This Month</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Performing Projects */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing</h3>
                    <div className="space-y-4">
                        {Array.isArray(Projects) && Projects.length > 0 ? 
                            Projects
                                .sort((a, b) => (b.soldUnits || 0) - (a.soldUnits || 0))
                                .slice(0, 3)
                                .map((project, index) => (
                                    <div key={project.id} className="flex items-center space-x-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                            index === 0 ? "bg-yellow-100 text-yellow-800" :
                                            index === 1 ? "bg-gray-100 text-gray-800" :
                                            "bg-orange-100 text-orange-800"
                                        )}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {project.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {project.soldUnits || 0} units sold
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {project.totalUnits > 0 ? 
                                                    Math.round(((project.soldUnits || 0) / project.totalUnits) * 100) : 0}%
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                            <div className="text-center py-4">
                                <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600">Database</span>
                            </div>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                Online
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600">Payment System</span>
                            </div>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                Active
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600">Notifications</span>
                            </div>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                Enabled
                            </span>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Last Updated</p>
                                <p className="text-xs text-gray-500">
                                    {new Date().toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
  return <DashboardContent />;
}

