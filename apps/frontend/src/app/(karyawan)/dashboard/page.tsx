"use client";

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  TrendingUp,
  CheckCircle2,
  Clock,
  Laptop,
  ArrowRight,
  Ticket,
  Wallet,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  LogOut,
  Bell,
  Lightbulb,
  AlertOctagon,
  FileText,
  X,
  Zap,
  Megaphone,
  Save,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useHelpdesk } from '@/hooks/useHelpdesk';
import { useAnnouncement } from '@/hooks/useAnnouncement';
import { useAssets } from '@/hooks/useAssets';
import Link from 'next/link';
import { clsx } from 'clsx';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const [currentTip, setCurrentTip] = useState(0);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { tickets, fetchTickets, isLoading, createTicket } = useHelpdesk();
  const { assets, fetchAssets } = useAssets();
  // Modal & Panel states
  const [isClient, setIsClient] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Dashboard states
  const [historyTab, setHistoryTab] = useState<'Aktif' | 'Selesai'>('Aktif');

  // Announcement state (Admin)
  const { announcement, isLoading: isLoadingAnnouncement, updateAnnouncement } = useAnnouncement();
  const [isEditingAnnounce, setIsEditingAnnounce] = useState(false);
  const [announceForm, setAnnounceForm] = useState({ title: '', message: '', isActive: true });
  const [isSavingAnnounce, setIsSavingAnnounce] = useState(false);

  // Sync form when announcement loaded
  useEffect(() => {
    if (announcement) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnnounceForm({ title: announcement.title, message: announcement.message, isActive: announcement.isActive });
    }
  }, [announcement]);

  const handleSaveAnnouncement = async () => {
    setIsSavingAnnounce(true);
    await updateAnnouncement(announceForm);
    setIsSavingAnnounce(false);
    setIsEditingAnnounce(false);
  };

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<{
    title: string;
    description: string;
    ticketType: 'INCIDENT' | 'SERVICE_REQUEST';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    ticketNumber: string;
    category: string;
    file: File | null;
  }>({
    title: '',
    description: '',
    ticketType: 'INCIDENT',
    priority: 'MEDIUM',
    ticketNumber: '',
    category: 'Hardware',
    file: null,
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createTicket({
      ...newTicket,
      ticketNumber: `TICK-${Math.floor(1000 + Math.random() * 9000)}`
    });
    if (success) {
      setIsCreateOpen(false);
      setNewTicket({
        title: '',
        description: '',
        ticketType: 'INCIDENT',
        priority: 'MEDIUM',
        ticketNumber: '',
        category: 'Hardware',
        file: null,
      });
      fetchTickets();
    }
  };

  const isKaryawan = user?.role?.id === 3;

  useEffect(() => {
    fetchTickets(1, 10);
  }, [fetchTickets]);

  // Master list IT tips (4 grup x 3 = 12)
  const masterTips = [
    // Grup 1
    "Kunci layar laptop (Win+L) saat meninggalkan meja kerja.",
    "Waspada phising! Jangan klik tautan dari email mencurigakan.",
    "Ganti password secara berkala demi keamanan akun Anda.",
    // Grup 2
    "Backup data pekerjaan Anda di cloud resmi perusahaan.",
    "Hindari penggunaan WiFi publik untuk transaksi penting.",
    "Segera lapor Helpdesk jika ada anomali pada perangkat.",
    // Grup 3
    "Jangan bagikan OTP atau kata sandi kepada siapapun.",
    "Pastikan antivirus di perangkat Anda selalu up-to-date.",
    "Hapus file sensitif dari folder Downloads jika tidak dipakai.",
    // Grup 4
    "Laporkan pesan instan mencurigakan ke tim Keamanan IT.",
    "Selalu perbarui OS untuk menutup celah keamanan.",
    "Matikan (Shutdown) laptop jika tidak digunakan waktu lama."
  ];

  // Pick 3 tips for the current day
  // eslint-disable-next-line react-hooks/purity
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const groupIndex = dayIndex % 4; // We have 4 groups
  const todaysTips = masterTips.slice(groupIndex * 3, groupIndex * 3 + 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Time-based greeting
  // eslint-disable-next-line react-hooks/purity
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';

  const handlePanicButton = () => {
    // In a real app, this would navigate to ticket creation with pre-filled high priority
    alert("PANIC BUTTON DITEKAN!\nMengarahkan ke form Pelaporan Darurat High Priority...");
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);

    // Fetch real data for dashboard stats
    if (user) {
      fetchTickets(1, 100);
      fetchAssets(1, 100);
    }
  }, [user, fetchTickets, fetchAssets]);

  if (!isClient) return null;

  return (
    <div className="relative min-h-screen pb-6 z-0">

      {/* Mobile-only Full Bleed Top Background (M-Banking Style) */}
      {isKaryawan && (
        <div className="md:hidden absolute -top-4 -left-4 -right-4 h-[300px] bg-gradient-to-b from-emerald-800 to-emerald-600 rounded-b-[2.5rem] -z-[1] shadow-lg shadow-emerald-900/20" />
      )}

      <div className="space-y-6">
        {/* Mobile-only native header */}
        <div className="md:hidden flex items-center justify-between pt-2 pb-2">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-md border",
              isKaryawan ? "bg-white/20 border-white/20" : "bg-gradient-to-br from-emerald-600 to-teal-700 border-transparent"
            )}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
                <rect x="4" y="6" width="16" height="3" rx="1.5" fill="currentColor" />
                <rect x="4" y="12" width="11" height="3" rx="1.5" fill="currentColor" opacity="0.8" />
                <rect x="4" y="18" width="7" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
              </svg>
            </div>
            <div>
              <p className={clsx(
                "text-[10px] font-bold uppercase tracking-[0.2em] leading-none mb-1",
                isKaryawan ? "text-emerald-100" : "text-slate-400"
              )}>{greeting}</p>
              <p className={clsx(
                "text-base font-extrabold leading-none",
                isKaryawan ? "text-white" : "text-slate-800"
              )}>{user?.name?.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotifOpen(true)}
              className={clsx(
                "relative w-10 h-10 flex items-center justify-center rounded-full transition-colors backdrop-blur-md",
                isKaryawan ? "bg-white/20 text-white hover:bg-white/30" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className={clsx(
                  "absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full border-2",
                  isKaryawan ? "bg-rose-500 border-emerald-700" : "bg-rose-500 border-white"
                )} />
              )}
            </button>
            <button onClick={logout} className={clsx(
              "w-10 h-10 flex items-center justify-center rounded-full transition-colors backdrop-blur-md",
              isKaryawan ? "bg-white/20 text-white hover:bg-red-500/80 hover:text-white" : "bg-slate-100 text-slate-500 active:bg-red-50 active:text-red-600"
            )}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isKaryawan ? (
          /* ===== KARYAWAN DASHBOARD ===== */
          <div className="flex flex-col">
            {/* Integrated Hero Section (Balance Card) */}
            <div className="relative pt-2">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-500/50 rounded-3xl p-6 pb-12 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[10px] sm:text-xs font-bold text-emerald-100/80 tracking-[0.2em] uppercase">Info Layanan IT</p>
                        {announcement?.isActive && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-2 text-white">
                        {isLoadingAnnouncement ? 'Memuat Info...' : announcement?.isActive ? announcement.title : 'Semua Sistem Berjalan Normal'}
                      </h2>
                      <p className="text-xs sm:text-sm text-emerald-50/90 font-medium leading-relaxed max-w-[85%]">
                        {isLoadingAnnouncement ? '...' : announcement?.isActive ? announcement.message : 'Jaringan WiFi, ERP, dan layanan operasional lainnya dalam kondisi prima.'}
                      </p>
                    </div>
                    <button onClick={handlePanicButton} className="group/btn relative overflow-hidden bg-rose-500 hover:bg-rose-600 text-white p-3 sm:px-4 sm:py-2.5 rounded-xl shadow-lg shadow-rose-900/40 transition-all active:scale-95 flex items-center gap-2 border border-rose-400/50 flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                      <span className="text-xs font-bold tracking-wide hidden sm:block">Lapor<br />Darurat</span>
                    </button>
                  </div>

                  <div className="flex items-end justify-between pt-5 border-t border-emerald-500/30">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-200/60 tracking-wider mb-1 uppercase">Update Terakhir</p>
                      <p className="text-xs font-bold text-white tracking-wide">
                        {announcement?.isActive && announcement.updatedAt
                          ? new Date(announcement.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                          : 'Hari ini'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-200/60 tracking-wider mb-1 uppercase">Tiket Aktif Saya</p>
                      <div className="flex items-center justify-end gap-2">
                        <Ticket className="w-4 h-4 text-emerald-200" />
                        <p className="text-xl font-black text-white leading-none">
                          {tickets.filter(t => t.reporter?.name === user?.name && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Quick Actions (M-Banking Signature Style) */}
            <div className="relative z-20 -mt-7 mx-1 md:mt-6 md:mx-0">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-emerald-900/5 px-4 py-5">
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                  {[
                    { name: 'Lapor', icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 group-hover:bg-rose-100', action: 'INCIDENT' },
                    { name: 'Request', icon: LifeBuoy, color: 'text-blue-500 bg-blue-50 group-hover:bg-blue-100', action: 'SERVICE_REQUEST' },
                    { name: 'Riwayat', icon: Clock, color: 'text-amber-500 bg-amber-50 group-hover:bg-amber-100', href: '/dashboard/helpdesk' },
                    { name: 'Aset', icon: Laptop, color: 'text-indigo-500 bg-indigo-50 group-hover:bg-indigo-100', href: '/dashboard/assets' },
                  ].map((btn) => (
                    btn.href ? (
                      <Link key={btn.name} href={btn.href} className="flex flex-col items-center gap-2 group">
                        <div className={clsx("w-12 h-12 md:w-12 md:h-12 rounded-[14px] flex items-center justify-center group-active:scale-95 transition-all duration-200", btn.color)}>
                          <btn.icon className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-600 tracking-wide">{btn.name}</span>
                      </Link>
                    ) : (
                      <button
                        key={btn.name}
                        onClick={() => {
                          setNewTicket(prev => ({ ...prev, ticketType: btn.action as 'INCIDENT' | 'SERVICE_REQUEST' }));
                          setIsCreateOpen(true);
                        }}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className={clsx("w-12 h-12 md:w-12 md:h-12 rounded-[14px] flex items-center justify-center group-active:scale-95 transition-all duration-200", btn.color)}>
                          <btn.icon className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-600 tracking-wide">{btn.name}</span>
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* IT Tips Banner (Dynamic Slider) - Placed below quick actions */}
            <div className="mt-5 bg-white border border-emerald-100 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm md:bg-emerald-50/80">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1 overflow-hidden relative h-10 rounded">
                <div
                  className="flex transition-transform duration-500 ease-in-out h-full"
                  style={{ transform: `translateX(-${currentTip * 100}%)` }}
                >
                  {todaysTips.map((tip, i) => (
                    <div key={i} className="w-full flex-shrink-0 text-[11px] md:text-xs font-bold text-slate-600 flex items-center leading-snug pr-2">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[15px] font-extrabold text-slate-800 tracking-tight">Riwayat Tiket</p>
                <Link href="/dashboard/helpdesk" className="text-[11px] text-emerald-600 font-extrabold hover:text-emerald-700 flex items-center gap-0.5 bg-emerald-50/50 hover:bg-emerald-100 transition-colors px-2.5 py-1.5 rounded-lg">
                  Lihat Semua <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Segmented Control Tabs (Modern iOS/MBanking style) */}
              <div className="flex bg-slate-100/70 p-1 rounded-xl mb-4 w-fit border border-slate-200/50 shadow-inner">
                {['Aktif', 'Selesai'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setHistoryTab(tab as 'Aktif' | 'Selesai')}
                    className={clsx(
                      "px-6 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300",
                      historyTab === tab
                        ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-900/5"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-[1.25rem] shadow-sm border border-slate-100 overflow-hidden min-h-[200px] relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : null}
                <div className="divide-y divide-slate-100/80">
                  {(() => {
                    const baseTickets = isKaryawan
                      ? tickets.filter(t => t.reporter?.name === user?.name)
                      : tickets;

                    const filtered = baseTickets.filter(t => {
                      if (historyTab === 'Aktif') return t.status === 'OPEN' || t.status === 'IN_PROGRESS';
                      return t.status === 'RESOLVED' || t.status === 'CLOSED';
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in duration-500">
                          <div className="w-16 h-16 bg-slate-50 rounded-[1.25rem] flex items-center justify-center mb-4 shadow-inner">
                            <Ticket className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                          </div>
                          <p className="text-[13px] font-extrabold text-slate-700">Belum ada tiket</p>
                          <p className="text-[11px] font-medium text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                            {historyTab === 'Aktif' ? 'Semua tiket Anda sudah beres atau Anda belum membuat laporan.' : 'Belum ada tiket yang diselesaikan dalam riwayat Anda.'}
                          </p>
                        </div>
                      );
                    }

                    return filtered.map((ticket) => {
                      const isIncident = ticket.ticketType === 'INCIDENT';
                      const IconComponent = isIncident ? Laptop : Ticket;

                      let bg = 'bg-slate-50';
                      let iconColor = 'text-slate-500';
                      let statusText: string = ticket.status;

                      if (ticket.status === 'OPEN') {
                        bg = 'bg-blue-50'; iconColor = 'text-blue-500'; statusText = 'Menunggu';
                      } else if (ticket.status === 'IN_PROGRESS') {
                        bg = 'bg-amber-50'; iconColor = 'text-amber-500'; statusText = 'Diproses';
                      } else if (ticket.status === 'RESOLVED') {
                        bg = 'bg-emerald-50'; iconColor = 'text-emerald-500'; statusText = 'Selesai';
                      } else if (ticket.status === 'CLOSED') {
                        bg = 'bg-slate-50'; iconColor = 'text-slate-500'; statusText = 'Ditutup';
                      }

                      return (
                        <Link href={`/dashboard/helpdesk`} key={ticket.id} className="group flex gap-4 items-center p-4 sm:p-5 hover:bg-slate-50/80 transition-all cursor-pointer">
                          <div className={`w-12 h-12 rounded-[14px] ${bg} flex items-center justify-center flex-shrink-0 shadow-inner transition-transform group-hover:scale-105`}>
                            <IconComponent className={`w-6 h-6 ${iconColor}`} strokeWidth={1.75} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] sm:text-sm font-extrabold text-slate-800 leading-tight truncate group-hover:text-emerald-700 transition-colors">
                              {ticket.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded tracking-wide">
                                {ticket.ticketNumber}
                              </span>
                              <span className="text-[10px] font-medium text-slate-300">•</span>
                              <span className="text-[10px] font-medium text-slate-400">
                                {new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className={clsx(
                              "text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm",
                              ticket.status === 'OPEN' && "bg-white border border-blue-100 text-blue-600",
                              ticket.status === 'IN_PROGRESS' && "bg-white border border-amber-100 text-amber-600",
                              ticket.status === 'RESOLVED' && "bg-white border border-emerald-100 text-emerald-600",
                              ticket.status === 'CLOSED' && "bg-white border border-slate-200 text-slate-500"
                            )}>
                              {statusText}
                            </span>
                          </div>
                        </Link>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ===== ADMIN DASHBOARD ===== */
          <>
            {/* IT Tips Banner for Admin (Dynamic Slider) */}
            <div className="bg-emerald-50/80 border border-emerald-100/60 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 overflow-hidden relative h-10 rounded">
                <div
                  className="flex transition-transform duration-500 ease-in-out h-full"
                  style={{ transform: `translateX(-${currentTip * 100}%)` }}
                >
                  {todaysTips.map((tip, i) => (
                    <div key={i} className="w-full flex-shrink-0 text-[11px] md:text-xs font-semibold text-emerald-800 flex items-center leading-snug pr-2">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stat Cards (BRImo balance card style) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-5">
              {[
                {
                  title: 'Tiket Terbuka',
                  value: tickets.filter(t => t.status === 'OPEN').length.toString(),
                  sub: `${tickets.filter(t => t.status === 'OPEN' && t.priority === 'HIGH').length} High Priority`,
                  icon: LifeBuoy, gradient: 'from-red-50 to-orange-50', iconColor: 'text-red-500', valueColor: 'text-red-600'
                },
                {
                  title: 'Sisa Anggaran',
                  value: 'Belum Aktif',
                  sub: 'Modul Anggaran',
                  icon: Wallet, gradient: 'from-green-50 to-emerald-50', iconColor: 'text-green-500', valueColor: 'text-green-600'
                },
                {
                  title: 'Sedang Diproses',
                  value: tickets.filter(t => t.status === 'IN_PROGRESS').length.toString(),
                  sub: 'Tiket Berjalan',
                  icon: ShieldAlert, gradient: 'from-amber-50 to-yellow-50', iconColor: 'text-amber-500', valueColor: 'text-amber-600'
                },
                {
                  title: 'Aset Aktif',
                  value: assets.filter(a => a.status === 'IN_USE' || a.status === 'AVAILABLE').length.toString(),
                  sub: `${assets.filter(a => a.status === 'MAINTENANCE').length} maintenance`,
                  icon: Laptop, gradient: 'from-blue-50 to-cyan-50', iconColor: 'text-blue-500', valueColor: 'text-blue-600'
                },
              ].map((stat) => (
                <div key={stat.title} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm">
                  <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={1.8} />
                  </div>
                  <p className={`text-xl md:text-2xl font-extrabold ${stat.valueColor} tracking-tight`}>{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{stat.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions Row (M-Banking style icon grid) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Aksi Cepat</p>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: 'Helpdesk', icon: LifeBuoy, color: 'from-blue-500 to-cyan-500', href: '/dashboard/helpdesk' },
                  { name: 'Anggaran', icon: Wallet, color: 'from-green-500 to-emerald-500', href: '/dashboard/budgets' },
                  { name: 'Audit', icon: ShieldAlert, color: 'from-amber-500 to-orange-500', href: '/dashboard/audit' },
                  { name: 'Aset', icon: Laptop, color: 'from-purple-500 to-violet-500', href: '/dashboard/assets' },
                ].map((action) => (
                  <Link key={action.name} href={action.href} className="flex flex-col items-center gap-2 group">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg shadow-slate-200/50 group-hover:scale-105 group-active:scale-95 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">{action.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Admin Announcement Settings */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Pengaturan Pengumuman</p>
                </div>
                {!isEditingAnnounce ? (
                  <button onClick={() => setIsEditingAnnounce(true)} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md hover:bg-emerald-100">Ubah</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => {
                      setIsEditingAnnounce(false);
                      if (announcement) setAnnounceForm({ title: announcement.title, message: announcement.message, isActive: announcement.isActive });
                    }} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md hover:bg-slate-200">Batal</button>
                    <button onClick={handleSaveAnnouncement} disabled={isSavingAnnounce} className="text-[10px] font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-md hover:bg-emerald-700 flex items-center gap-1">
                      {isSavingAnnounce ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : <Save className="w-3 h-3" />} Simpan
                    </button>
                  </div>
                )}
              </div>

              {isEditingAnnounce ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Status Pengumuman</label>
                    <button onClick={() => setAnnounceForm(prev => ({ ...prev, isActive: !prev.isActive }))} className="flex items-center gap-2">
                      {announceForm.isActive ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                      <span className={clsx("text-xs font-bold", announceForm.isActive ? "text-emerald-700" : "text-slate-500")}>{announceForm.isActive ? 'Aktif (Ditampilkan)' : 'Tidak Aktif (Disembunyikan)'}</span>
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Judul (Singkat)</label>
                    <input type="text" value={announceForm.title} onChange={e => setAnnounceForm({ ...announceForm, title: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" placeholder="Contoh: Sistem ERP Sedang Maintenance" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Pesan Detail</label>
                    <textarea rows={2} value={announceForm.message} onChange={e => setAnnounceForm({ ...announceForm, message: e.target.value })} className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 resize-none" placeholder="Contoh: Estimasi selesai pukul 14:00 WIB..." />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={clsx("w-2 h-2 rounded-full", announceForm.isActive ? "bg-emerald-500" : "bg-slate-300")} />
                    <p className="text-xs font-extrabold text-slate-700">{announceForm.isActive ? announceForm.title || '(Tanpa Judul)' : 'Tidak ada pengumuman aktif'}</p>
                  </div>
                  {announceForm.isActive && <p className="text-[11px] text-slate-500 font-medium pl-4">{announceForm.message || '(Tanpa Pesan)'}</p>}
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Aktivitas Terbaru</p>
                <button className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-0.5">
                  Semua <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { text: 'Tiket TICK-001 Diselesaikan', sub: 'Oleh IT Support • 2 jam lalu', icon: CheckCircle2, bg: 'bg-green-50', iconColor: 'text-green-500' },
                  { text: 'Menunggu Approval RKAP', sub: 'Oleh Manager IT • 5 jam lalu', icon: Clock, bg: 'bg-amber-50', iconColor: 'text-amber-500' },
                  { text: 'SOP Keamanan v2.0 Rilis', sub: 'Oleh IT Governance • Kemarin', icon: TrendingUp, bg: 'bg-blue-50', iconColor: 'text-blue-500' },
                ].map((activity, i) => (
                  <div key={i} className="flex gap-3.5 items-start">
                    <div className={`w-10 h-10 rounded-xl ${activity.bg} flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className={`w-5 h-5 ${activity.iconColor}`} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-bold text-slate-700 leading-snug truncate">{activity.text}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{activity.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {/* ===== NOTIFICATION PANEL ===== */}
      <div
        className={clsx(
          "fixed inset-0 z-[100] flex justify-end transition-all duration-300",
          isNotifOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div
          className={clsx(
            "absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300",
            isNotifOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsNotifOpen(false)}
        />
        <div
          className={clsx(
            "relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            isNotifOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-extrabold text-slate-800">Notifikasi</h2>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full hover:bg-emerald-100">Tandai semua dibaca</button>
              )}
              <button onClick={() => setIsNotifOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-500">Tidak ada notifikasi</p>
                </div>
              ) : (
                notifications.map(n => (
                  <Link
                    href={n.link || '#'}
                    key={n.id}
                    onClick={() => { markAsRead(n.id); setIsNotifOpen(false); }}
                    className={clsx(
                      "block p-4 rounded-2xl border transition-all hover:bg-slate-50",
                      n.read ? "bg-white border-slate-100" : "bg-emerald-50/50 border-emerald-100"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className={clsx("text-xs font-bold", n.read ? "text-slate-800" : "text-emerald-800")}>{n.title}</p>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {new Date(n.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{n.message}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ===== BOTTOM SHEET: CREATE TICKET (Dashboard Version) ===== */}
      <div
        className={clsx(
          "fixed inset-0 z-[100] flex items-end md:items-center justify-center transition-all duration-300",
          isCreateOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        onClick={() => setIsCreateOpen(false)}
      >
        {/* Backdrop */}
        <div
          className={clsx(
            "absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300",
            isCreateOpen ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Sheet */}
        <div
          className={clsx(
            "relative bg-white rounded-t-[1.75rem] md:rounded-2xl w-full md:max-w-md max-h-[88vh] overflow-y-auto shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
            isCreateOpen ? "translate-y-0 opacity-100 md:scale-100" : "translate-y-[100%] md:translate-y-10 opacity-0 md:scale-95"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle (mobile) */}
          <div className="md:hidden flex justify-center pt-3 pb-0.5">
            <div className="w-9 h-1 bg-slate-200 rounded-full" />
          </div>

          <div className="p-5 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Buat Tiket</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Laporkan kendala IT kamu</p>
            </div>
            <button onClick={() => setIsCreateOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="px-5 pb-8 space-y-4">
            {/* Ticket Type Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-0.5">Jenis Tiket</label>
              <div className="grid grid-cols-2 gap-2.5 mt-2">
                {[
                  { value: 'INCIDENT', label: 'Insiden', sub: 'Gangguan & Error', icon: Zap, gradient: 'from-red-500 to-orange-500', border: 'border-red-200 bg-red-50/50' },
                  { value: 'SERVICE_REQUEST', label: 'Layanan', sub: 'Permintaan Baru', icon: LifeBuoy, gradient: 'from-emerald-500 to-teal-500', border: 'border-emerald-200 bg-emerald-50/50' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewTicket({ ...newTicket, ticketType: opt.value as any })}
                    className={clsx(
                      "p-3.5 rounded-xl border-2 text-left transition-all",
                      newTicket.ticketType === opt.value
                        ? opt.border
                        : "border-slate-100 bg-white hover:bg-slate-50"
                    )}
                  >
                    <div className={clsx("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center mb-2", opt.gradient)}>
                      <opt.icon className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <p className="text-xs font-bold text-slate-800">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-0.5">Judul Keluhan</label>
              <input required type="text" value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                className="mt-1.5 w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 placeholder:font-medium"
                placeholder="Contoh: Laptop tidak bisa nyala"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-0.5">Deskripsi</label>
              <textarea required rows={3} value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                className="mt-1.5 w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 placeholder:font-medium resize-none"
                placeholder="Jelaskan detail masalahnya..."
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-0.5">Kategori</label>
              <select required value={newTicket.category} onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                className="mt-1.5 w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
              >
                <option value="Hardware">Hardware (Laptop, Printer, dll)</option>
                <option value="Software">Software (ERP, Office, dll)</option>
                <option value="Jaringan">Jaringan (WiFi, Internet)</option>
                <option value="Akun/Akses">Akun/Akses (Lupa Password, Request Akses)</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-0.5">Prioritas</label>
              <div className="flex gap-2 mt-1.5">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewTicket({ ...newTicket, priority: p })}
                    className={clsx(
                      "flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all",
                      newTicket.priority === p
                        ? p === 'HIGH' ? 'border-red-200 bg-red-50 text-red-600'
                          : p === 'MEDIUM' ? 'border-amber-200 bg-amber-50 text-amber-600'
                            : 'border-green-200 bg-green-50 text-green-600'
                        : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                    )}
                  >
                    {p === 'LOW' ? 'Rendah' : p === 'MEDIUM' ? 'Sedang' : 'Tinggi'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-0.5">Lampiran (Opsional)</label>
              <input type="file" accept="image/png, image/jpeg, application/pdf"
                onChange={e => {
                  if (e.target.files?.[0]) {
                    setNewTicket({ ...newTicket, file: e.target.files[0] });
                  }
                }}
                className="mt-1.5 w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
              {newTicket.file && <p className="mt-1 text-[10px] font-medium text-emerald-600 ml-1">File terpilih: {newTicket.file.name}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center">
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              ) : 'Kirim Tiket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
