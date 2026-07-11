"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useUiStore } from '../../store/uiStore';
import { useNotifications } from '../../hooks/useNotifications';
import { Bell, LogOut, ChevronRight, User as UserIcon, Settings } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const { setIsNotifOpen } = useUiStore();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Get initials from name
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  // Get dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // Generate dynamic breadcrumbs
  const generateBreadcrumbs = () => {
    if (!pathname || pathname === '/') return [{ label: 'Beranda', isLast: true }];

    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      // Map known paths for better display
      let formatted = path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      if (path === 'admin-panel') formatted = 'Admin Panel';
      if (path === 'teknisi-area') formatted = 'Teknisi Area';

      return {
        label: formatted,
        isLast: index === paths.length - 1
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  // Helper function to shorten name to max 2 words (e.g. Muhammad Syifa)
  const shortName = user?.name ? user.name.split(' ').slice(0, 2).join(' ') : 'Karyawan';

  return (
    <header className="hidden md:flex h-[72px] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 items-center justify-between px-6 lg:px-10 sticky top-0 z-10 transition-all">

      {/* Left side: Breadcrumbs & Page Context */}
      <div className="hidden md:flex flex-col justify-center">
        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-400 mb-0.5">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className={crumb.isLast ? 'text-emerald-600' : ''}>
                {crumb.label}
              </span>
              {!crumb.isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-300" strokeWidth={3} />}
            </React.Fragment>
          ))}
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          {breadcrumbs[breadcrumbs.length - 1]?.label || 'Halaman'}
        </h2>
      </div>

      {/* Mobile: Brand */}
      <div className="md:hidden flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20">
          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
            <rect x="3" y="5" width="18" height="3" rx="1.5" fill="white" opacity="0.9" />
            <rect x="3" y="10" width="14" height="3" rx="1.5" fill="white" opacity="0.7" />
            <rect x="3" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
          </svg>
        </div>
        <span className="text-lg font-black text-slate-800 tracking-tight">SIGAP IT</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <button
          onClick={() => setIsNotifOpen(true)}
          className="relative w-11 h-11 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100/80 hover:text-emerald-600 transition-all active:scale-95"
        >
          <Bell className="w-[22px] h-[22px]" strokeWidth={2.5} />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-[2.5px] ring-white"></span>
          )}
        </button>

        {/* Divider (desktop) */}
        <div className="hidden md:block w-px h-8 bg-slate-200/80 mx-2"></div>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          {/* User avatar + dropdown (desktop) */}
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="hidden md:flex items-center gap-3.5 pl-3 pr-4 py-1.5 rounded-2xl hover:bg-slate-100/60 transition-all active:scale-[0.98] group">
            <div className="text-right flex flex-col justify-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1 mb-0.5">
                {getGreeting()}
              </p>
              <p className="text-[14px] font-extrabold text-slate-800 leading-none group-hover:text-emerald-700 transition-colors">
                {shortName}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-black shadow-md shadow-emerald-500/20 ring-2 ring-white">
              {initials}
            </div>
          </button>

          {/* Mobile avatar */}
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="md:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-black shadow-md ring-2 ring-white">
            {initials}
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              {/* Dropdown Header */}
              <div className="px-4 py-3 border-b border-slate-100/80 mb-1">
                <p className="text-sm font-extrabold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 uppercase">
                    {user?.department?.name || 'Umum'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    • {user?.position?.name || user?.role?.name || 'Staff'}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="px-1.5 space-y-0.5">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-colors">
                  <UserIcon className="w-4 h-4" />
                  Profil Saya
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-colors">
                  <Settings className="w-4 h-4" />
                  Pengaturan
                </button>
              </div>

              <div className="mx-3 my-1.5 h-px bg-slate-100"></div>

              {/* Logout Button */}
              <div className="px-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar dari SIGAP IT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
