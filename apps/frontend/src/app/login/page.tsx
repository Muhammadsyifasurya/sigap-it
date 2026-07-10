"use client";

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 relative overflow-hidden">
      
      {/* Background decoration circles (BRImo/Wondr style) */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/5 blur-xl" />
      <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-cyan-400/10 blur-2xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl" />

      {/* Top branding section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 relative z-10">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-900/40 mb-6">
          <svg viewBox="0 0 40 40" className="w-10 h-10">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
            <rect x="4" y="8" width="32" height="6" rx="3" fill="url(#logoGrad)" opacity="0.9" />
            <rect x="4" y="17" width="24" height="6" rx="3" fill="url(#logoGrad)" opacity="0.7" />
            <rect x="4" y="26" width="16" height="6" rx="3" fill="url(#logoGrad)" opacity="0.5" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">SIGAP IT</h1>
        <p className="text-emerald-100 text-sm font-medium mt-1">Enterprise Management Portal</p>
      </div>

      {/* Bottom card (sheet-style like Livin/BRImo) */}
      <div className="bg-white rounded-t-[2rem] px-6 pt-8 pb-10 relative z-10 shadow-[0_-20px_60px_rgba(0,0,0,0.15)]">
        
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl font-extrabold text-slate-800 mb-1">Masuk ke Akun</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">Gunakan email korporat untuk login.</p>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-100">
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@bumn.co.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold text-base rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/30 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Masuk <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs font-medium text-slate-400">
            © {new Date().getFullYear()} PT LPP Agro Nusantara • v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
