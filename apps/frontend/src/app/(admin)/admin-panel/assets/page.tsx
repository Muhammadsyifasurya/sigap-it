"use client";

import React, { useEffect, useState } from 'react';
import {
  Laptop, Monitor, Smartphone, Printer, HardDrive, Cpu,
  Plus, ChevronLeft, ChevronRight, X, Package,
  CheckCircle2, Clock, Wrench, AlertTriangle,
  Tag, Hash, Calendar, User, Building2, Shield
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { useAssets } from '@/hooks/useAssets';
import { ItAsset, CreateAssetDto } from '@/domain/models/Asset';
import Link from 'next/link';

// =========================================
// HELPERS
// =========================================
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  AVAILABLE:   { label: 'Tersedia',    color: 'text-emerald-700', bg: 'bg-emerald-50',  dot: 'bg-emerald-500' },
  IN_USE:      { label: 'Digunakan',   color: 'text-blue-700',    bg: 'bg-blue-50',     dot: 'bg-blue-500'    },
  MAINTENANCE: { label: 'Perbaikan',   color: 'text-amber-700',   bg: 'bg-amber-50',    dot: 'bg-amber-400'   },
  RETIRED:     { label: 'Pensiun',     color: 'text-slate-500',   bg: 'bg-slate-100',   dot: 'bg-slate-400'   },
};

