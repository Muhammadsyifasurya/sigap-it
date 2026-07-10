"use client";

import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, ChevronDown } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Get initials from name
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="hidden md:flex h-16 md:h-[72px] bg-white border-b border-slate-100 items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      
      {/* Left side */}
      <div className="hidden md:block">
        <h2 className="text-lg font-bold text-slate-800">
          Halo, {user?.name?.split(' ')[0] || 'Karyawan'} 👋
        </h2>
        <p className="text-xs font-medium text-slate-400 mt-0.5">
          {user?.department?.name} • {user?.role?.name}
        </p>
      </div>

      {/* Mobile: Brand */}
      <div className="md:hidden flex items-center gap-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <rect x="3" y="5" width="18" height="3" rx="1.5" fill="white" opacity="0.9" />
            <rect x="3" y="10" width="14" height="3" rx="1.5" fill="white" opacity="0.7" />
            <rect x="3" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
          </svg>
        </div>
        <span className="text-base font-extrabold text-slate-800 tracking-tight">SIGAP IT</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        
        {/* Notifications */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Divider (desktop) */}
        <div className="hidden md:block w-px h-8 bg-slate-100 mx-1"></div>

        {/* User avatar + dropdown (desktop) */}
        <button onClick={handleLogout} className="hidden md:flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-slate-50 transition-colors group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {initials}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-700 leading-tight">{user?.name?.split(' ')[0]}</p>
            <p className="text-[10px] font-semibold text-red-400 group-hover:text-red-600 flex items-center gap-0.5">
              <LogOut className="w-2.5 h-2.5" /> Keluar
            </p>
          </div>
        </button>

        {/* Mobile avatar */}
        <button onClick={handleLogout} className="md:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
          {initials}
        </button>
      </div>
    </header>
  );
}
