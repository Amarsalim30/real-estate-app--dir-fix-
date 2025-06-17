import React, { useState, useRef, useEffect } from 'react';
import { Settings, User, UserCog, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';

export default function SettingsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
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

    const menuItems = [
        {
            icon: User,
            label: 'Profile',
            description: 'Manage your personal information',
            onClick: () => {
                console.log('Profile clicked');
                setIsOpen(false);
            }
        },
        {
            icon: UserCog,
            label: 'Account Settings',
            description: 'Privacy, security & preferences',
            onClick: () => {
                console.log('Account Settings clicked');
                setIsOpen(false);
            }
        },
        {
            icon: LogOut,
            label: 'Logout',
            description: 'Sign out of your account',
            onClick: () => {
                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // Simulate logout API call
                        toast.success('Logged out successfully!');
                    }, 1000);
                })
                console.log('Logout clicked');
                setIsOpen(false);
                signOut({ callbackUrl: "/login" });

            },
            isLogout: true
        }
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${isOpen
                    ? 'text-teal-600 bg-teal-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
            >
                <Settings className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 py-2 z-50 animate-in fade-in duration-200">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">JD</span>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">John Doe</p>
                                <p className="text-gray-500 text-xs">john@estate.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.onClick}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${item.isLogout
                                    ? 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.isLogout
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{item.label}</p>
                                    <p className="text-xs text-gray-500">{item.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-100/50">
                        <p className="text-xs text-gray-400 text-center">
                            Estate Dashboard v2.1.0
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}