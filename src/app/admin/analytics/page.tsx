'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchSalesAnalytics,
  fetchOrderAnalytics,
  fetchProductAnalytics,
  fetchCustomerAnalytics,
  fetchPaymentAnalytics,
  fetchShippingAnalytics,
  SalesAnalyticsResponse,
  OrderAnalyticsResponse,
  ProductAnalyticsResponse,
  CustomerAnalyticsResponse,
  PaymentAnalyticsResponse,
  ShippingAnalyticsResponse,
} from '@/lib/api';
import {
  TimeSeriesAreaChart,
  StatusDistributionCards,
  HorizontalBreakdownList,
} from '@/components/admin/AnalyticsCharts';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  Truck,
  Calendar,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

type TabKey = 'sales' | 'orders' | 'products' | 'customers' | 'payments' | 'shipping';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'sales';

  const { token } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [period, setPeriod] = useState<string>('30d');

  const [salesData, setSalesData] = useState<SalesAnalyticsResponse | null>(null);
  const [ordersData, setOrdersData] = useState<OrderAnalyticsResponse | null>(null);
  const [productsData, setProductsData] = useState<ProductAnalyticsResponse | null>(null);
  const [customersData, setCustomersData] = useState<CustomerAnalyticsResponse | null>(null);
  const [paymentsData, setPaymentsData] = useState<PaymentAnalyticsResponse | null>(null);
  const [shippingData, setShippingData] = useState<ShippingAnalyticsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTabData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'sales') {
        const res = await fetchSalesAnalytics({ period }, token);
        setSalesData(res);
      } else if (activeTab === 'orders') {
        const res = await fetchOrderAnalytics({ period }, token);
        setOrdersData(res);
      } else if (activeTab === 'products') {
        const res = await fetchProductAnalytics({ period }, token);
        setProductsData(res);
      } else if (activeTab === 'customers') {
        const res = await fetchCustomerAnalytics({ period }, token);
        setCustomersData(res);
      } else if (activeTab === 'payments') {
        const res = await fetchPaymentAnalytics({ period }, token);
        setPaymentsData(res);
      } else if (activeTab === 'shipping') {
        const res = await fetchShippingAnalytics({ period }, token);
        setShippingData(res);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, period, token]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    router.push(`/admin/analytics?tab=${tab}`);
  };

  const periodOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white font-normal">
            E-Commerce Analytics
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Realtime database telemetry across sales, product demand, customers, payments, and shipping.
          </p>
        </div>

        {/* Period Filter & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  period === opt.value
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadTabData}
            disabled={loading}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 overflow-x-auto pb-px">
        {[
          { key: 'sales', label: 'Sales & Revenue', icon: DollarSign },
          { key: 'orders', label: 'Order Lifecycle', icon: ShoppingBag },
          { key: 'products', label: 'Product Performance', icon: Package },
          { key: 'customers', label: 'Customer Retention', icon: Users },
          { key: 'payments', label: 'Midtrans Payments', icon: CreditCard },
          { key: 'shipping', label: 'RajaOngkir Courier', icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key as TabKey)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                  : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Content 1: Sales & Revenue */}
      {activeTab === 'sales' && salesData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Total Net Revenue</span>
              <div className="text-2xl font-bold font-serif text-white mt-2">
                {salesData.summary.formatted_revenue}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Excludes Pending & Cancelled</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Total Paid Orders</span>
              <div className="text-2xl font-bold font-serif text-white mt-2">
                {salesData.summary.orders}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">Successfully checked out</div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Average Order Value (AOV)</span>
              <div className="text-2xl font-bold font-serif text-rose-400 mt-2">
                {salesData.summary.formatted_average_order_value}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">Revenue ÷ Paid Orders</div>
            </div>
          </div>

          {/* Area Chart */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif text-white">Daily Revenue Trajectory</h3>
                <p className="text-xs text-zinc-400">Continuous daily timeline in Asia/Jakarta timezone.</p>
              </div>
            </div>
            <TimeSeriesAreaChart data={salesData.series} height={260} />
          </div>
        </div>
      )}

      {/* Tab Content 2: Order Lifecycle */}
      {activeTab === 'orders' && ordersData && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-zinc-400">Total Orders in Period</span>
              <div className="text-2xl font-bold font-serif text-white mt-1">
                {ordersData.total_orders}
              </div>
            </div>
          </div>

          <StatusDistributionCards items={ordersData.status_distribution} />

          {/* Recent Orders Table */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h3 className="text-base font-serif text-white">Orders Stream in Period</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] text-zinc-400 uppercase">
                    <th className="pb-3 font-semibold">Order</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {ordersData.recent_orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 font-mono font-bold text-rose-400">{o.order_number}</td>
                      <td className="py-3">
                        <div className="text-zinc-200 font-medium">{o.customer.name}</div>
                        <div className="text-[10px] text-zinc-500">{o.customer.email}</div>
                      </td>
                      <td className="py-3 text-zinc-400">{o.formatted_date}</td>
                      <td className="py-3 font-semibold text-white">{o.formatted_total}</td>
                      <td className="py-3 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300">
                          {o.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Product Performance */}
      {activeTab === 'products' && productsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Selling Products */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
              <h3 className="text-base font-serif text-white">Best-Selling by Volume</h3>
              <div className="divide-y divide-zinc-800/60">
                {productsData.best_selling.map((item, idx) => (
                  <div key={item.product_id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-zinc-200">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">{item.units_sold} units</div>
                      <div className="text-[10px] text-zinc-400">{item.formatted_revenue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Revenue Products */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
              <h3 className="text-base font-serif text-white">Top Revenue Contributors</h3>
              <div className="divide-y divide-zinc-800/60">
                {productsData.top_revenue.map((item, idx) => (
                  <div key={item.product_id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-zinc-200">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-rose-400">{item.formatted_revenue}</div>
                      <div className="text-[10px] text-zinc-400">{item.units_sold} units sold</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h3 className="text-base font-serif text-white">Inventory Stock Warning List</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {productsData.inventory_alerts.low_stock.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-zinc-950/60 border border-amber-500/20">
                  <div className="font-semibold text-xs text-zinc-200">{p.name}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-zinc-400">{p.formatted_price}</span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-bold">
                      {p.stock} units left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Customer Retention */}
      {activeTab === 'customers' && customersData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Total Customer Base</span>
              <div className="text-2xl font-bold font-serif text-white mt-2">
                {customersData.summary.total_customers}
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">New Sign-Ups in Period</span>
              <div className="text-2xl font-bold font-serif text-white mt-2">
                {customersData.summary.new_customers}
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Purchasing Customers</span>
              <div className="text-2xl font-bold font-serif text-white mt-2">
                {customersData.summary.purchasing_customers}
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Repeat Customer Rate</span>
              <div className="text-2xl font-bold font-serif text-purple-400 mt-2">
                {customersData.summary.repeat_rate_percentage}%
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                {customersData.summary.repeat_customers} customers placed ≥ 2 orders
              </div>
            </div>
          </div>

          {/* Top Spenders */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h3 className="text-base font-serif text-white">Top Spending Clients (VIP)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] text-zinc-400 uppercase">
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Phone</th>
                    <th className="pb-3 font-semibold">Paid Orders</th>
                    <th className="pb-3 font-semibold text-right">Lifetime Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {customersData.top_customers.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 font-medium text-zinc-100">{c.name}</td>
                      <td className="py-3 text-zinc-400">{c.email}</td>
                      <td className="py-3 text-zinc-400">{c.phone || '-'}</td>
                      <td className="py-3 font-bold text-white">{c.orders_count}</td>
                      <td className="py-3 text-right font-bold text-rose-400">{c.formatted_total_spent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 5: Midtrans Payments */}
      {activeTab === 'payments' && paymentsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Total Transactions</span>
              <div className="text-2xl font-bold font-serif text-white mt-2">
                {paymentsData.summary.total_transactions}
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Payment Success Rate</span>
              <div className="text-2xl font-bold font-serif text-emerald-400 mt-2">
                {paymentsData.summary.success_rate_percentage}%
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Settled Revenue</span>
              <div className="text-2xl font-bold font-serif text-white mt-2">
                {paymentsData.summary.successful.formatted_amount}
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Pending Authorization</span>
              <div className="text-2xl font-bold font-serif text-amber-400 mt-2">
                {paymentsData.summary.pending.formatted_amount}
              </div>
            </div>
          </div>

          <HorizontalBreakdownList
            title="Payment Method Breakdown"
            items={paymentsData.payment_methods.map((p) => ({
              label: p.method,
              count: p.count,
              percentage:
                paymentsData.summary.successful.count > 0
                  ? Math.round((p.count / paymentsData.summary.successful.count) * 100)
                  : 0,
              formatted_amount: p.formatted_amount,
            }))}
          />
        </div>
      )}

      {/* Tab Content 6: RajaOngkir Shipping */}
      {activeTab === 'shipping' && shippingData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Total Shipped Packages</span>
              <div className="text-2xl font-bold font-serif text-white mt-2">
                {shippingData.summary.total_shipped_orders}
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Total Shipping Cost Paid</span>
              <div className="text-2xl font-bold font-serif text-white mt-2">
                {shippingData.summary.formatted_total_shipping_cost}
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400">Avg Shipping per Order</span>
              <div className="text-2xl font-bold font-serif text-rose-400 mt-2">
                {shippingData.summary.formatted_average_shipping_cost}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HorizontalBreakdownList
              title="Courier Volume Usage (RajaOngkir)"
              items={shippingData.courier_usage.map((c) => ({
                label: c.courier,
                count: c.orders_count,
                percentage: c.percentage,
                formatted_amount: c.formatted_total_cost,
              }))}
            />

            <HorizontalBreakdownList
              title="Top Destination Provinces"
              items={shippingData.destinations.map((d) => ({
                label: d.region,
                count: d.orders_count,
                percentage: d.percentage,
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
