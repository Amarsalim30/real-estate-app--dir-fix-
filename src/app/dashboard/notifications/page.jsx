'use client';
import React, { useState, useEffect } from 'react';
import { 
    Bell, 
    X, 
    Check, 
    Info, 
    AlertTriangle, 
    AlertCircle, 
    Filter,
    Search,
    CheckCheck,
    Trash2,
    Archive,
    Settings
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useRouter } from 'next/navigation';

export  function NotificationsContent() {
    const router = useRouter();
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterRead, setFilterRead] = useState('all');
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'success',
            title: 'Property Listed Successfully',
            message: 'Your property "Modern Villa in Downtown" has been listed successfully and is now visible to potential buyers.',
            time: '2 minutes ago',
            timestamp: new Date(Date.now() - 2 * 60 * 1000),
            read: false,
            category: 'Property Management'
        },
        {
            id: 2,
            type: 'info',
            title: 'New Inquiry Received',
            message: 'John Smith is interested in your property listing "Luxury Apartment" and has requested more information.',
            time: '1 hour ago',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            read: false,
            category: 'Inquiries'
        },
        {
            id: 3,
            type: 'warning',
            title: 'Document Verification Pending',
            message: 'Please upload required documents for property verification. Missing: Property deed, Tax certificate.',
            time: '3 hours ago',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            read: true,
            category: 'Verification'
        },
        {
            id: 4,
            type: 'error',
            title: 'Payment Failed',
            message: 'Your subscription payment could not be processed. Please update your payment method to continue using premium features.',
            time: '1 day ago',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            read: false,
            category: 'Billing'
        },
        {
            id: 5,
            type: 'info',
            title: 'System Maintenance Scheduled',
            message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM. Some features may be temporarily unavailable.',
            time: '2 days ago',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            read: true,
            category: 'System'
        },
        {
            id: 6,
            type: 'success',
            title: 'Profile Updated Successfully',
            message: 'Your profile information has been successfully updated. Changes are now visible to other users.',
            time: '3 days ago',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            read: true,
            category: 'Account'
        },
        {
            id: 7,
            type: 'info',
            title: 'New Feature Available',
            message: 'Check out our new virtual tour feature! Create immersive 360° tours for your property listings.',
            time: '1 week ago',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            read: false,
            category: 'Features'
        },
        {
            id: 8,
            type: 'warning',
            title: 'Listing Expiring Soon',
            message: 'Your property listing "Cozy Family Home" will expire in 3 days. Renew now to keep it active.',
            time: '1 week ago',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            read: true,
            category: 'Property Management'
        }
    ]);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <Check className="w-5 h-5" />;
            case 'info':
                return <Info className="w-5 h-5" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />;
            case 'error':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    const getNotificationColorClass = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-600';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-600';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-600';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-600';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-600';
        }
    };

    const markAsRead = (id) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, read: true }))
        );
        setSelectedNotifications([]);
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        setSelectedNotifications(prev => prev.filter(selectedId => selectedId !== id));
    };

    const deleteSelected = () => {
        setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif.id)));
        setSelectedNotifications([]);
    };

    const markSelectedAsRead = () => {
        setNotifications(prev => 
            prev.map(notif => 
                selectedNotifications.includes(notif.id) ? { ...notif, read: true } : notif
            )
        );
        setSelectedNotifications([]);
    };

    const toggleSelectNotification = (id) => {
        setSelectedNotifications(prev => 
            prev.includes(id) 
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        const allIds = filteredNotifications.map(notif => notif.id);
        setSelectedNotifications(allIds);
    };

    const deselectAll = () => {
        setSelectedNotifications([]);
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(notif => {
        const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            notif.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || notif.type === filterType;
        const matchesRead = filterRead === 'all' || 
                          (filterRead === 'unread' && !notif.read) ||
                          (filterRead === 'read' && notif.read);
        
        return matchesSearch && matchesType && matchesRead;
    });

    const unreadCount = notifications.filter(notif => !notif.read).length;
    const totalCount = notifications.length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-teal-600" />
                                Notifications
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {totalCount} total notifications • {unreadCount} unread
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={markAllAsRead}
                                className={`flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 font-medium ${
                                    unreadCount === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                                }`}
                                disabled={unreadCount === 0}
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span className="hidden sm:inline">Mark All Read</span>
                                <span className="sm:hidden">Mark All</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    className="w-full pl-10 pr-4 py-2.5 border placeholder-gray-400 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Type Filter */}
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className=" placeholder-gray-400 text-gray-500  px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white"
                            >
                                <option value="all">All Types</option>
                                <option value="success">Success</option>
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                            </select>

                            {/* Read Status Filter */}
                            <select
                                value={filterRead}
                                onChange={(e) => setFilterRead(e.target.value)}
                                className="placeholder-gray-400 text-gray-500 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedNotifications.length > 0 && (
                    <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <span className="text-teal-700 font-medium">
                                {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={markSelectedAsRead}
                                    className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 text-sm font-medium hover:shadow-md"
                                >
                                    <Check className="w-4 h-4" />
                                    Mark as Read
                                </button>
                                <button
                                    onClick={deleteSelected}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium hover:shadow-md"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                                <button
                                    onClick={deselectAll}
                                    className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors duration-200"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Select All/None */}
                {filteredNotifications.length > 0 && (
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={selectAll}
                                className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
                            >
                                Select All
                            </button>
                            <button
                                onClick={deselectAll}
                                className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200"
                            >
                                Select None
                            </button>
                        </div>
                        <span className="text-sm text-gray-500">
                            Showing {filteredNotifications.length} of {totalCount} notifications
                        </span>
                    </div>
                )}

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
                            <p className="text-gray-500">
                                {searchTerm || filterType !== 'all' || filterRead !== 'all' 
                                    ? 'Try adjusting your search or filters'
                                    : 'You\'re all caught up! New notifications will appear here.'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                                    !notification.read 
                                        ? 'border-l-4 border-l-teal-500 border-gray-200' 
                                        : 'border-gray-200'
                                } ${
                                    selectedNotifications.includes(notification.id)
                                        ? 'ring-2 ring-teal-500 border-teal-300'
                                        : ''
                                }`}
                            >
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Checkbox */}
                                        <div className="flex items-center pt-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedNotifications.includes(notification.id)}
                                                onChange={() => toggleSelectNotification(notification.id)}
                                                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 transition-all duration-200"
                                            />
                                        </div>

                                        {/* Icon */}
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${getNotificationColorClass(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                                                            {notification.title}
                                                        </h3>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 animate-pulse"></div>
                                                        )}
                                                    </div>
                                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mb-3 font-medium">
                                                        {notification.category}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                                    <span className="text-sm text-gray-500 whitespace-nowrap">
                                                        {notification.time}
                                                    </span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        {!notification.read && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200"
                                                                title="Mark as read"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                            title="Delete notification"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Load More Button */}
                {filteredNotifications.length > 0 && filteredNotifications.length >= 10 && (
                    <div className="mt-8 text-center">
                        <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 font-medium">
                            Load More Notifications
                        </button>
                    </div>
                )}

                {/* Settings Panel */}
                <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900 text-lg">Notification Settings</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <p className="font-medium text-gray-900">Email Notifications</p>
                                <p className="text-sm text-gray-600">Receive notifications via email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <p className="font-medium text-gray-900">Push Notifications</p>
                                <p className="text-sm text-gray-600">Receive browser notifications</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <p className="font-medium text-gray-900">Property Updates</p>
                                <p className="text-sm text-gray-600">Updates about your properties</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <p className="font-medium text-gray-900">Marketing Updates</p>
                                <p className="text-sm text-gray-600">News and promotional content</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function NotificationsPage(){
      const { data: session, status } = useSession();
      const router = useRouter();
    
       useEffect(() => {
        if (status === "unauthenticated") {
          router.push("/login");
        }
      },[status, session, router])
    
    
      if (status === 'loading') {
        return (
          <DashboardLayout>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </DashboardLayout>
        );
      }
    
    
      return (
        <DashboardLayout>
          <NotificationsContent />
        </DashboardLayout>
      );
}
