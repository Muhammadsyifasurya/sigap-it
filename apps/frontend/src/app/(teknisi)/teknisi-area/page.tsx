"use client";

import React, { useState, useEffect } from 'react';
import { 
  Ticket, Clock, CheckCircle2, AlertTriangle, ChevronRight, 
  Wrench, Activity, AlertCircle, Play, Layers
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useHelpdesk } from '@/hooks/useHelpdesk';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function TeknisiDashboard() {
  const { user } = useAuthStore();
  const { tickets, fetchTickets, isLoading } = useHelpdesk();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'URGENT' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('OPEN');

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
      <div className="mb-4 md:mb-8 pt-4 md:pt-0">
        <h1 className="text-xl md:text-2xl font-black text-white md:text-slate-800 tracking-tight">Halo, {user?.name?.split(' ')[0] || 'Teknisi'}</h1>
        <p className="text-xs md:text-sm font-medium text-emerald-100 md:text-slate-500 mt-1">Siap menyelesaikan masalah IT hari ini?</p>
      </div>

      {/* ========================================================= */}
      {/* M-BANKING STYLE HERO CARD (MOBILE & DESKTOP) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] mb-6 relative overflow-hidden">
        
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
      {/* HIGH PRIORITY ALERTS */}
      {/* ========================================================= */}
      {highPriorityOpen.length > 0 && activeTab !== 'URGENT' && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl p-4 shadow-lg shadow-red-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight">Ada {highPriorityOpen.length} Darurat!</h3>
                <p className="text-[10px] text-red-100 mt-0.5">Berpotensi lewati SLA</p>
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
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
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
                  
                  <div className="pl-2">
                    {/* Meta Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                          {ticket.ticketNumber}
                        </span>
                        {ticket.priority === 'HIGH' && (
                          <span className="text-[9px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Urgent
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(ticket.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-extrabold text-slate-800 leading-tight mb-2 pr-4">
                      {ticket.title}
                    </h3>

                    {/* Info */}
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px]">
                          {ticket.reporter?.name?.charAt(0)}
                        </span>
                        <span className="truncate max-w-[100px]">{ticket.reporter?.name}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span>{ticket.category}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {activeTab === 'OPEN' || activeTab === 'URGENT' ? (
                        <Link href={`/teknisi-area/helpdesk/${ticket.id}`} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]">
                          <Wrench className="w-3.5 h-3.5" /> Ambil Tiket
                        </Link>
                      ) : activeTab === 'IN_PROGRESS' ? (
                        <Link href={`/teknisi-area/helpdesk/${ticket.id}`} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]">
                          <Play className="w-3.5 h-3.5" /> Update
                        </Link>
                      ) : (
                        <Link href={`/teknisi-area/helpdesk/${ticket.id}`} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]">
                          Detail
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
    </div>
  );
}
