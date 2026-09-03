'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import { fetchOrderById, Order } from '@/lib/api';
import {
  ShoppingBag,
  Package,
  MapPin,
  Truck,
  CreditCard,
  ChevronRight,
  Clock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isAuthHydrated = useAuthHydrated();
  const { token, user } = useAuthStore();

  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthHydrated) return;

    if (!user || !token) {
      router.push(`/login?redirect=/account/orders/${orderId}`);
      return;
    }

    if (!orderId) return;

    setLoading(true);
    setError(null);

    fetchOrderById(orderId, token)
      .then((data) => {
        setOrder(data);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load order details.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [isAuthHydrated, user, token, orderId, router]);

  if (!isAuthHydrated || (!user && loading)) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-16 text-center text-zinc-400">
          Loading order details...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-rose-500 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/account/orders" className="hover:text-rose-500 transition-colors">My Orders</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">Order #{orderId}</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-rose-100 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-medium mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Payment Preparation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">
              Order #{orderId}
            </h1>
            {order && (
              <p className="text-xs text-zinc-400 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>

          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Orders</span>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 rounded-3xl bg-zinc-100 dark:bg-zinc-800/60" />
            <div className="h-48 rounded-3xl bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
        ) : order ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Order Items Snapshot */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 shadow-xs">
                <h3 className="font-serif text-base font-semibold text-zinc-900 dark:text-zinc-50 pb-3 mb-4 border-b border-rose-50 dark:border-zinc-800 flex items-center justify-between">
                  <span>Purchased Items Snapshot</span>
                  <span className="text-xs text-zinc-400 font-normal">
                    {order.items?.length || 0} items
                  </span>
                </h3>

                <div className="divide-y divide-rose-50 dark:divide-zinc-800">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-zinc-800 dark:to-zinc-800 border border-rose-100 dark:border-zinc-700 flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <h4 className="font-serif text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {item.product_name}
                          </h4>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <span>{item.formatted_unit_price}</span>
                            <span>×</span>
                            <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.quantity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                          {item.formatted_subtotal}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Courier Snapshot */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 shadow-xs space-y-4">
                <h3 className="font-serif text-base font-semibold text-zinc-900 dark:text-zinc-50 pb-3 border-b border-rose-50 dark:border-zinc-800">
                  Delivery & Shipment Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/40 border border-rose-50 dark:border-zinc-700/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>Shipping Address</span>
                    </div>
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">
                      {order.shipping_address?.name} ({order.shipping_address?.phone})
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {order.shipping_address?.address}, {order.shipping_address?.district}, {order.shipping_address?.city}, {order.shipping_address?.province} {order.shipping_address?.postal_code}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/40 border border-rose-50 dark:border-zinc-700/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                      <Truck className="w-4 h-4 text-rose-500" />
                      <span>Courier Method</span>
                    </div>
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">
                      {order.shipping_courier} — {order.shipping_service}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Estimated Delivery: {order.shipping_etd || '2-3 Hari'}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Cost: {order.formatted_shipping_cost}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6 sticky top-28">
                <h3 className="font-serif text-xl font-semibold text-zinc-900 dark:text-zinc-50 pb-4 border-b border-rose-100 dark:border-zinc-800">
                  Payment Summary
                </h3>

                <div className="space-y-3.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Product Subtotal</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {order.formatted_subtotal}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping Cost</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {order.formatted_shipping_cost}
                    </span>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-rose-100/70 dark:border-zinc-800 text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    <span>Total Amount</span>
                    <span className="text-rose-600 dark:text-rose-400">
                      {order.formatted_total}
                    </span>
                  </div>
                </div>

                {/* Payment Gateway Action (Phase 8 Midtrans) */}
                <div className="space-y-3 pt-2">
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 opacity-90 cursor-not-allowed shadow-md shadow-rose-500/20"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Now with Midtrans</span>
                  </button>

                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-[11px] leading-relaxed flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Order Created:</strong> Your stock has been reserved and order snapshots are saved. Midtrans Snap payment gateway integration will be completed in the next phase.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
