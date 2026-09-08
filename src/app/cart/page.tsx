'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductImage } from '@/components/ProductImage';
import { useCartStore, useCartHydrated } from '@/store/useCartStore';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Package,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function CartPage() {
  const isHydrated = useCartHydrated();
  const {
    items,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    setQuantity,
    clearCart,
    getSubtotal,
    getTotalItems,
    getTotalWeight,
  } = useCartStore();

  const totalItems = isHydrated ? getTotalItems() : 0;
  const subtotal = isHydrated ? getSubtotal() : 0;
  const totalWeight = isHydrated ? getTotalWeight() : 0;

  const formattedSubtotal = 'Rp ' + Number(subtotal).toLocaleString('id-ID');
  const formattedWeight =
    totalWeight >= 1000
      ? (totalWeight / 1000).toFixed(2) + ' kg'
      : totalWeight + ' g';

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-rose-100 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs font-medium mb-2">
              <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
              <span>Your Shopping Bag</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">
              Review Bag ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </h1>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Empty State */}
        {!isHydrated || items.length === 0 ? (
          <div className="max-w-lg mx-auto my-12 text-center p-12 bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Your shopping bag is empty
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs mx-auto leading-relaxed">
              Looks like you haven&apos;t added any luxury cosmetics or skincare to your bag yet.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/20"
            >
              <span>Explore Formulations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-6 divide-y divide-rose-50 dark:divide-zinc-800/80">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Product Thumbnail & Meta */}
                      <div className="flex items-center gap-4 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="relative w-20 h-20 rounded-2xl bg-linear-to-br from-rose-50 to-pink-50 dark:from-zinc-800 dark:to-zinc-800/60 border border-rose-100 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden"
                        >
                          <ProductImage
                            image={item.image}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <Sparkles className="w-8 h-8 text-rose-400" />
                        </Link>

                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-serif text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 hover:text-rose-600 line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              Rp {Number(item.price).toLocaleString('id-ID')}
                            </span>
                            {item.weight > 0 && (
                              <span className="text-[11px] text-zinc-400">
                                • {item.weight}g
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Subtotal Controls */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-rose-50 dark:border-zinc-800">
                        {/* Quantity Selector */}
                        <div className="flex items-center rounded-xl border border-rose-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800">
                          <button
                            onClick={() => decreaseQuantity(item.productId)}
                            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) setQuantity(item.productId, val);
                            }}
                            className="w-10 text-center text-xs font-semibold bg-transparent focus:outline-hidden"
                          />
                          <button
                            onClick={() => increaseQuantity(item.productId)}
                            disabled={item.quantity >= item.stock}
                            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Subtotal */}
                        <div className="text-right min-w-25">
                          <div className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-50">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-2 text-zinc-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Action Bar */}
                <div className="p-4 sm:p-6 bg-stone-50/70 dark:bg-zinc-800/40 border-t border-rose-100 dark:border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={clearCart}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all items</span>
                  </button>

                  <div className="text-xs text-zinc-400">
                    Free shipping on orders above Rp 500.000
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 shadow-xs space-y-6">
                <h3 className="font-serif text-lg font-semibold text-zinc-900 dark:text-zinc-50 pb-3 border-b border-rose-100 dark:border-zinc-800">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Total Items</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Total Package Weight</span>
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {formattedWeight}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-rose-50 dark:border-zinc-800 text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    <span>Estimated Subtotal</span>
                    <span>{formattedSubtotal}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/20 transition-all text-center"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-zinc-800/40 border border-rose-100 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Secure Checkout:</strong> Live inventory, real-time database pricing, and shipping calculations will be validated on the next step.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
