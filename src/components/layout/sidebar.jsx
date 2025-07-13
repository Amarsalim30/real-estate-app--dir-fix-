"use client";
import { 
  Building, 
  Home, 
  User, 
  Settings, 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Shield,
  Receipt,
  CreditCard,
  Users,
  FileText,
  DollarSign
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { 
    icon: BarChart3, 
    label: 'Dashboard', 
    pathname: '/dashboard', 
    roles: ['ADMIN', 'USER'],
    description: 'Overview and analytics'
  },
  { 
    icon: Building, 
    label: 'Projects', 
    pathname: '/projects', 
    roles: ['ADMIN', 'USER'],
    description: 'View all projects'
  },
  { 
    icon: Home, 
    label: 'Units', 
    pathname: '/units', 
    roles: ['ADMIN', 'USER'],
    description: 'Browse available units'
  },

  { 
    icon: Receipt, 
    label: 'Invoices', 
    pathname: '/invoices', 
    roles: ['ADMIN', 'USER'],
    description: 'View invoices'
  },
  { 
    icon: CreditCard, 
    label: 'Payments', 
    pathname: '/payments', 
    roles: ['ADMIN', 'USER'],
    description: 'Payment history'
  },
  { 
  icon: Users, 
  label: 'My Billing & Statements', 
  pathname: '/buyers', 
  roles: ['USER'],
  description: 'View or manage buyers depending on role'
},
  // Admin-only management sections
  // { 
  //   icon: BarChart3, 
  //   label: 'Admin Dashboard', 
  //   pathname: '/dashboard/admin', 
  //   roles: ['ADMIN'],
  //   description: 'Administrative overview'
  // },
  // { 
  //   icon: Building, 
  //   label: 'Manage Projects', 
  //   pathname: '/dashboard/admin/projects', 
  //   roles: ['ADMIN'],
  //   description: 'Project management'
  // },
  // { 
  //   icon: Home, 
  //   label: 'Manage Units', 
  //   pathname: '/dashboard/admin/units', 
  //   roles: ['ADMIN'],
  //   description: 'Unit management'
  // },
  { 
    icon: Users, 
    label: 'Manage Buyers', 
    pathname: '/dashboard/admin/buyers', 
    roles: ['ADMIN'],
    description: 'Buyer management'
  },

  { 
    icon: CreditCard, 
    label: 'Manage Payments', 
    pathname: '/dashboard/admin/payments', 
    roles: ['ADMIN'],
    description: 'Payment management'
  },
  // Help sections
  { 
    icon: HelpCircle, 
    label: 'FAQ', 
    pathname: '/faq', 
    roles: ['ADMIN', 'USER'],
    description: 'Frequently asked questions'
  },
  { 
    icon: Settings, 
    label: 'Help Center', 
    pathname: '/help-center', 
    roles: ['ADMIN', 'USER'],
    description: 'Get support'
  },
];

const SidebarItem = ({ item, isActive, collapsed, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={onClick}
        onMouseEnter={() => collapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "flex items-center px-4 py-3 text-sm cursor-pointer transition-all duration-200 group",
          "hover:bg-gray-100 hover:text-gray-900",
          isActive 
            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
            : "text-gray-700",
          collapsed ? "justify-center" : "justify-start"
        )}
      >
        <item.icon className={cn(
          "w-5 h-5 transition-colors",
          isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
        )} />
        {!collapsed && (
          <span className="ml-3 font-medium">{item.label}</span>
        )}
        
        {/* Tooltip for collapsed state */}
        {collapsed && showTooltip && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-gray-300 mt-1">{item.description}</div>
            {/* Arrow */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};

const SidebarSection = ({ title, children, collapsed }) => {
  if (collapsed) return children;
  
  return (
    <div className="mb-6">
      <div className="px-4 mb-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
};

const UserProfile = ({ user, collapsed }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (collapsed) {
    return (
      <div className="p-4 border-t border-gray-200">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200">
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user.name || 'User'}
            </div>
            <div className="text-xs text-gray-500 truncate flex items-center">
              {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
              {user.email}
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-2">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  // Navigate to profile or settings
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Sidebar({ collapsed, toggleSidebar }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading state
  if (status === "loading" || !mounted) {
    return (
      <div className={cn(
        "h-full bg-white shadow-md border-r transition-all duration-300",
        collapsed ? 'w-20' : 'w-64'
      )}>
        <div className="p-4 flex justify-center">
          <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  const user = session.user;
  
  // Filter and organize items by role and section
  const publicItems = sidebarItems.filter(item => 
    item.roles.includes(user.role) && 
    !item.pathname.includes('/dashboard/admin') &&
    !item.pathname.includes('/faq') &&
    !item.pathname.includes('/help-center')
  );

  const adminItems = sidebarItems.filter(item => 
    item.roles.includes(user.role) && 
    item.pathname.includes('/dashboard/admin')
  );

  const helpItems = sidebarItems.filter(item => 
    item.roles.includes(user.role) && 
    (item.pathname.includes('/faq') || item.pathname.includes('/help-center'))
  );

  const handleNavigation = (path) => {
    try {
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className={cn(
      "h-full bg-white shadow-md border-r transition-all duration-300 flex flex-col",
      collapsed ? 'w-20' : 'w-64'
    )}>
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800">Estate</span>
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 transition-colors",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {/* Main Navigation */}
        <SidebarSection title="Main" collapsed={collapsed}>
          <div className="space-y-1">
            {publicItems.map((item) => (
              <SidebarItem
                key={item.pathname}
                item={item}
                isActive={pathname === item.pathname}
                collapsed={collapsed}
                onClick={() => handleNavigation(item.pathname)}
              />
            ))}
          </div>
        </SidebarSection>

        {/* Admin Section */}
        {user.role === 'ADMIN' && adminItems.length > 0 && (
          <SidebarSection title="Administration" collapsed={collapsed}>
            <div className="space-y-1">
              {adminItems.map((item) => (
                <SidebarItem
                  key={item.pathname}
                  item={item}
                  isActive={pathname === item.pathname}
                  collapsed={collapsed}
                  onClick={() => handleNavigation(item.pathname)}
                />
              ))}
            </div>
          </SidebarSection>
        )}

        {/* Help Section */}
        <SidebarSection title="Support" collapsed={collapsed}>
          <div className="space-y-1">
            {helpItems.map((item) => (
              <SidebarItem
                key={item.pathname}
                item={item}
                isActive={pathname === item.pathname}
                collapsed={collapsed}
                onClick={() => handleNavigation(item.pathname)}
              />
            ))}
          </div>
        </SidebarSection>
      </nav>

      {/* User Profile */}
      <UserProfile user={user} collapsed={collapsed} />
    </div>
  );
}
