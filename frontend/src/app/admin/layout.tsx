'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  FolderTree,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, token, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      name: 'Overview Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Orders Management',
      href: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      name: 'Products & Stock',
      href: '/admin/products',
      icon: Package,
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: FolderTree,
    },
    {
      name: 'Customers',
      href: '/admin/customers',
      icon: Users,
    },
    {
      name: 'E-Commerce Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Prevent flash while hydrating auth state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
          <span>Authenticating Admin Back Office...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> Redirect
  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif text-white">Admin Authentication Required</h2>
          <p className="text-xs text-zinc-400">
            You must be signed in with an administrative account to access the back office.
          </p>
          <div className="pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="inline-block w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20"
            >
              Sign In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but not Admin -> 403 Forbidden UX
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-rose-900/40 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif text-white">Access Restricted (403)</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your account (<span className="text-zinc-200 font-medium">{user?.email}</span>) is assigned the <code className="px-1 py-0.5 rounded bg-zinc-800 text-rose-300 font-mono text-[11px]">customer</code> role and does not have administrative privileges.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Store</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
            >
              Switch Account (Logout)
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
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold tracking-wider uppercase border border-rose-500/30">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
              E-Commerce Analytics
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
            Back Office
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white font-semibold shadow-lg shadow-rose-500/20'
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
              Public Store
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-zinc-500" />
              <span>View Live Storefront</span>
            </Link>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
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
            LUMIÈRE ADMIN
          </span>

          <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
