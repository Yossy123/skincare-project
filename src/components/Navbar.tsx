'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore, useCartHydrated } from '@/store/useCartStore';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import { CartDrawer } from '@/components/CartDrawer';
import { OnlineConsultationModal } from '@/components/OnlineConsultationModal';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Sparkles,
  LogOut,
  ChevronDown,
  MapPin,
  Package,
  MessageCircle,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Cart state
  const isCartHydrated = useCartHydrated();
  const { getTotalItems, toggleCart } = useCartStore();
  const cartItemCount = isCartHydrated ? getTotalItems() : 0;

  // Auth state
  const isAuthHydrated = useAuthHydrated();
  const { user, logout } = useAuthStore();
  const isAuthenticated = isAuthHydrated && Boolean(user);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop All', href: '/products' },
    { name: 'Specialists', href: '/specialists' },
    { name: 'Booking', href: '/booking' },
  ];

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-stone-50/90 dark:bg-zinc-950/90 border-b border-rose-100/80 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center group py-1">
                <Image
                  src="/logo.png"
                  alt="NOBYDERM"
                  width={200}
                  height={52}
                  className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-rose-100/70 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {/* Konsultasi Online Trigger Button in Nav */}
              <button
                type="button"
                onClick={() => setIsConsultationModalOpen(true)}
                className="inline-flex items-center gap-1.5 ml-1 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 shadow-xs transition-all cursor-pointer hover:scale-105"
                title="Konsultasi Online Dokter via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                <span>Konsultasi Online</span>
              </button>
            </nav>

            {/* Actions & Utilities */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/products"
                className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-900 transition-colors"
                title="Search Catalog"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* User Profile / Auth State */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 text-xs font-medium hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[10px]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-25 truncate hidden sm:inline">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-rose-100 dark:border-zinc-800 p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-rose-50 dark:border-zinc-800">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{user.email}</div>
                      </div>
                      <Link
                        href="/cart"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
                        <span>Shopping Bag ({cartItemCount})</span>
                      </Link>
                      <Link
                        href="/account/addresses"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Shipping Addresses</span>
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800"
                      >
                        <Package className="w-3.5 h-3.5 text-rose-500" />
                        <span>My Orders</span>
                      </Link>
                      {user.role === 'doctor' && (
                        <Link
                          href="/doctor/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-zinc-800"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Doctor Portal</span>
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-zinc-800"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-xs transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Shopping Bag Button with Animated Badge */}
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-full text-zinc-700 dark:text-zinc-200 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                aria-label="View Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span
                    key={cartItemCount}
                    className="absolute -top-1 -right-1 bg-linear-to-tr from-rose-600 to-pink-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-xs animate-cart-bounce"
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-900"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-rose-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 px-4 pt-3 pb-6 space-y-2 shadow-lg backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Konsultasi Online Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsConsultationModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Konsultasi Online via WhatsApp</span>
            </button>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-rose-50/50 dark:bg-zinc-900 rounded-xl">
                    <div className="text-xs">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user.name}</span>
                      <span className="block text-zinc-400 text-[10px]">{user.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Sign Out
                    </button>
                  </div>
                  <Link
                    href="/account/addresses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 rounded-xl"
                  >
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>Manage Addresses</span>
                  </Link>
                  {user.role === 'doctor' && (
                    <Link
                      href="/doctor/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 rounded-xl"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Doctor Portal</span>
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 rounded-xl"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl border border-rose-200 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl bg-linear-to-r from-rose-500 to-pink-500 text-xs font-semibold text-white shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Cart Slide-over Drawer Component */}
      <CartDrawer />

      {/* Online Consultation WhatsApp Modal Component */}
      <OnlineConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
      />
    </>
  );
}
