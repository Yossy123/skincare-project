'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { useAdminOrderDetail } from '@/features/admin-orders/hooks/useAdminOrderDetail';
import { OrderStatusTimeline } from '@/features/admin-orders/components/OrderStatusTimeline';
import { OrderCustomerCard } from '@/features/admin-orders/components/OrderCustomerCard';
import { OrderPaymentCard } from '@/features/admin-orders/components/OrderPaymentCard';
import { OrderShipmentCard } from '@/features/admin-orders/components/OrderShipmentCard';
import { OrderActionButtons } from '@/features/admin-orders/components/OrderActionButtons';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = Number(resolvedParams.id);

  const { token } = useAuthStore();

  const {
    order,
    loading,
    actionLoading,
    error,
    successMessage,
    setSuccessMessage,
    handleProcess,
    handleShip,
    handleDeliver,
    handleComplete,
    handleCancel,
    handleRefund,
  } = useAdminOrderDetail(orderId, token);

  if (loading && !order) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded-xl" />
        <div className="h-32 bg-zinc-900 rounded-3xl border border-zinc-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-zinc-900 rounded-3xl border border-zinc-800" />
          <div className="h-96 bg-zinc-900 rounded-3xl border border-zinc-800" />
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-900/40 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-lg font-serif text-white">Order Not Found</h3>
        <p className="text-xs text-zinc-400">{error}</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orders List</span>
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const currentStatus = (order.status || '').toUpperCase();

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-white font-normal">
              Order #{String(order.id).padStart(5, '0')}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                currentStatus === 'PAID' || currentStatus === 'COMPLETED' || currentStatus === 'DELIVERED'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : currentStatus === 'PROCESSING' || currentStatus === 'SHIPPED'
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                  : currentStatus === 'PENDING_PAYMENT'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
              }`}
            >
              {currentStatus}
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Placed on{' '}
            {new Date(order.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Action Buttons Bar */}
        <OrderActionButtons
          order={order}
          actionLoading={actionLoading}
          onProcess={handleProcess}
          onShip={handleShip}
          onDeliver={handleDeliver}
          onComplete={handleComplete}
          onCancel={handleCancel}
          onRefund={handleRefund}
        />
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Pipeline & Status Timeline */}
      <OrderStatusTimeline order={order} />

      {/* 2-Column Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Purchased Items & Financials */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h3 className="text-base font-serif text-white">Purchased Items Snapshot</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] text-zinc-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold">Unit Price</th>
                    <th className="pb-3 font-semibold text-center">Qty</th>
                    <th className="pb-3 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {order.order_items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium text-zinc-200">
                        {item.product_name}
                        {item.product?.slug && (
                          <div className="text-[10px] text-zinc-500">SKU: {item.product.slug}</div>
                        )}
                      </td>
                      <td className="py-3 text-zinc-400">
                        Rp {Number(item.unit_price).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-center font-bold text-white">{item.quantity}</td>
                      <td className="py-3 text-right font-semibold text-white">
                        Rp {Number(item.subtotal).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="pt-4 border-t border-zinc-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Products Subtotal</span>
                <span className="font-semibold text-zinc-200">
                  Rp {Number(order.subtotal).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Shipping Cost ({order.shipping_courier})</span>
                <span className="font-semibold text-zinc-200">
                  Rp {Number(order.shipping_cost).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>Grand Total Paid</span>
                <span className="text-base text-rose-400 font-serif">
                  Rp {Number(order.total).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Customer, Shipping & Payment Cards */}
        <div className="space-y-6">
          <OrderCustomerCard order={order} />
          <OrderShipmentCard order={order} />
          <OrderPaymentCard order={order} />
        </div>
      </div>
    </div>
  );
}
