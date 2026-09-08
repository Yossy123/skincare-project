'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, useCartHydrated } from '@/store/useCartStore';
import { ProductImage } from '@/components/ProductImage';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  Package,
} from 'lucide-react';

export function CartDrawer() {
  const isHydrated = useCartHydrated();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getSubtotal,
    getTotalItems,
    getTotalWeight,
  } = useCartStore();

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalItems = isHydrated ? getTotalItems() : 0;
  const subtotal = isHydrated ? getSubtotal() : 0;
  const totalWeight = isHydrated ? getTotalWeight() : 0;

  const formattedSubtotal = 'Rp ' + Number(subtotal).toLocaleString('id-ID');
  const formattedWeight =
    totalWeight >= 1000
      ? (totalWeight / 1000).toFixed(2) + ' kg'
      : totalWeight + ' g';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 shadow-2xl border-l border-rose-100 dark:border-zinc-800 flex flex-col justify-between animate-slide-in-right">
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-rose-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-serif font-semibold text-zinc-900 dark:text-zinc-50">
                  Shopping Bag
                </h2>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {!isHydrated || items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-400 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mb-6">
                  Explore our luxury skincare, makeup, and fragrance formulations to get started.
                </p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-xs"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-rose-50 dark:divide-zinc-800/80">
                {items.map((item) => (
                  <div key={item.productId} className="pt-4 first:pt-0 flex gap-3.5">
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-zinc-800 dark:to-zinc-800/60 border border-rose-100/80 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden"
                    >
                      <ProductImage
                        image={item.image}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <Sparkles className="w-6 h-6 text-rose-400" />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="font-serif text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-rose-600 truncate"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          Rp {Number(item.price).toLocaleString('id-ID')}
                        </span>
                        {item.weight > 0 && (
                          <span className="text-[10px] text-zinc-400">
                            • {item.weight}g
                          </span>
                        )}
                      </div>

                      {/* Quantity Adjuster */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center rounded-lg border border-rose-100 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800">
                          <button
                            onClick={() => decreaseQuantity(item.productId)}
                            className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.productId)}
                            disabled={item.quantity >= item.stock}
                            className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer - Totals & Actions */}
          {isHydrated && items.length > 0 && (
            <div className="p-4 sm:p-6 bg-stone-50/80 dark:bg-zinc-900/90 border-t border-rose-100 dark:border-zinc-800 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    <span>Est. Total Weight</span>
                  </span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {formattedWeight}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm pt-1 border-t border-rose-100/60 dark:border-zinc-800">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Subtotal
                  </span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    {formattedSubtotal}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  Taxes & shipping calculated securely during checkout.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/20 transition-all text-center"
                >
                  <span>View Shopping Bag</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    onClick={clearCart}
                    className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Clear bag
                  </button>

                  <button
                    onClick={closeCart}
                    className="text-zinc-600 dark:text-zinc-300 hover:underline cursor-pointer font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
