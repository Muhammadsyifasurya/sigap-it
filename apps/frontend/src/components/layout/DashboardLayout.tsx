"use client";

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = React.useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        // Strict Role Redirection
        const roleId = useAuthStore.getState().user?.role?.id;
        const currentPath = window.location.pathname;

        if ((roleId === 1 || roleId === 2) && !currentPath.startsWith('/admin-panel')) {
          router.push('/admin-panel');
        } else if (roleId === 4 && !currentPath.startsWith('/teknisi-area')) {
          router.push('/teknisi-area');
        } else if (roleId === 3 && !currentPath.startsWith('/dashboard')) {
          router.push('/dashboard');
        }
      }
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm shadow-blue-500/20">
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <rect x="3" y="5" width="18" height="3" rx="1.5" fill="white" opacity="0.9" />
            <rect x="3" y="10" width="14" height="3" rx="1.5" fill="white" opacity="0.7" />
            <rect x="3" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
          </svg>
        </div>
        <span className="w-6 h-6 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
