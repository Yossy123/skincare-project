'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isHydrated = useAuthHydrated();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      name: 'Doctor Overview',
      href: '/doctor/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Jadwal & Konsultasi',
      href: '/doctor/appointments',
      icon: CalendarDays,
    },
    {
      name: 'Pasien & Rekam Medis',
      href: '/doctor/patients',
      icon: Users,
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
          <span>Memuat Portal Dokter...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif text-white">Autentikasi Dokter Dibutuhkan</h2>
          <p className="text-xs text-zinc-400">
            Anda harus masuk menggunakan akun Dokter / Dermatologist resmi untuk mengakses portal klinis ini.
          </p>
          <div className="pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="inline-block w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
            >
              Masuk sebagai Dokter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check role: must be 'doctor' or 'admin'
  if (user?.role !== 'doctor' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-rose-900/40 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif text-white">Akses Dibatasi (403)</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Akun Anda (<span className="text-zinc-200 font-medium">{user?.email}</span>) tidak memiliki izin dokter atau clinical specialist.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
            >
              Ganti Akun (Logout)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-zinc-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-serif tracking-widest text-white font-normal">
                LUMIÈRE
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/30">
                CLINICIAN
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
              Doctor & Specialist Portal
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 mb-2">
            Clinical Workspace
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/doctor/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </Link>
            );
          })}

          <div className="pt-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 mb-2">
              Shortcuts
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
            >
              <HeartPulse className="w-4 h-4 text-zinc-500" />
              <span>Lihat Halaman Utama</span>
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all mt-1"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Back Office</span>
              </Link>
            )}
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'D'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-zinc-200 truncate">{user?.name}</div>
              <div className="text-[10px] text-zinc-500 truncate">{user?.email}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-200"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="text-sm font-serif tracking-wider font-semibold text-white">
            LUMIÈRE DOCTOR PORTAL
          </span>

          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
            {user?.name ? user.name[0].toUpperCase() : 'D'}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
