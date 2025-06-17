'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ROLES } from '@/lib/roles';

export default function Sidebar({ collapsed, toggleSidebar, currentPath }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isAdmin = session?.user?.role === ROLES.ADMIN;

  const menuItems = [
    {
      name: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      roles: [ROLES.ADMIN, ROLES.USER]
    },
    {
      name: 'Properties',
      icon: '🏠',
      path: '/property-listing',
      roles: [ROLES.ADMIN, ROLES.USER]
    },
    {
      name: 'Projects',
      icon: '🏗️',
      path: '/projects',
      roles: [ROLES.ADMIN, ROLES.USER]
    },
    {
      name: 'My Purchases',
      icon: '🛒',
      path: '/my-purchases',
      roles: [ROLES.USER]
    },
    {
      name: 'Admin Dashboard',
      icon: '⚙️',
      path: '/dashboard/admin',
      roles: [ROLES.ADMIN]
    },
    {
      name: 'Manage Buyers',
      icon: '👥',
      path: '/admin/buyers',
      roles: [ROLES.ADMIN]
    },
    {
      name: 'Invoices',
      icon: '📄',
      path: '/admin/invoices',
      roles: [ROLES.ADMIN]
    },
    {
      name: 'Payments',
      icon: '💳',
      path: '/admin/payments',
      roles: [ROLES.ADMIN]
    },
    {
      name: 'Reports',
      icon: '📈',
      path: '/admin/reports',
      roles: [ROLES.ADMIN]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(session?.user?.role)
  );

  const isActive = (path) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="text-2xl">🏢</div>
          {!collapsed && (
            <div className="ml-3">
              <div className="font-bold text-gray-900">RealEstate</div>
              <div className="text-xs text-gray-500">Management</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        <div className="px-2 space-y-1">
          {filteredMenuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && (
                <span className="ml-3">{item.name}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* User Info */}
      {!collapsed && session?.user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {session.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {session.user.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {session.user.role}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
      >
        <span className={`text-xs transition-transform ${collapsed ? 'rotate-180' : ''}`}>
          ◀
        </span>
      </button>
    </div>
  );
}
