'use client';
import { useEffect} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { BuyersContent } from '@/app/buyers/page'; // Importing BuyersContent from the buyers page
//hooks


import { hasPermission } from '@/lib/roles';

export default function BuyersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  if (status === 'unauthenticated') {
    return null; // prevent rendering until redirected
  }

    if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Admin only access
  if (!hasPermission(session.user.role, 'buyers', 'read')) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view buyers.</p>
          </div>
        </div>
    );
  }

  return (
      <BuyersContent />
  );
}
