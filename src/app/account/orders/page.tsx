'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthStore, useAuthHydrated } from '@/store/useAuthStore';
import { fetchOrders, Order } from '@/lib/api';
import {
  ShoppingBag,
  Package,
  ChevronRight,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Truck,
} from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const isAuthHydrated = useAuthHydrated();
  const { token, user } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthHydrated) return;

    if (!user || !token) {
      router.push('/login?redirect=/account/orders');
      return;
    }

    fetchOrders(token)
      .then((res) => {
        if (!isMounted) return;
        setOrders(res.data);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to load order history.';
        setError(msg);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthHydrated, user, token, router]);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            <span>Pending Payment</span>
          </span>
        );
      case 'PAID':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  if (!isAuthHydrated || (!user && loading)) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50/60 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-16 text-center text-zinc-400">
          Loading your order history...
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
          <span className="text-zinc-500">Account</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">My Orders</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-rose-100 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs font-medium mb-2">
              <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
              <span>Purchase History</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-zinc-900 dark:text-zinc-50 font-normal">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Review your luxury formulation orders and payment status
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Orders Content */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-3xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="max-w-md mx-auto text-center p-10 bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-xs my-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              No orders placed yet
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Explore our luxury beauty formulations and add items to your shopping bag.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100/80 dark:border-zinc-800 p-6 shadow-xs hover:border-rose-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-50 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Order #{order.id}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div>{getStatusBadge(order.status)}</div>
                </div>

                <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="text-zinc-500 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-zinc-400" />
                      <span>
                        {order.shipping_courier} - {order.shipping_service} ({order.formatted_shipping_cost})
                      </span>
                    </div>
                    <div className="text-zinc-500">
                      Recipient: <span className="font-medium text-zinc-800 dark:text-zinc-200">{order.shipping_address?.name}</span> ({order.shipping_address?.city})
                    </div>
                    {order.shipment?.tracking_number && (
                      <div className="text-zinc-500">
                        Resi: <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{order.shipment.tracking_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-zinc-400">Total Amount</div>
                    <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                      {order.formatted_total}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-rose-50 dark:border-zinc-800 flex justify-end">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    <span>View Order Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