const ASSET_TYPE_ICON: Record<string, { icon: any; color: string; bg: string }> = {
  Laptop:     { icon: Laptop,    color: 'text-blue-600',    bg: 'bg-blue-50'    },
  PC:         { icon: Monitor,   color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
  Smartphone: { icon: Smartphone,color: 'text-rose-600',    bg: 'bg-rose-50'    },
  Printer:    { icon: Printer,   color: 'text-amber-600',   bg: 'bg-amber-50'   },
  Storage:    { icon: HardDrive, color: 'text-teal-600',    bg: 'bg-teal-50'    },
  Server:     { icon: Cpu,       color: 'text-purple-600',  bg: 'bg-purple-50'  },
};

function getAssetTypeConfig(type: string | null) {
  return ASSET_TYPE_ICON[type || ''] || { icon: Package, color: 'text-slate-500', bg: 'bg-slate-100' };
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.AVAILABLE;
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold', cfg.bg, cfg.color)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// =========================================
// ASSET CARD — Shared
// =========================================
function AssetCard({ asset, onClick }: { asset: ItAsset; onClick?: () => void }) {
  const typeConfig = getAssetTypeConfig(asset.type);
  const TypeIcon = typeConfig.icon;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 text-left hover:shadow-md active:scale-[0.99] transition-all duration-150 border border-slate-100/80"
    >
      <div className="flex gap-3.5 items-center">
        <div className={clsx('w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0', typeConfig.bg)}>
          <TypeIcon className={clsx('w-5 h-5', typeConfig.color)} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-slate-800 truncate leading-snug">
            {asset.brand} {asset.model}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {asset.assetTag} • {asset.type || 'Perangkat IT'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={asset.status} />
            {asset.hardwareTier && (
              <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                {asset.hardwareTier}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
      </div>
    </button>
  );
}

// =========================================
// MY ASSET CARD — Karyawan style (Hero card)
// =========================================
function MyAssetHeroCard({ asset }: { asset: ItAsset }) {
  const typeConfig = getAssetTypeConfig(asset.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-5 text-white relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between mb-5">
        <div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Aset Saya</p>
          <p className="text-white text-lg font-extrabold leading-tight">{asset.brand} {asset.model}</p>
          <p className="text-slate-400 text-xs mt-0.5">{asset.type || 'Perangkat IT'}</p>
        </div>
        <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center', typeConfig.bg)}>
          <TypeIcon className={clsx('w-6 h-6', typeConfig.color)} strokeWidth={2} />
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-2xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Asset Tag</p>
          <p className="text-white text-xs font-extrabold">{asset.assetTag}</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Serial Number</p>
          <p className="text-white text-xs font-extrabold truncate">{asset.serialNumber}</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Tier</p>
          <p className="text-white text-xs font-extrabold">{asset.hardwareTier || '-'}</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Status</p>
          <p className="text-emerald-400 text-xs font-extrabold">{asset.status === 'IN_USE' ? '● Digunakan' : asset.status}</p>
        </div>
      </div>
    </div>
  );
}

// =========================================
// ASSET DETAIL MODAL (Bottom Sheet)
// =========================================
function AssetDetailSheet({ asset, onClose }: { asset: ItAsset; onClose: () => void }) {
  const typeConfig = getAssetTypeConfig(asset.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center', typeConfig.bg)}>
                <TypeIcon className={clsx('w-6 h-6', typeConfig.color)} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">{asset.brand} {asset.model}</h2>
                <p className="text-xs text-slate-400 font-semibold">{asset.type || 'Perangkat IT'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <StatusBadge status={asset.status} />

          <div className="mt-5 space-y-3">
            {[
              { icon: Tag,       label: 'Asset Tag',      value: asset.assetTag },
              { icon: Hash,      label: 'Serial Number',  value: asset.serialNumber },
              { icon: Shield,    label: 'Hardware Tier',  value: asset.hardwareTier || '-' },
              { icon: Calendar,  label: 'Tanggal Beli',   value: asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
              { icon: User,      label: 'Pemegang',       value: asset.currentUser?.name || 'Tidak ada' },
              { icon: Building2, label: 'Departemen',     value: asset.currentUser?.department?.name || '-' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2.5 border-b border-slate-50">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================
// CREATE ASSET FORM MODAL
// =========================================
function CreateAssetModal({ onClose, onSubmit, isLoading }: {
  onClose: () => void;
  onSubmit: (data: CreateAssetDto) => Promise<void>;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<CreateAssetDto>({
    assetTag: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
    serialNumber: '',
    brand: '',
    model: '',
    type: 'Laptop',
    hardwareTier: 'Tier Admin',
    purchaseDate: '',
  });

  const handleChange = (k: keyof CreateAssetDto, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all bg-white";
  const labelCls = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">Daftarkan Aset Baru</h2>
              <p className="text-xs text-slate-400 font-medium">Isi data perangkat IT dengan benar</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Asset Tag</label>
                <input className={inputCls} value={form.assetTag} onChange={e => handleChange('assetTag', e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Tipe Aset</label>
                <select className={inputCls} value={form.type} onChange={e => handleChange('type', e.target.value)}>
                  {['Laptop', 'PC', 'Smartphone', 'Printer', 'Storage', 'Server', 'Monitor'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Serial Number</label>
              <input className={inputCls} placeholder="SN-XXXXXXXXX" value={form.serialNumber} onChange={e => handleChange('serialNumber', e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Merk</label>
                <input className={inputCls} placeholder="Lenovo, Apple..." value={form.brand} onChange={e => handleChange('brand', e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Model</label>
                <input className={inputCls} placeholder="ThinkPad X1..." value={form.model} onChange={e => handleChange('model', e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Hardware Tier</label>
                <select className={inputCls} value={form.hardwareTier} onChange={e => handleChange('hardwareTier', e.target.value)}>
                  {['Tier Admin', 'Tier Developer', 'Tier Executive'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Tanggal Beli</label>
                <input className={inputCls} type="date" value={form.purchaseDate} onChange={e => handleChange('purchaseDate', e.target.value)} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3.5 rounded-2xl disabled:opacity-60 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 mt-2"
            >
              {isLoading ? 'Menyimpan...' : 'Daftarkan Aset'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// =========================================
// MAIN PAGE
// =========================================
export default function AssetsPage() {
  const { user } = useAuthStore();
  const { assets, total, isLoading, error, fetchAssets, createAsset } = useAssets();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedAsset, setSelectedAsset] = useState<ItAsset | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isKaryawan = user?.role?.id === 3;

  useEffect(() => {
    fetchAssets(1, 50);
  }, [fetchAssets]);

  // Karyawan: filter aset yang dipinjamkan ke dia
  const myAssets = isKaryawan
    ? assets.filter(a => a.currentUserId === user?.id)
    : assets;

  // Admin: filter berdasarkan tab
  const FILTER_TABS = [
    { key: 'ALL',         label: 'Semua' },
    { key: 'AVAILABLE',   label: 'Tersedia' },
    { key: 'IN_USE',      label: 'Digunakan' },
    { key: 'MAINTENANCE', label: 'Perbaikan' },
  ];

  const filteredAssets = activeFilter === 'ALL'
    ? myAssets
    : myAssets.filter(a => a.status === activeFilter);

  // Admin summary stats
  const stats = {
    total: assets.length,
    inUse: assets.filter(a => a.status === 'IN_USE').length,
    available: assets.filter(a => a.status === 'AVAILABLE').length,
    maintenance: assets.filter(a => a.status === 'MAINTENANCE').length,
  };

  const handleCreateSubmit = async (data: CreateAssetDto) => {
    const success = await createAsset(data);
    if (success) setIsCreateOpen(false);
  };

  return (
    <div className="space-y-5 relative min-h-[60vh]">

      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3 pt-2 md:pt-0">
        <Link href="/dashboard" className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm active:scale-90 transition-transform">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Aset IT</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {isKaryawan ? 'Perangkat IT yang dipinjamkan ke Anda' : 'Inventaris & manajemen perangkat IT'}
          </p>
        </div>
      </div>

      {/* ===== KARYAWAN VIEW ===== */}
      {isKaryawan && (
        <div className="space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="w-8 h-8 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-400 font-semibold">Memuat data aset...</p>
            </div>
          ) : myAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-600">Belum ada aset terdaftar</p>
                <p className="text-xs text-slate-400 mt-1">Hubungi IT Support untuk pendaftaran aset.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Hero card for first asset */}
              <MyAssetHeroCard asset={myAssets[0]} />

              {/* More assets if any */}
              {myAssets.length > 1 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Aset Lainnya</p>
                  <div className="space-y-3">
                    {myAssets.slice(1).map(asset => (
                      <AssetCard key={asset.id} asset={asset} onClick={() => setSelectedAsset(asset)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Info card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">Jaga Perangkat Anda</p>
                  <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">Laporkan segera ke IT Support jika ada kerusakan atau kehilangan aset perusahaan.</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== ADMIN VIEW ===== */}
      {!isKaryawan && (
        <div className="space-y-5">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {[
              { label: 'Total',      value: stats.total,       icon: Package,    color: 'text-slate-600',   bg: 'bg-slate-100'   },
              { label: 'Digunakan',  value: stats.inUse,       icon: CheckCircle2,color: 'text-blue-600',   bg: 'bg-blue-50'     },
              { label: 'Tersedia',   value: stats.available,   icon: CheckCircle2,color: 'text-emerald-600',bg: 'bg-emerald-50'  },
              { label: 'Perbaikan',  value: stats.maintenance, icon: Wrench,     color: 'text-amber-600',   bg: 'bg-amber-50'    },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-3 text-center shadow-sm">
                <p className={clsx('text-xl font-extrabold', stat.color)}>{stat.value}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={clsx(
                  'px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border whitespace-nowrap flex-shrink-0',
                  activeFilter === tab.key
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Asset List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="w-8 h-8 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-400 font-semibold">Memuat inventaris aset...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-600">Tidak ada aset ditemukan</p>
                <p className="text-xs text-slate-400 mt-1">Coba ganti filter atau tambah aset baru.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredAssets.map(asset => (
                <AssetCard key={asset.id} asset={asset} onClick={() => setSelectedAsset(asset)} />
              ))}
            </div>
          )}

          {/* FAB */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-transform z-40"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* ===== MODALS ===== */}
      {selectedAsset && (
        <AssetDetailSheet asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
      )}
      {isCreateOpen && (
        <CreateAssetModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
