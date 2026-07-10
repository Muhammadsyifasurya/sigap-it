"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  Laptop, 
  Wallet, 
  LifeBuoy, 
  Users, 
  Briefcase,
  MoreHorizontal
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';

const allMenuItems = [
  { name: 'Beranda', path: '/dashboard', icon: LayoutDashboard },
  { name: 'SOP & Dokumen', path: '/dashboard/documents', icon: FileText },
  { name: 'Audit', path: '/dashboard/audit', icon: ShieldAlert },
  { name: 'Aset', path: '/dashboard/assets', icon: Laptop },
  { name: 'Anggaran', path: '/dashboard/budgets', icon: Wallet },
  { name: 'Helpdesk', path: '/dashboard/helpdesk', icon: LifeBuoy },
  { name: 'Vendor', path: '/dashboard/vendors', icon: Users },
  { name: 'Proyek', path: '/dashboard/projects', icon: Briefcase },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isKaryawan = user?.role?.id === 3;

  const menuItems = isKaryawan
    ? allMenuItems.filter(item => ['Beranda', 'Helpdesk'].includes(item.name))
    : allMenuItems;

  // Mobile: limit to 4 items + "More" for admin, show all for karyawan
  const mobileItems = isKaryawan ? menuItems : menuItems.slice(0, 4);

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex w-[264px] bg-white flex-col h-screen sticky top-0 border-r border-slate-100 z-20">
        
        {/* Logo */}
        <div className="h-[72px] flex items-center px-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center mr-3 shadow-sm shadow-emerald-500/20">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <rect x="3" y="5" width="18" height="3" rx="1.5" fill="white" opacity="0.9" />
              <rect x="3" y="10" width="14" height="3" rx="1.5" fill="white" opacity="0.7" />
              <rect x="3" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-slate-800 tracking-tight leading-tight">SIGAP IT</span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider">PT LPP AGRO</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Menu</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(`${item.path}/`) && item.path !== '/dashboard');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold transition-all',
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                <div className={clsx(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                  isActive ? "bg-emerald-100" : "bg-slate-50"
                )}>
                  <Icon className={clsx("w-[18px] h-[18px]", isActive ? "text-emerald-600" : "text-slate-400")} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick CTA */}
        {isKaryawan && (
          <div className="p-4 border-t border-slate-100">
            <Link href="/dashboard/helpdesk" className="block w-full py-3 text-center bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
              + Buat Tiket
            </Link>
          </div>
        )}
      </aside>

    </>
  );
}
