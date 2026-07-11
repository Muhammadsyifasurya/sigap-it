"use client";

import React, { useEffect, useState } from 'react';
import { useHelpdesk } from '../../../hooks/useHelpdesk';
import {
  Plus, Search, X, AlertTriangle, Clock, CheckCircle2,
  ChevronRight, LifeBuoy, Zap, ArrowDownCircle, ChevronLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../../store/authStore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '../../../data/apiClient';

// =========================================
// STATUS & PRIORITY HELPERS
// =========================================
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  OPEN: { label: 'Open', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
  IN_PROGRESS: { label: 'Diproses', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-400' },
  RESOLVED: { label: 'Selesai', color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' },
  CLOSED: { label: 'Ditutup', color: 'text-slate-500', bg: 'bg-slate-100', dot: 'bg-slate-400' },
};

const PRIORITY_CONFIG: Record<string, { color: string; icon: any }> = {
  HIGH: { color: 'text-red-500', icon: AlertTriangle },
  MEDIUM: { color: 'text-amber-500', icon: Clock },
  LOW: { color: 'text-green-500', icon: CheckCircle2 },
};

const TICKET_TYPE_ICON: Record<string, { icon: any; gradient: string }> = {
  INCIDENT: { icon: Zap, gradient: 'from-red-500 to-orange-500' },
  SERVICE_REQUEST: { icon: LifeBuoy, gradient: 'from-emerald-500 to-teal-500' },
};

// =========================================
// SUB-COMPONENTS
// =========================================
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold", cfg.bg, cfg.color)}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function TicketCard({ ticket, onClick }: { ticket: any; onClick: () => void }) {
  const typeConfig = TICKET_TYPE_ICON[ticket.ticketType] || TICKET_TYPE_ICON.INCIDENT;
  const TypeIcon = typeConfig.icon;
  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 text-left hover:shadow-md active:scale-[0.99] transition-all duration-150 border border-slate-100/80"
    >
      <div className="flex gap-3.5">
        {/* Left: Type Icon */}
        <div className={clsx(
          "w-11 h-11 rounded-[14px] bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm",
          typeConfig.gradient
        )}>
          <TypeIcon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 truncate leading-snug">{ticket.title}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {ticket.ticketNumber} • {ticket.reporter?.name}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={ticket.status} />
            <span className="text-[10px] text-slate-400 font-medium">
              {ticket.priority}
            </span>
          </div>
        </div>

        {/* Right: Chevron */}
        <div className="flex items-center">
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </button>
  );
}

// =========================================
// MAIN PAGE
// =========================================
export default function HelpdeskPage() {
  const { user } = useAuthStore();
  const { tickets, total, isLoading, error, fetchTickets, createTicket, assignTicket, resolveTicket, fetchTicketById, addComment } = useHelpdesk();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const limit = 20;

  const [activeTab, setActiveTab] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const [newTicket, setNewTicket] = useState({
    ticketNumber: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
    title: '',
    description: '',
    ticketType: 'INCIDENT' as 'INCIDENT' | 'SERVICE_REQUEST',
    priority: 'LOW' as 'HIGH' | 'MEDIUM' | 'LOW',
    category: 'Hardware',
    file: null as File | null
  });

  const [resolveForm, setResolveForm] = useState({
    resolutionNotes: '',
    rootCause: '',
    downtimeMinutes: 0
  });

  const [commentMessage, setCommentMessage] = useState('');
  
  const [itStaffs, setItStaffs] = useState<any[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<number | ''>('');

  useEffect(() => {
    if (isDetailOpen && (user?.role?.id === 1 || user?.role?.id === 2 || user?.role?.id === 4)) {
      apiClient.get('/users?roleId=2,4').then(res => {
        setItStaffs(res.data.data);
      }).catch(console.error);
    }
  }, [isDetailOpen, user]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentMessage.trim()) return;
    const success = await addComment(selectedTicket.id, commentMessage);
    if (success) {
      setCommentMessage('');
      handleOpenDetail(selectedTicket.id); // Refresh ticket data
    }
  };

  useEffect(() => {
    fetchTickets(page, limit);
  }, [page, fetchTickets]);

  // Auto-open create modal based on ?action= query param
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new-incident') {
      setNewTicket(prev => ({ ...prev, ticketType: 'INCIDENT' }));
      setIsCreateOpen(true);
    } else if (action === 'new-request') {
      setNewTicket(prev => ({ ...prev, ticketType: 'SERVICE_REQUEST' }));
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  // Filter tickets by tab
  const filteredTickets = activeTab === 'ALL'
    ? tickets
    : tickets.filter(t => t.status === activeTab);

  const handleOpenDetail = async (id: number) => {
    const ticket = await fetchTicketById(id);
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createTicket(newTicket);
    if (success) {
      setIsCreateOpen(false);
      setNewTicket({
        ...newTicket,
        ticketNumber: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
        title: '',
        description: '',
        category: 'Hardware',
        file: null
      });
    }
  };

  const handleAssign = async (assigneeId?: number) => {
    if (!selectedTicket) return;
    const success = await assignTicket(selectedTicket.id, assigneeId);
    if (success) {
      handleOpenDetail(selectedTicket.id);
      setSelectedAssignee('');
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    const success = await resolveTicket(selectedTicket.id, {
      resolutionNotes: resolveForm.resolutionNotes,
      rootCause: resolveForm.rootCause || undefined,
      downtimeMinutes: resolveForm.downtimeMinutes ? Number(resolveForm.downtimeMinutes) : undefined
    });
    if (success) handleOpenDetail(selectedTicket.id);
  };

  const tabs = [
    { key: 'ALL', label: 'Semua' },
    { key: 'OPEN', label: 'Open' },
    { key: 'IN_PROGRESS', label: 'Proses' },
    { key: 'RESOLVED', label: 'Selesai' },
  ];

  return (
    <div className="space-y-4 relative min-h-[60vh]">

      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3 pt-2 md:pt-0">
        <Link href="/dashboard" className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm active:scale-90 transition-transform">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">IT Helpdesk</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Kelola tiket insiden dan layanan IT</p>
        </div>
      </div>

      {/* ===== SEARCH BAR (BRImo style) ===== */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari tiket..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-100 text-[13px] font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] placeholder:text-slate-400"
        />
      </div>

      {/* ===== TAB FILTER (Pill style like Wondr/BRImo) ===== */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
              activeTab === tab.key
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== TICKET LIST (Transaction-history style) ===== */}
      <div className="space-y-2.5">
        {isLoading ? (
          // Skeleton loading (Shimmer style)
          <div className="space-y-2.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100/80">
                <div className="flex gap-3.5">
                  <div className="w-11 h-11 rounded-[14px] shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-3.5 w-3/4 shimmer rounded-md" />
                    <div className="h-3 w-1/2 shimmer rounded-md" />
                    <div className="h-5 w-16 shimmer rounded-full mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-sm font-bold text-slate-700">Gagal Memuat</p>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <LifeBuoy className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-700">Belum Ada Tiket</p>
            <p className="text-xs text-slate-400 mt-1">Kamu belum memiliki riwayat tiket.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => handleOpenDetail(ticket.id)}
            />
          ))
        )}
      </div>



      {/* ===== BOTTOM SHEET: DETAIL TICKET ===== */}
      {isDetailOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setIsDetailOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          <div
            className="relative bg-white rounded-t-[1.75rem] md:rounded-2xl w-full md:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl animate-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:hidden flex justify-center pt-3 pb-0.5">
              <div className="w-9 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Detail Header (receipt style) */}
            <div className="p-5 pb-4 text-center border-b border-dashed border-slate-200">
              {(() => {
                const typeConfig = TICKET_TYPE_ICON[selectedTicket.ticketType] || TICKET_TYPE_ICON.INCIDENT;
                const TypeIcon = typeConfig.icon;
                return (
                  <div className={clsx("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-3 shadow-lg", typeConfig.gradient)}>
                    <TypeIcon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                );
              })()}
              <h2 className="text-base font-extrabold text-slate-800 leading-snug">{selectedTicket.title}</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">{selectedTicket.ticketNumber}</p>
              <div className="mt-3">
                <StatusBadge status={selectedTicket.status} />
              </div>

              {/* Close button */}
              <button onClick={() => setIsDetailOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Description */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-2">Deskripsi</p>
                <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Info Grid (Receipt style) */}
              <div className="space-y-0 divide-y divide-slate-100">
                {[
                  { label: 'Pelapor', value: selectedTicket.reporter?.name },
                  { label: 'Departemen', value: selectedTicket.reporter?.department?.name },
                  { label: 'Kategori', value: selectedTicket.category || 'Umum' },
                  { label: 'Jenis', value: selectedTicket.ticketType === 'INCIDENT' ? 'Insiden' : 'Service Request' },
                  { label: 'Prioritas', value: selectedTicket.priority },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-3">
                    <span className="text-xs text-slate-400 font-medium">{row.label}</span>
                    <span className="text-xs text-slate-800 font-bold">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Attachment */}
              {selectedTicket.attachmentUrl && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-2">Lampiran Bukti (Screenshot)</p>
                  <a href={`http://localhost:4000${selectedTicket.attachmentUrl}`} target="_blank" rel="noreferrer" className="block w-full max-w-[200px] h-32 rounded-lg overflow-hidden border border-slate-200 shadow-sm relative group cursor-pointer hover:border-emerald-500 transition-colors">
                    <img src={`http://localhost:4000${selectedTicket.attachmentUrl}`} alt="Attachment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Lihat Penuh</span>
                    </div>
                  </a>
                </div>
              )}

              {/* Komentar / Thread */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-3">Diskusi / Pembaruan</p>

                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    selectedTicket.comments.map((c: any) => {
                      const isMe = c.userId === user?.id;
                      return (
                        <div key={c.id} className={clsx("flex flex-col", isMe ? "items-end" : "items-start")}>
                          <div className="flex items-end gap-2 w-full">
                            {!isMe && <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-emerald-700 border border-emerald-200">{c.user?.name.charAt(0).toUpperCase()}</div>}
                            <div className={clsx(
                              "px-3 py-2.5 rounded-2xl max-w-[85%]",
                              isMe ? "ml-auto bg-emerald-600 text-white rounded-br-sm shadow-sm" : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
                            )}>
                              {!isMe && <p className="text-[10px] font-bold text-emerald-700 mb-0.5">{c.user?.name}</p>}
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">{c.message}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-medium text-slate-400 mt-1">{new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4 font-medium italic">Belum ada diskusi atau pembaruan.</p>
                  )}
                </div>

                {/* Form Komentar */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input type="text" value={commentMessage} onChange={e => setCommentMessage(e.target.value)} placeholder="Ketik pesan..." className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                  <button type="submit" disabled={isLoading || !commentMessage.trim()} className="bg-slate-800 text-white px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-slate-900 transition-colors disabled:opacity-50 active:scale-95">Kirim</button>
                </form>
              </div>

              {/* Penanganan */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-2">Penanganan</p>
                {selectedTicket.assignee ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {selectedTicket.assignee.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">{selectedTicket.assignee.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Sedang menangani</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-amber-600 font-medium">Belum ada yang menangani tiket ini.</p>
                    {(user?.role?.id === 1 || user?.role?.id === 2 || user?.role?.id === 4) && (
                      <div className="flex flex-col gap-2 mt-2">
                        <button onClick={() => handleAssign()} disabled={isLoading} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all">
                          Ambil Tiket Ini (Assign ke Saya)
                        </button>
                        
                        <div className="flex gap-2 items-center my-1">
                          <div className="h-px bg-slate-200 flex-1"></div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Atau</span>
                          <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        <div className="flex gap-2">
                          <select 
                            value={selectedAssignee}
                            onChange={(e) => setSelectedAssignee(Number(e.target.value))}
                            className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-slate-200 bg-white outline-none focus:border-emerald-500"
                          >
                            <option value="">Pilih Tim IT...</option>
                            {itStaffs.map(staff => (
                              <option key={staff.id} value={staff.id}>{staff.name}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => selectedAssignee && handleAssign(selectedAssignee as number)}
                            disabled={isLoading || !selectedAssignee}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Resolve Form */}
              {selectedTicket.status === 'IN_PROGRESS' && (user?.role?.id === 1 || user?.role?.id === 2 || user?.role?.id === 4) && (
                <form onSubmit={handleResolve} className="bg-emerald-50/70 rounded-xl p-4 space-y-3 border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.15em]">Selesaikan Tiket</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Downtime (Menit)</label>
                      <input type="number" required={selectedTicket.ticketType === 'INCIDENT'} value={resolveForm.downtimeMinutes} onChange={e => setResolveForm({ ...resolveForm, downtimeMinutes: e.target.value as any })}
                        className="mt-1 w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Root Cause</label>
                      <input type="text" value={resolveForm.rootCause} onChange={e => setResolveForm({ ...resolveForm, rootCause: e.target.value })}
                        className="mt-1 w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Penyebab" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Catatan Penyelesaian</label>
                    <textarea required rows={2} value={resolveForm.resolutionNotes} onChange={e => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
                      className="mt-1 w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 resize-none" placeholder="Apa yang sudah diperbaiki..." />
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all">
                    Tandai Selesai ✓
                  </button>
                </form>
              )}

              {/* Resolution Info */}
              {(selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED') && (
                <div className="bg-green-50/70 rounded-xl p-4 space-y-2 border border-green-100">
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-[0.15em]">✓ Tiket Diselesaikan</p>
                  <div className="space-y-0 divide-y divide-green-100">
                    {selectedTicket.resolutionNotes && (
                      <div className="py-2">
                        <p className="text-[10px] text-slate-400 font-medium">Catatan</p>
                        <p className="text-xs text-slate-700 font-semibold mt-0.5">{selectedTicket.resolutionNotes}</p>
                      </div>
                    )}
                    {selectedTicket.rootCause && (
                      <div className="py-2">
                        <p className="text-[10px] text-slate-400 font-medium">Penyebab</p>
                        <p className="text-xs text-slate-700 font-semibold mt-0.5">{selectedTicket.rootCause}</p>
                      </div>
                    )}
                    {selectedTicket.downtimeMinutes > 0 && (
                      <div className="py-2">
                        <p className="text-[10px] text-slate-400 font-medium">Downtime</p>
                        <p className="text-xs text-slate-700 font-semibold mt-0.5">{selectedTicket.downtimeMinutes} Menit</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
