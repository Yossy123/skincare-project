'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchAdminOverview,
  fetchOperationalAlerts,
  adminExpirePendingOrders,
  adminSyncShipments,
  AdminDashboardOverview,
  OperationalAlertsData,
} from '@/lib/api';
import {
  TimeSeriesAreaChart,
  StatusDistributionCards,
} from '@/components/admin/AnalyticsCharts';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Zap,
  Truck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<AdminDashboardOverview | null>(null);
  const [alerts, setAlerts] = useState<OperationalAlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [overview, alertData] = await Promise.all([
        fetchAdminOverview(token),
        fetchOperationalAlerts(token).catch(() => null),
      ]);
      setData(overview);
      if (alertData) setAlerts(alertData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleExpirePending = async () => {
    if (!token) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await adminExpirePendingOrders(24, token);
      setActionMessage(res.message);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to expire pending orders';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncShipments = async () => {
    if (!token) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await adminSyncShipments(token);
      setActionMessage(res.message);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sync shipments';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-zinc-800/80 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-900 rounded-3xl border border-zinc-800" />
          ))}
        </div>
        <div className="h-72 bg-zinc-900 rounded-3xl border border-zinc-800" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-900/40 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-lg font-serif text-white">Dashboard Error</h3>
        <p className="text-xs text-zinc-400">{error}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-serif text-white font-normal">
              Executive Overview
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-semibold border border-rose-500/20">
              Live PostgreSQL
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Realtime revenue, order performance, inventory telemetry, and customer metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            <span>Deep Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Operations & Background Automation Command Strip */}
      {alerts && (
        <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-500" />
              <span className="font-serif font-medium text-white">Operations Monitor:</span>
            </div>

            <span className="px-2.5 py-1 rounded-xl bg-zinc-950 text-zinc-300 border border-zinc-800">
              <strong className="text-emerald-400 font-mono">{alerts.unprocessed_paid_orders}</strong> Unprocessed Paid
            </span>

            <span className="px-2.5 py-1 rounded-xl bg-zinc-950 text-zinc-300 border border-zinc-800">
              <strong className="text-amber-400 font-mono">{alerts.stale_pending_orders}</strong> Stale Pending (&gt;24h)
            </span>

            <span className="px-2.5 py-1 rounded-xl bg-zinc-950 text-zinc-300 border border-zinc-800">
              <strong className="text-rose-400 font-mono">{alerts.low_stock_products}</strong> Low Stock SKUs
            </span>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={handleExpirePending}
              disabled={actionLoading}
              title="Expire stale pending orders and restore inventory stock"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Expire Unpaid (&gt;24h)</span>
            </button>

            <button
              type="button"
              onClick={handleSyncShipments}
              disabled={actionLoading}
              title="Synchronize active shipment statuses with courier API"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>Sync Shipments</span>
            </button>
          </div>
        </div>
      )}

      {/* 8 Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Lifetime Revenue */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Total Lifetime Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-serif text-white tracking-tight">
              {kpis?.total_revenue.formatted || 'Rp 0'}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Verified Paid Orders Only</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Total Orders Placed</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-serif text-white tracking-tight">
              {kpis?.total_orders.formatted || '0'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Across all order lifecycles</div>
          </div>
        </div>

        {/* KPI 3: Total Customers */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Registered Customers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-serif text-white tracking-tight">
              {kpis?.total_customers.formatted || '0'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Active customer profiles</div>
          </div>
        </div>

        {/* KPI 4: Active Catalog Products */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Catalog Products</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-serif text-white tracking-tight">
              {kpis?.total_products.formatted || '0'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Active published SKUs</div>
          </div>
        </div>

        {/* KPI 5: Today's Revenue */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Today&apos;s Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-serif text-white tracking-tight">
              {kpis?.today_revenue.formatted || 'Rp 0'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Asia/Jakarta (WIB)</div>
          </div>
        </div>

        {/* KPI 6: Today's Orders */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Today&apos;s Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-serif text-white tracking-tight">
              {kpis?.today_orders.formatted || '0'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">New incoming checkouts</div>
          </div>
        </div>

        {/* KPI 7: Pending Payments */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Pending Payments</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-serif text-amber-400 tracking-tight">
              {kpis?.pending_payments.formatted || '0'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Awaiting customer payment</div>
          </div>
        </div>

        {/* KPI 8: Low Stock Items */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Inventory Alert (≤ 5)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-serif text-rose-400 tracking-tight">
              {kpis?.low_stock_products.formatted || '0'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Products needing restock</div>
          </div>
        </div>
      </div>

      {/* 7-Day Revenue Trend Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-serif text-white">7-Day Sales & Revenue Trend</h3>
            <p className="text-xs text-zinc-400">
              Aggregated daily revenue from verified transactions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Daily Revenue (IDR)</span>
          </div>
        </div>

        <TimeSeriesAreaChart data={data?.sales_trend_7d || []} height={220} />
      </div>

      {/* Order Status Distribution */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif text-white">Order Status Lifecycle</h3>
            <p className="text-xs text-zinc-400">Breakdown of orders in the system.</p>
          </div>
          <Link
            href="/admin/analytics?tab=orders"
            className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <StatusDistributionCards items={data?.status_distribution || []} />
      </div>

      {/* Two Column Section: Best Selling Products & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif text-white">Top Best-Selling SKUs</h3>
              <p className="text-[11px] text-zinc-400">Ranked by units sold in valid orders.</p>
            </div>
            <Sparkles className="w-4 h-4 text-rose-400" />
          </div>

          <div className="divide-y divide-zinc-800/60">
            {data?.top_products && data.top_products.length > 0 ? (
              data.top_products.map((p, idx) => (
                <div key={p.product_id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-zinc-200 truncate">{p.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-white">{p.formatted_revenue}</div>
                    <div className="text-[10px] text-zinc-400">{p.units_sold} units sold</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                No product sales recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Stock Alerts Widget */}
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif text-white">Stock Depletion Warnings</h3>
              <p className="text-[11px] text-zinc-400">Items reaching critical stock thresholds.</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-2.5">
            {data?.inventory_alerts.low_stock && data.inventory_alerts.low_stock.length > 0 ? (
              data.inventory_alerts.low_stock.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-zinc-950/50 border border-amber-500/20 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">{item.name}</div>
                    <div className="text-[10px] text-zinc-400">{item.formatted_price}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold shrink-0 border border-amber-500/20">
                    {item.stock} left
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center text-xs text-emerald-400">
                All catalog items are adequately stocked!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Stream */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif text-white">Recent Customer Orders</h3>
            <p className="text-xs text-zinc-400">Latest checkout transactions across the store.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] text-zinc-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Order</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Courier</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {data?.recent_orders && data.recent_orders.length > 0 ? (
                data.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 font-mono font-bold text-rose-400">{order.order_number}</td>
                    <td className="py-3">
                      <div className="font-medium text-zinc-200">{order.customer.name}</div>
                      <div className="text-[10px] text-zinc-500">{order.customer.email}</div>
                    </td>
                    <td className="py-3 text-zinc-400">{order.formatted_date}</td>
                    <td className="py-3 font-semibold text-white">{order.formatted_total}</td>
                    <td className="py-3 text-zinc-300 uppercase">{order.courier}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                          order.order_status === 'PAID' || order.order_status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : order.order_status === 'PENDING_PAYMENT'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
