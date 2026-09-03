'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchAdminOrders,
  AdminOrderListItem,
  AdminOrderPaginatedResponse,
} from '@/lib/api';
import {
  Search,
  Filter,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Truck,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();

  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [meta, setMeta] = useState<AdminOrderPaginatedResponse | null>(null);

  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [orderStatus, setOrderStatus] = useState<string>(searchParams.get('order_status') || '');
  const [paymentStatus, setPaymentStatus] = useState<string>(searchParams.get('payment_status') || '');
  const [courier, setCourier] = useState<string>(searchParams.get('courier') || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetchAdminOrders(
        {
          page,
          per_page: 15,
          search: search || undefined,
          order_status: orderStatus || undefined,
          payment_status: paymentStatus || undefined,
          courier: courier || undefined,
        },
        token
      );
      setOrders(res.data);
      setMeta(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, orderStatus, paymentStatus, courier]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  const statusFilters = [
    { label: 'All Orders', value: '' },
    { label: 'Pending Payment', value: 'PENDING_PAYMENT' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const getOrderStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
      case 'PROCESSING':
      case 'SHIPPED':
        return 'bg-sky-500/15 text-sky-400 border border-sky-500/20';
      case 'PENDING_PAYMENT':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white font-normal">
            Orders Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Realtime customer checkout stream, fulfillment workflows, and tracking records.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order # (e.g. #00001) or customer name / email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={courier}
              onChange={(e) => {
                setCourier(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="">All Couriers</option>
              <option value="JNE">JNE</option>
              <option value="SICEPAT">SiCepat</option>
              <option value="POS">POS Indonesia</option>
              <option value="TIKI">TIKI</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {statusFilters.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setOrderStatus(s.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                orderStatus === s.value
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-zinc-800/80'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Order</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Total Amount</th>
                <th className="py-3.5 px-4 font-semibold">Payment</th>
                <th className="py-3.5 px-4 font-semibold">Shipping</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-500" />
                    <span>Loading order records...</span>
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-rose-400">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>#{String(order.id).padStart(5, '0')}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </Link>
                      <div className="text-[10px] text-zinc-500 font-sans font-normal mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-zinc-200">{order.user?.name || 'Guest'}</div>
                      <div className="text-[10px] text-zinc-500">{order.user?.email || '-'}</div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-white">
                      Rp {Number(order.total).toLocaleString('id-ID')}
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-zinc-300 font-medium">
                        {order.payment?.provider?.toUpperCase() || 'MIDTRANS'}
                      </span>
                      <div className="text-[10px] text-emerald-400 capitalize">
                        {order.payment?.status || 'Pending'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-zinc-300 uppercase flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{order.shipping_courier} {order.shipping_service}</span>
                      </div>
                      {order.shipment?.tracking_number ? (
                        <div className="text-[10px] font-mono text-zinc-400 truncate max-w-35">
                          {order.shipment.tracking_number}
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-600">No tracking #</div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${getOrderStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
                      >
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <ShoppingBag className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    <span>No orders found matching the filter criteria.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-400">
            <div>
              Showing <span className="font-semibold text-zinc-200">{meta.from || 0}</span> to{' '}
              <span className="font-semibold text-zinc-200">{meta.to || 0}</span> of{' '}
              <span className="font-semibold text-zinc-200">{meta.total}</span> orders
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-zinc-200 font-semibold px-2">
                Page {meta.current_page} of {meta.last_page}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
