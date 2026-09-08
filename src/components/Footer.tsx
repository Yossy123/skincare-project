import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-100 dark:bg-zinc-900 border-t border-rose-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white font-serif font-bold text-xs">
              L
            </span>
            <span className="font-serif tracking-widest text-base font-semibold text-zinc-900 dark:text-zinc-100">
              LUMIÈRE BEAUTÉ
            </span>
          </div>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Elevating everyday beauty with scientifically formulated skincare, luminous makeup, and holistic body care.
          </p>
        </div>

        {/* Categories */}
        <div>
          <h5 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs tracking-wider uppercase mb-3">
            Collections
          </h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="/categories/skincare" className="hover:text-rose-500 transition-colors">Skincare</Link></li>
            <li><Link href="/categories/makeup" className="hover:text-rose-500 transition-colors">Makeup</Link></li>
            <li><Link href="/categories/body-care" className="hover:text-rose-500 transition-colors">Body Care</Link></li>
            <li><Link href="/categories/hair-care" className="hover:text-rose-500 transition-colors">Hair Care</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h5 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs tracking-wider uppercase mb-3">
            Customer Care
          </h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products" className="hover:text-rose-500 transition-colors">Product Catalog</Link></li>
            <li><span className="hover:text-rose-500 cursor-pointer">Shipping & Delivery</span></li>
            <li><span className="hover:text-rose-500 cursor-pointer">Order Tracking</span></li>
            <li><span className="hover:text-rose-500 cursor-pointer">Privacy Policy</span></li>
            <li><span className="hover:text-rose-500 cursor-pointer">Terms of Service</span></li>
          </ul>
        </div>

        {/* Newsletter placeholder */}
        <div>
          <h5 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs tracking-wider uppercase mb-3">
            Join the Club
          </h5>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            Subscribe to receive exclusive beauty drops and botanical skincare tips.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-rose-200/70 dark:border-zinc-700 w-full focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            />
            <button
              className="px-3 py-2 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors shrink-0 cursor-pointer"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-rose-100 dark:border-zinc-800/80 py-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
        <p className="flex items-center justify-center gap-1">
          <span>&copy; {new Date().getFullYear()} Lumière Beauté. Built with Next.js, Laravel & Tailwind CSS.</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
        </p>
      </div>
    </footer>
  );
}
