"use client";

import React, { useState, useEffect } from 'react';
import {
  Ticket, Clock, CheckCircle2, AlertTriangle, ChevronRight,
  Wrench, Activity, AlertCircle, Play, Layers, Bell, LogOut, X, Info,
  Zap, LifeBuoy, TrendingUp, ArrowRight, Trophy, Lightbulb, Heart, Target
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useHelpdesk } from '@/hooks/useHelpdesk';
import { useNotifications } from '@/hooks/useNotifications';
import { useUiStore } from '@/store/uiStore';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function TeknisiDashboard() {
  const { user, logout } = useAuthStore();
  const { tickets, fetchTickets, isLoading } = useHelpdesk();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isNotifOpen, notifTab, setIsNotifOpen, setNotifTab } = useUiStore();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'URGENT' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('OPEN');
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      fetchTickets(1, 100);
    }
  }, [user, fetchTickets]);

  if (!isClient) return null;

  // Filter tickets based on status and assignee
  const openTickets = tickets.filter(t => t.status === 'OPEN');
  const myInProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS' && t.assignee?.name === user?.name);
  const myResolvedTickets = tickets.filter(t => (t.status === 'RESOLVED' || t.status === 'CLOSED') && t.assignee?.name === user?.name);
  const highPriorityOpen = openTickets.filter(t => t.priority === 'HIGH');

  if (activeTab === 'URGENT' && highPriorityOpen.length === 0 && openTickets.length > 0) {
    setActiveTab('OPEN');
  }

  const displayedTickets =
    activeTab === 'URGENT' ? highPriorityOpen :
      activeTab === 'OPEN' ? openTickets :
        activeTab === 'IN_PROGRESS' ? myInProgressTickets : myResolvedTickets;

  // ============================================================
  // Build rich activity feed from all tickets
  // ============================================================
  type ActivityEvent = {
    id: string;
    icon: 'new' | 'picked' | 'done';
    label: string;
    actor: string;
    ticketNumber: string;
    ticketTitle: string;
    ticketId: string;
    time: string;
  };

  const activityFeed: ActivityEvent[] = [];
  tickets.forEach(t => {
    // Event: Tiket dibuat (selalu ada)
    activityFeed.push({
      id: `${t.id}-created`,
      icon: 'new',
      label: 'Tiket baru dibuat oleh',
      actor: t.reporter?.name || 'Pengguna',
      ticketNumber: t.ticketNumber,
      ticketTitle: t.title,
      ticketId: String(t.id),
      time: t.createdAt,
    });
    // Event: Tiket diambil (jika sudah ada assignee)
    if (t.assignee?.name && (t.status === 'IN_PROGRESS' || t.status === 'RESOLVED' || t.status === 'CLOSED')) {
      activityFeed.push({
        id: `${t.id}-picked`,
        icon: 'picked',
        label: 'Diambil oleh',
        actor: t.assignee.name,
        ticketNumber: t.ticketNumber,
        ticketTitle: t.title,
        ticketId: String(t.id),
        time: t.updatedAt || t.createdAt,
      });
    }
    // Event: Tiket selesai
    if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
      activityFeed.push({
        id: `${t.id}-done`,
        icon: 'done',
        label: 'Diselesaikan oleh',
        actor: t.assignee?.name || 'Tim IT',
        ticketNumber: t.ticketNumber,
        ticketTitle: t.title,
        ticketId: String(t.id),
        time: t.resolvedAt || t.updatedAt || t.createdAt,
      });
    }
  });
  // Sort by time desc, take latest 7
  const latestActivity = activityFeed
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 20);

  return (
    <div className="relative min-h-screen pb-20 z-0">

      {/* ========================================================= */}
      {/* MOBILE-ONLY M-BANKING TOP BACKGROUND */}
      {/* ========================================================= */}
      {/* Background melengkung khas M-Banking (Wondr/Livin) */}
      <div className="md:hidden absolute -top-4 -left-4 -right-4 h-[260px] bg-gradient-to-b from-emerald-800 to-teal-700 rounded-b-[2.5rem] -z-[1] shadow-xl shadow-emerald-900/30 overflow-hidden">
        {/* Dekorasi Abstract Lingkaran */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/20 rounded-full blur-xl translate-y-1/4 -translate-x-1/4"></div>
      </div>

      {/* ========================================================= */}
      {/* HEADER INFO */}
      {/* ========================================================= */}
      {/* Dynamic subtitle based on ticket workload */}
      {(() => {
        // 1. Hitung performa dan cari Teknisi terbaik hari ini (Real Data)
        const resolvedTodayTickets = tickets.filter(t => {
          if (t.status !== 'RESOLVED' && t.status !== 'CLOSED') return false;
          // Gunakan resolvedAt jika ada, fallback ke updatedAt
          const dateStr = (t as any).resolvedAt || t.updatedAt;
          if (!dateStr) return false;
          const resolvedDate = new Date(dateStr);
          const today = new Date();
          return resolvedDate.getDate() === today.getDate() &&
            resolvedDate.getMonth() === today.getMonth() &&
            resolvedDate.getFullYear() === today.getFullYear();
        });

        const technicianCounts: Record<string, number> = {};
        resolvedTodayTickets.forEach(t => {
           if (t.assignee?.name) {
               technicianCounts[t.assignee.name] = (technicianCounts[t.assignee.name] || 0) + 1;
           }
        });
        
        let topTechnician = null;
        let maxResolved = 0;
        for (const [name, count] of Object.entries(technicianCounts)) {
            if (count > maxResolved) {
                maxResolved = count;
                topTechnician = name;
            }
        }

        // 2. Analisis Tren Kategori (Real Data)
        const categoryCounts: Record<string, number> = {};
        openTickets.forEach(t => {
            const cat = t.category || 'Umum';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        
        let topCategory = null;
        let topCatCount = 0;
        for (const [cat, count] of Object.entries(categoryCounts)) {
            if (count > topCatCount) {
                topCatCount = count;
                topCategory = cat;
            }
        }

        // 3. Tiket paling lama mengendap (Real Data)
        let oldestTicket: any = null;
        if (openTickets.length > 0) {
            oldestTicket = openTickets.reduce((oldest, current) => {
                return new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest;
            }, openTickets[0]);
        }
        
        let oldestDays = 0;
        if (oldestTicket) {
            const diffTime = Math.abs(new Date().getTime() - new Date(oldestTicket.createdAt).getTime());
            oldestDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        const carouselItems = [
          // Slide 1: Radar SLA / Misi Harian (Real)
          ...(highPriorityOpen.length > 0 ? [{
            id: 'sla-alert',
            icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
            watermark: <AlertTriangle className="w-64 h-64 text-red-100/40 -rotate-12" />,
            title: "Peringatan SLA Darurat!",
            subtitle: `Terdapat ${highPriorityOpen.length} tiket prioritas tinggi di antrean yang butuh dieksekusi segera!`,
            bg: "bg-gradient-to-r from-red-50 to-white",
            iconBg: "bg-red-100 border-red-200",
            titleColor: "text-red-600",
            isUrgent: true
          }] : [{
            id: 'daily-mission',
            icon: <Target className="w-6 h-6 text-blue-600" />,
            watermark: <Target className="w-64 h-64 text-blue-100/40 rotate-12" />,
            title: "Status Antrean",
            subtitle: openTickets.length > 0 
                ? `Tersisa ${openTickets.length} tiket masuk yang belum ditangani. Ayo segera direspons.`
                : `Luar Biasa! Antrean tiket saat ini kosong (0 tiket). Saatnya bersantai sejenak.`,
            bg: "bg-gradient-to-r from-blue-50 to-white",
            iconBg: "bg-blue-100 border-blue-200",
            titleColor: "text-blue-600",
            isUrgent: false
          }]),
          
          // Slide 2: Performa & Gamifikasi (Real)
          {
            id: 'top-teknisi',
            icon: <Trophy className="w-6 h-6 text-amber-600" />,
            watermark: <Trophy className="w-64 h-64 text-amber-100/40 rotate-12" />,
            title: "Performa Tim Hari Ini",
            subtitle: topTechnician 
                ? `Tim menyelesaikan ${resolvedTodayTickets.length} tiket hari ini! Apresiasi untuk ${topTechnician} yang memproses terbanyak.`
                : resolvedTodayTickets.length > 0
                  ? `Kerja bagus! Sebanyak ${resolvedTodayTickets.length} tiket telah diselesaikan hari ini.`
                  : `Belum ada tiket yang diselesaikan hari ini. Ayo kita mulai selesaikan antrean!`,
            bg: "bg-gradient-to-r from-amber-50 to-white",
            iconBg: "bg-amber-100 border-amber-200",
            titleColor: "text-amber-600",
            isUrgent: false
          },

          // Slide 3: Tren Masalah Terbanyak (Real)
          {
            id: 'trend',
            icon: <Activity className="w-6 h-6 text-purple-600" />,
            watermark: <Activity className="w-64 h-64 text-purple-100/40 -rotate-12" />,
            title: "Radar Kategori Gangguan",
            subtitle: topCategory && topCatCount > 1
                ? `Terdapat ${topCatCount} antrean tiket terkait "${topCategory}". Apakah ada gangguan massal?`
                : `Keluhan terpantau normal dan merata di berbagai kategori saat ini.`,
            bg: "bg-gradient-to-r from-purple-50 to-white",
            iconBg: "bg-purple-100 border-purple-200",
            titleColor: "text-purple-600",
            isUrgent: false
          },

          // Slide 4: Tiket Paling Lama / Apresiasi (Real)
          (oldestTicket ? {
            id: 'oldest-ticket',
            icon: <Clock className="w-6 h-6 text-teal-600" />,
            watermark: <Clock className="w-64 h-64 text-teal-100/40 rotate-12" />,
            title: "Peringatan Tiket Tertunda",
            subtitle: oldestDays > 0 
                ? `Tiket ${oldestTicket.ticketNumber} sudah mengantre ${oldestDays} hari belum ditangani! Harap jadikan prioritas.`
                : `Tiket ${oldestTicket.ticketNumber} adalah antrean paling lama (dibuat hari ini). Segera respons pelapor.`,
            bg: "bg-gradient-to-r from-teal-50 to-white",
            iconBg: "bg-teal-100 border-teal-200",
            titleColor: "text-teal-600",
            isUrgent: false
          } : {
            id: 'kudos',
            icon: <Heart className="w-6 h-6 text-pink-600" />,
            watermark: <Heart className="w-64 h-64 text-pink-100/40 -rotate-12" />,
            title: "Apresiasi Tim",
            subtitle: "Antrean benar-benar bersih dan tidak ada tiket menumpuk sama sekali! Kerja keras kalian sangat dihargai.",
            bg: "bg-gradient-to-r from-pink-50 to-white",
            iconBg: "bg-pink-100 border-pink-200",
            titleColor: "text-pink-600",
            isUrgent: false
          })
        ];

        return (
          <div className="mb-6 md:mb-8">
            <div className="mb-4 pt-4 md:hidden flex items-start justify-between">
              <div>
                {/* Mobile: first name only */}
                <h1 className="text-xl font-black text-white tracking-tight">
                  Halo, {user?.name?.split(' ')[0] || 'Teknisi'}
                </h1>
                {/* Mobile subtitle */}
                <p className="text-xs font-medium text-emerald-100 mt-1">Siap menyelesaikan masalah IT hari ini?</p>
              </div>

              {/* Mobile Header Actions (Desktop handles this in Topbar) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNotifOpen(true)}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* FULL WIDTH ANNOUNCEMENT CAROUSEL (Desktop Only) */}
            {/* ========================================================= */}
            <div className="hidden md:block relative w-full h-[140px] rounded-[24px] overflow-hidden shadow-sm group bg-white border border-slate-200">
              
              {carouselItems.map((item, index) => (
                <div 
                  key={item.id}
                  className={clsx(
                    "absolute inset-0 w-full h-full transition-all duration-700 ease-in-out flex items-center px-8 md:px-12",
                    item.bg,
                    index === currentTipIndex ? "opacity-100 translate-x-0 z-10" : 
                    index < currentTipIndex ? "opacity-0 -translate-x-12 z-0 pointer-events-none" : "opacity-0 translate-x-12 z-0 pointer-events-none"
                  )}
                >
                  {/* Giant Watermark Icon for beautiful SaaS aesthetic */}
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                    {item.watermark}
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-6 w-full max-w-4xl">
                    <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center border flex-shrink-0 shadow-sm", item.iconBg)}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className={clsx("text-sm font-bold tracking-wide", item.titleColor)}>
                          {item.title}
                        </p>
                        {item.isUrgent && (
                          <span className="bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse shadow-sm">
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-semibold leading-snug text-slate-700">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Carousel Navigation Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                {carouselItems.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentTipIndex(i)}
                    className={clsx(
                      "h-1.5 rounded-full transition-all duration-500",
                      i === currentTipIndex ? "w-8 bg-slate-400" : "w-2 bg-slate-200 hover:bg-slate-300"
                    )}
                  />
                ))}
              </div>
              
              {/* Navigation buttons */}
              <button 
                onClick={() => setCurrentTipIndex(prev => (prev - 1 + carouselItems.length) % carouselItems.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 border border-slate-200 hover:scale-105"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <button 
                onClick={() => setCurrentTipIndex(prev => (prev + 1) % carouselItems.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 border border-slate-200 hover:scale-105"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* 2-COLUMN WRAPPER - desktop only, mobile stacks normally */}
      {/* ========================================================= */}
      <div className="md:flex md:gap-6 md:items-start">

        {/* ===================== LEFT COLUMN ===================== */}
        <div className="flex-1 min-w-0">

          {/* M-BANKING HERO CARD - Mobile Only */}
          {/* ========================================================= */}
          <div className="md:hidden bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] mb-6 relative overflow-hidden">

            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" /> Ringkasan Tugas
              </p>
              <Link href="/teknisi-area/helpdesk" className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Lihat Semua
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 divide-x divide-slate-100">
              <div className="text-center px-1" onClick={() => setActiveTab('OPEN')}>
                <p className="text-2xl font-black text-slate-800">{openTickets.length}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-1">Menunggu</p>
              </div>
              <div className="text-center px-1" onClick={() => setActiveTab('IN_PROGRESS')}>
                <p className="text-2xl font-black text-amber-500">{myInProgressTickets.length}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-1">Diproses</p>
              </div>
              <div className="text-center px-1" onClick={() => setActiveTab('RESOLVED')}>
                <p className="text-2xl font-black text-emerald-500">{myResolvedTickets.length}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-1">Selesai</p>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DESKTOP STAT CARDS - Desktop Only */}
          {/* ========================================================= */}
          <div className="hidden md:grid grid-cols-3 gap-5 mb-8">
            <button onClick={() => setActiveTab('OPEN')} className={clsx(
              "bg-white rounded-2xl p-5 border flex items-center gap-4 shadow-sm hover:shadow-md transition-all text-left group",
              activeTab === 'OPEN' ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-200"
            )}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Ticket className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Antrean Tiket</p>
                <p className="text-3xl font-black text-slate-800 mt-1 leading-none">{openTickets.length}</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">tiket menunggu penanganan</p>
              </div>
            </button>

            <button onClick={() => setActiveTab('IN_PROGRESS')} className={clsx(
              "bg-white rounded-2xl p-5 border flex items-center gap-4 shadow-sm hover:shadow-md transition-all text-left group",
              activeTab === 'IN_PROGRESS' ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"
            )}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Wrench className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tugas Saya</p>
                <p className="text-3xl font-black text-amber-500 mt-1 leading-none">{myInProgressTickets.length}</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">sedang dalam pengerjaan</p>
              </div>
            </button>

            <button onClick={() => setActiveTab('RESOLVED')} className={clsx(
              "bg-white rounded-2xl p-5 border flex items-center gap-4 shadow-sm hover:shadow-md transition-all text-left group",
              activeTab === 'RESOLVED' ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-200"
            )}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selesai</p>
                <p className="text-3xl font-black text-emerald-500 mt-1 leading-none">{myResolvedTickets.length}</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">tiket berhasil ditangani</p>
              </div>
            </button>
          </div>

          {/* ========================================================= */}
          {/* HIGH PRIORITY ALERTS */}
          {/* ========================================================= */}
          {highPriorityOpen.length > 0 && activeTab !== 'URGENT' && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl p-4 shadow-lg shadow-red-500/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm leading-tight">Ada {highPriorityOpen.length} Tiket Darurat!</h3>
                    <p className="text-[10px] text-red-100 mt-0.5">Berpotensi melewati batas SLA. Segera ditangani.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('URGENT')}
                  className="px-4 py-2 bg-white text-red-600 font-extrabold rounded-xl text-xs hover:bg-red-50 transition-all shadow-sm flex-shrink-0"
                >
                  Cek Sekarang
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TASK BOARD (List View) */}
          {/* ========================================================= */}
          <div className="bg-slate-50 md:bg-white md:rounded-3xl md:border border-slate-200 md:shadow-sm overflow-hidden flex flex-col min-h-[500px]">

            {/* Desktop Board Header */}
            <div className="hidden md:flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h2 className="font-extrabold text-slate-800 text-lg">
                  {activeTab === 'OPEN' && 'Antrean Tiket Masuk'}
                  {activeTab === 'URGENT' && 'Tiket Darurat (High Priority)'}
                  {activeTab === 'IN_PROGRESS' && 'Tugas Saya — Sedang Dikerjakan'}
                  {activeTab === 'RESOLVED' && 'Riwayat Penyelesaian'}
                </h2>
                <span className="ml-2 text-xs font-extrabold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{displayedTickets.length} tiket</span>
              </div>
              <Link href="/teknisi-area/helpdesk" className="text-xs font-extrabold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors">
                Lihat Semua Tiket →
              </Link>
            </div>

            {/* iOS/M-Banking Segmented Control Tabs */}
            <div className="p-1 mx-4 md:mx-5 mt-2 md:mt-5 bg-slate-200/50 rounded-xl flex">
              <button
                onClick={() => setActiveTab('OPEN')}
                className={clsx(
                  "flex-1 py-2 rounded-lg text-[11px] font-extrabold transition-all text-center relative",
                  activeTab === 'OPEN' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Antrean
                {openTickets.length > 0 && activeTab !== 'OPEN' && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-blue-500"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('IN_PROGRESS')}
                className={clsx(
                  "flex-1 py-2 rounded-lg text-[11px] font-extrabold transition-all text-center",
                  activeTab === 'IN_PROGRESS' ? "bg-white text-amber-500 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Tugas Saya
              </button>
              <button
                onClick={() => setActiveTab('RESOLVED')}
                className={clsx(
                  "flex-1 py-2 rounded-lg text-[11px] font-extrabold transition-all text-center",
                  activeTab === 'RESOLVED' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Riwayat
              </button>
            </div>

            {/* Board Content */}
            <div className="p-4 md:p-5 flex-1">
              {isLoading ? (
                <div className="h-full flex items-center justify-center min-h-[200px]">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : displayedTickets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center min-h-[250px] animate-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-slate-700 font-extrabold text-sm">Tidak ada tiket</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-[200px]">Pekerjaan di tab ini sudah beres semua.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {displayedTickets.map(ticket => (
                    <div key={ticket.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">

                      {/* Left priority accent line */}
                      <div className={clsx(
                        "absolute left-0 top-0 bottom-0 w-1.5",
                        ticket.priority === 'HIGH' ? "bg-red-500" :
                          ticket.priority === 'MEDIUM' ? "bg-amber-500" : "bg-emerald-500"
                      )} />

                      <div className="pl-2 flex gap-4 items-center">
                        {/* Info Section */}
                        <div className="flex-1 min-w-0">
                          {/* Meta Row */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                              {ticket.ticketNumber}
                            </span>
                            {ticket.priority === 'HIGH' && (
                              <span className="text-[9px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Urgent
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-slate-400 ml-auto">
                              {new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} &bull; {new Date(ticket.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-sm font-extrabold text-slate-800 leading-snug mb-1.5 group-hover:text-emerald-700 transition-colors">
                            {ticket.title}
                          </h3>

                          {/* Info */}
                          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                            <div className="flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[8px] font-black">
                                {ticket.reporter?.name?.charAt(0)}
                              </span>
                              <span className="truncate max-w-[120px]">{ticket.reporter?.name}</span>
                            </div>
                            <span className="text-slate-300">&bull;</span>
                            <span>{ticket.category}</span>
                          </div>
                        </div>

                        {/* Desktop Action Button - Right side */}
                        <div className="hidden md:block flex-shrink-0">
                          {activeTab === 'OPEN' || activeTab === 'URGENT' ? (
                            <Link href={`/teknisi-area/helpdesk/${ticket.id}`} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-[0.98] whitespace-nowrap">
                              <Wrench className="w-3.5 h-3.5" /> Ambil Tiket
                            </Link>
                          ) : activeTab === 'IN_PROGRESS' ? (
                            <Link href={`/teknisi-area/helpdesk/${ticket.id}`} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-[0.98] whitespace-nowrap">
                              <Play className="w-3.5 h-3.5" /> Update Progress
                            </Link>
                          ) : (
                            <Link href={`/teknisi-area/helpdesk/${ticket.id}`} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-[0.98] whitespace-nowrap">
                              Lihat Detail
                            </Link>
                          )}
                        </div>

                        {/* Mobile Action Button - same as before */}
                        <div className="md:hidden">
                          {activeTab === 'OPEN' || activeTab === 'URGENT' ? (
                            <Link href={`/teknisi-area/helpdesk/${ticket.id}`} className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          ) : activeTab === 'IN_PROGRESS' ? (
                            <Link href={`/teknisi-area/helpdesk/${ticket.id}`} className="w-8 h-8 bg-amber-500 text-white rounded-xl flex items-center justify-center">
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          ) : (
                            <Link href={`/teknisi-area/helpdesk/${ticket.id}`} className="w-8 h-8 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>{/* END LEFT COLUMN */}

        {/* ===================== RIGHT SIDEBAR (Desktop Only) ===================== */}
        <div className="hidden md:flex flex-col gap-5 w-[290px] flex-shrink-0">

          {/* --- Widget 1: Workload Progress --- */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Progress Kerjaan</h3>
            </div>
            <div className="space-y-4">
              {/* Antrean */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500">Antrean (OPEN)</span>
                  <span className="text-xs font-extrabold text-blue-600">{openTickets.length} tiket</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: tickets.length > 0 ? `${Math.min((openTickets.length / tickets.length) * 100, 100)}%` : '0%' }}
                  />
                </div>
              </div>
              {/* In Progress */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500">Sedang Dikerjakan</span>
                  <span className="text-xs font-extrabold text-amber-600">{myInProgressTickets.length} tiket</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: tickets.length > 0 ? `${Math.min((myInProgressTickets.length / tickets.length) * 100, 100)}%` : '0%' }}
                  />
                </div>
              </div>
              {/* Resolved */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500">Selesai Ditangani</span>
                  <span className="text-xs font-extrabold text-emerald-600">{myResolvedTickets.length} tiket</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: tickets.length > 0 ? `${Math.min((myResolvedTickets.length / tickets.length) * 100, 100)}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- Widget 2: SLA Status / Priority Breakdown --- */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Status Prioritas (Antrean)</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-red-700">Prioritas Tinggi</span>
                </div>
                <span className="text-sm font-black text-red-600">{openTickets.filter(t => t.priority === 'HIGH').length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-amber-700">Prioritas Sedang</span>
                </div>
                <span className="text-sm font-black text-amber-600">{openTickets.filter(t => t.priority === 'MEDIUM').length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-emerald-700">Prioritas Rendah</span>
                </div>
                <span className="text-sm font-black text-emerald-600">{openTickets.filter(t => t.priority === 'LOW').length}</span>
              </div>
            </div>
          </div>

          {/* --- Widget 3: Quick Actions --- */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">Aksi Cepat</h3>
            <div className="space-y-2">
              <button onClick={() => setIsNotifOpen(true)} className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-all group border border-slate-100 hover:border-emerald-200">
                <Bell className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                <span className="text-xs font-bold">Buka Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="ml-auto text-[10px] font-extrabold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </button>
              <Link href="/teknisi-area/helpdesk" className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-all group border border-slate-100 hover:border-emerald-200">
                <Ticket className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                <span className="text-xs font-bold">Lihat Semua Tiket</span>
                <ChevronRight className="w-4 h-4 ml-auto text-slate-300" />
              </Link>
              <button onClick={() => setActiveTab('URGENT')} className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-700 text-slate-700 transition-all group border border-slate-100 hover:border-red-200">
                <AlertTriangle className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                <span className="text-xs font-bold">Tiket Prioritas Tinggi</span>
                {highPriorityOpen.length > 0 && (
                  <span className="ml-auto text-[10px] font-extrabold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{highPriorityOpen.length}</span>
                )}
              </button>
              <button onClick={() => setActiveTab('IN_PROGRESS')} className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-700 transition-all group border border-slate-100 hover:border-amber-200">
                <Wrench className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                <span className="text-xs font-bold">Tugas Saya</span>
                {myInProgressTickets.length > 0 && (
                  <span className="ml-auto text-[10px] font-extrabold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">{myInProgressTickets.length}</span>
                )}
              </button>
            </div>
          </div>

        </div>{/* END RIGHT SIDEBAR */}

      </div>{/* END 2-COLUMN WRAPPER */}

      {/* ========================================================= */}
      {/* NOTIFICATION PANEL - Mobile: fullscreen | Desktop: floating card */}
      {/* ========================================================= */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-200">
          {/* Backdrop (click to close) */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none" onClick={() => setIsNotifOpen(false)} />

          {/* Panel — slides from right on mobile, floats on top right on desktop */}
          <div className="relative ml-auto md:absolute md:top-20 md:right-6 w-full md:w-[400px] h-full md:h-auto md:max-h-[calc(100vh-100px)] bg-slate-50 md:bg-white flex flex-col md:rounded-3xl shadow-2xl md:border md:border-slate-100 animate-in slide-in-from-right-full md:slide-in-from-top-4 md:fade-in duration-300 overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 md:py-4 bg-white md:bg-slate-50/50 shadow-sm md:shadow-none z-10 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-2 md:mb-3">
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-full active:bg-slate-100 text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h3 className="font-extrabold text-slate-800 text-lg md:text-base leading-none">Pusat Informasi</h3>
                </div>
                {notifTab === 'PERSONAL' && unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100"
                  >
                    Baca Semua
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setNotifTab('PERSONAL')}
                  className={clsx(
                    "flex-1 py-2 text-[11px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5",
                    notifTab === 'PERSONAL' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Bell className="w-3.5 h-3.5" />
                  Pesan Personal
                  {unreadCount > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1">{unreadCount}</span>}
                </button>
                <button
                  onClick={() => setNotifTab('GLOBAL')}
                  className={clsx(
                    "flex-1 py-2 text-[11px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5",
                    notifTab === 'GLOBAL' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Aktivitas Tim
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {notifTab === 'PERSONAL' ? (
                <>
                  {unreadCount > 0 && (
                    <div className="flex justify-between items-center mb-4 px-1">
                      <span className="text-xs font-bold text-slate-500">{unreadCount} Pesan Baru</span>
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                      >
                        Tandai Semua Dibaca
                      </button>
                    </div>
                  )}

                  {notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                      <Bell className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="font-bold text-slate-600 text-sm">Belum ada notifikasi</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                        className={clsx(
                          "p-4 rounded-2xl border transition-all relative overflow-hidden mb-3",
                          notif.read
                            ? "bg-white border-slate-200"
                            : "bg-emerald-50/50 border-emerald-200 shadow-sm cursor-pointer hover:bg-emerald-50"
                        )}
                      >
                        {!notif.read && (
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div>
                        )}
                        <div className="flex gap-3 relative z-10">
                          <div className={clsx(
                            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            notif.read ? "bg-slate-100 text-slate-400" : "bg-emerald-100 text-emerald-600"
                          )}>
                            <Info className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className={clsx("text-[13px]", notif.read ? "font-semibold text-slate-700" : "font-extrabold text-slate-800")}>
                              {notif.title}
                            </h4>
                            <p className={clsx("text-[11px] leading-relaxed mt-1", notif.read ? "text-slate-500" : "text-slate-600 font-medium")}>
                              {notif.message}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 mt-2">
                              {new Date(notif.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              ) : (
                /* TAB: GLOBAL ACTIVITY */
                latestActivity.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                    <Activity className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="font-bold text-slate-600 text-sm">Belum ada aktivitas tim</p>
                  </div>
                ) : (
                  latestActivity.map(ev => (
                    <Link key={ev.id} href={`/teknisi-area/helpdesk/${ev.ticketId}`} className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-sm transition-all group mb-3">
                      <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                        ev.icon === 'new' ? "bg-blue-50 text-blue-600" :
                          ev.icon === 'picked' ? "bg-amber-50 text-amber-600" :
                            "bg-emerald-50 text-emerald-600"
                      )}>
                        {ev.icon === 'new' && <Ticket className="w-5 h-5" />}
                        {ev.icon === 'picked' && <Wrench className="w-5 h-5" />}
                        {ev.icon === 'done' && <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-500 leading-tight">
                          {ev.label} <span className="font-extrabold text-slate-800">{ev.actor}</span>
                        </p>
                        <p className="text-[13px] font-bold text-slate-800 truncate mt-1 group-hover:text-emerald-700 transition-colors">{ev.ticketTitle}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{ev.ticketNumber}</span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {new Date(ev.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(ev.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )
              )}
            </div>{/* END notification content list */}
          </div>
        </div>
      )}
    </div>
  );
}
