import { Building, Home, User, Settings, BarChart3, Calendar, TrendingUp, TrendingDown, MessageSquare, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function Sidebar({ collapsed, toggleSidebar }) {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (!session) return null;

  const user = session.user;
  const router = useRouter();
  const pathname = usePathname();

  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', pathname: '/dashboard', roles: ['admin', 'user'] },
    { icon: Building, label: 'My Property', pathname: '/property-listing', roles: ['admin', 'user'] },
    { icon: BarChart3, label: 'Analytic', pathname: '/analytics', roles: ['admin'] },
    { icon: Calendar, label: 'Transaction', pathname: '/transactions', roles: ['admin', 'user'] },
    { icon: TrendingUp, label: 'Cashflow', pathname: '/cashflow', roles: ['admin'] },
    { icon: User, label: 'Customer', pathname: '/customers', roles: ['admin'] },
    { icon: MessageSquare, label: 'Message', pathname: '/messages', roles: ['admin', 'user'] },
    { icon: HelpCircle, label: 'User Guide', pathname: '/user-guide', roles: ['admin', 'user'] },
    { icon: HelpCircle, label: 'FAQ', pathname: '/faq', roles: ['admin', 'user'] },
    { icon: Settings, label: 'Help Center', pathname: '/help-center', roles: ['admin', 'user'] },
  ];

  return (
    <div className={`h-full bg-white shadow-md border-r transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 flex justify-between items-center">
        {!collapsed && (
          <span className="text-lg font-bold text-gray-800">Estate</span>
        )}
        <button className="hover:bg-emerald-700" onClick={toggleSidebar}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      <nav className="mt-4">
        {sidebarItems
          .filter(item => item.roles.includes(user.role))
          .map((item) => (
            <div
              key={item.pathname}
              onClick={() => router.push(item.pathname)}
              className={`flex items-center px-4 py-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 ${
                pathname === item.pathname ? 'bg-teal-50 text-teal-700' : ''
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </div>
          ))}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-4 left-4 text-xs text-gray-400">
          Logged in as: <span className="text-gray-600">{user.email}</span>
        </div>
      )}
    </div>
  );
}
