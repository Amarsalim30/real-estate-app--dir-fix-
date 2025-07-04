import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Notification() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'success',
            title: 'Property Listed Successfully',
            message: 'Your property "Modern Villa" has been listed successfully.',
            time: '2 minutes ago',
            read: false
        },
        {
            id: 2,
            type: 'info',
            title: 'New Inquiry Received',
            message: 'Someone is interested in your property listing.',
            time: '1 hour ago',
            read: false
        },
        {
            id: 3,
            type: 'warning',
            title: 'Document Verification Pending',
            message: 'Please upload required documents for property verification.',
            time: '3 hours ago',
            read: true
        },
        {
            id: 4,
            type: 'error',
            title: 'Payment Failed',
            message: 'Your subscription payment could not be processed.',
            time: '1 day ago',
            read: false
        }
    ]);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <Check className="w-4 h-4" />;
            case 'info':
                return <Info className="w-4 h-4" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4" />;
            case 'error':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Bell className="w-4 h-4" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-600';
            case 'info':
                return 'bg-blue-100 text-blue-600';
            case 'warning':
                return 'bg-yellow-100 text-yellow-600';
            case 'error':
                return 'bg-red-100 text-red-600';
            default:
                return 'bg-gray-100 text-gray-600';
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
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const unreadCount = notifications.filter(notif => !notif.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-lg transition-all duration-200 ${
                    isOpen
                        ? 'text-teal-600 bg-teal-50'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 py-2 z-50 animate-in fade-in duration-200">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-teal-100 text-teal-600 text-xs px-2 py-1 rounded-full font-medium">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className={`max-h-96 overflow-y-auto modern-scrollbar pr-2`}>
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`relative px-4 py-3 hover:bg-gray-50 transition-all duration-200 ${
                                            !notification.read ? 'bg-blue-50/30' : ''
                                        }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm text-gray-900 truncate">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            {notification.time}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 ml-2">
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100/50">
                            <button
                                onClick={() => {
                                    router.push('/dashboard/notifications');
                                    setIsOpen(false);
                                }}
                                className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-1"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
