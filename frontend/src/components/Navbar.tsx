'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore, useCartHydrated } from '@/store/useCartStore';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import { CartDrawer } from '@/components/CartDrawer';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Sparkles,
  User as UserIcon,
  LogOut,
  ChevronDown,
  MapPin,
  Package,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    { name: 'Skincare', href: '/categories/skincare' },
    { name: 'Makeup', href: '/categories/makeup' },
    { name: 'Fragrance', href: '/categories/fragrance' },
  ];

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-stone-50/90 dark:bg-zinc-950/90 border-b border-rose-100/80 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-sm shadow-rose-500/30 font-serif font-bold text-base transition-transform group-hover:scale-105">
                  L
                </span>
                <div className="flex flex-col">
                  <span className="font-serif tracking-widest text-lg sm:text-xl font-semibold bg-gradient-to-r from-zinc-900 via-rose-950 to-zinc-800 dark:from-zinc-100 dark:via-rose-200 dark:to-zinc-300 bg-clip-text text-transparent">
                    LUMIÈRE
                  </span>
                  <span className="text-[9px] tracking-[0.25em] uppercase text-rose-500 font-semibold -mt-1">
                    BEAUTÉ
                  </span>
                </div>
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
                    <span className="max-w-[100px] truncate hidden sm:inline">{user.name.split(' ')[0]}</span>
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
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-rose-600 bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 hover:border-rose-300 transition-all shadow-2xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Cart Drawer Trigger */}
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                title="Open Shopping Bag"
                aria-label={`Shopping Bag (${cartItemCount} items)`}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in duration-200">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-900 transition-colors"
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
                    className="text-center py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-xs font-semibold text-white shadow-xs"
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
    </>
  );
}
