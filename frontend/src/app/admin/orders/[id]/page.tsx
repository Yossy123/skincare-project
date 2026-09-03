'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchAdminOrderDetail,
  adminProcessOrder,
  adminShipOrder,
  adminDeliverOrder,
  adminCompleteOrder,
  adminCancelOrder,
  adminRefundOrder,
  AdminOrderDetail,
} from '@/lib/api';
import {
  ArrowLeft,
  Truck,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  History,
  ShieldCheck,
  XCircle,
  Sparkles,
  RefreshCw,
  Send,
  RotateCcw,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = Number(resolvedParams.id);

  const router = useRouter();
  const { token } = useAuthStore();

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [serviceName, setServiceName] = useState('');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('customer_request');
  const [cancelNote, setCancelNote] = useState('');

  // Refund Modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);

  const loadOrder = useCallback(async () => {
    if (!token || !orderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOrderDetail(orderId, token);
      setOrder(data);
      setCourierName(data.shipping_courier || 'JNE');
      setServiceName(data.shipping_service || 'REG');
      setTrackingNumber(data.shipment?.tracking_number || '');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load order details';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleProcess = async () => {
    if (!token || !order) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminProcessOrder(order.id, token);
      setOrder(updated);
      setSuccessMessage(`Order #${order.id} status updated to PROCESSING.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process order';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !order) return;
    if (!trackingNumber.trim()) {
      setError('Please provide a valid courier tracking number.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminShipOrder(
        order.id,
        {
          tracking_number: trackingNumber.trim(),
          courier: courierName.trim(),
          service: serviceName.trim(),
        },
        token
      );
      setOrder(updated);
      setShipModalOpen(false);
      setSuccessMessage(`Order #${order.id} marked as SHIPPED with Tracking #${trackingNumber}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to ship order';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = async () => {
    if (!token || !order) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminDeliverOrder(order.id, token);
      setOrder(updated);
      setSuccessMessage(`Order #${order.id} confirmed as DELIVERED.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deliver order';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!token || !order) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminCompleteOrder(order.id, token);
      setOrder(updated);
      setSuccessMessage(`Order #${order.id} marked as COMPLETED.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete order';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !order) return;
    if (cancelReason === 'other' && !cancelNote.trim()) {
      setError('Please provide a descriptive note when selecting "Other".');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminCancelOrder(
        order.id,
        {
          reason: cancelReason,
          note: cancelNote.trim(),
        },
        token
      );
      setOrder(updated);
      setCancelModalOpen(false);
      setSuccessMessage(`Order #${order.id} has been cancelled and stock restored.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !order) return;
    if (!refundReason.trim()) {
      setError('Please provide a reason for processing this refund.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminRefundOrder(
        order.id,
        {
          reason: refundReason.trim(),
          amount: refundAmount > 0 ? refundAmount : undefined,
        },
        token
      );
      setOrder(updated);
      setRefundModalOpen(false);
      setSuccessMessage(`Refund of Rp ${Number(refundAmount || order.total).toLocaleString('id-ID')} processed via Midtrans.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process refund';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

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

  const currentStatus = strtoupper(order.status);
  const pipelineSteps = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
  const currentStepIdx = pipelineSteps.indexOf(currentStatus);

  function strtoupper(val: string) {
    return (val || '').toUpperCase();
  }

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
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {order.allowed_actions.includes('process') && (
            <button
              type="button"
              onClick={handleProcess}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              Start Processing
            </button>
          )}

          {order.allowed_actions.includes('ship') && (
            <button
              type="button"
              onClick={() => setShipModalOpen(true)}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              Ship Order (Tracking #)
            </button>
          )}

          {order.allowed_actions.includes('deliver') && (
            <button
              type="button"
              onClick={handleDeliver}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              Mark Delivered
            </button>
          )}

          {order.allowed_actions.includes('complete') && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              Mark Completed
            </button>
          )}

          {order.allowed_actions.includes('cancel') && (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel Order
            </button>
          )}

          {order.payment && order.payment.status !== 'refunded' && ['PAID', 'PROCESSING', 'CANCELLED'].includes(currentStatus) && (
            <button
              type="button"
              onClick={() => {
                setRefundReason('');
                setRefundAmount(Number(order.payment?.amount || order.total));
                setRefundModalOpen(true);
              }}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refund (Midtrans)</span>
            </button>
          )}
        </div>
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

      {/* Pipeline Step Progress Tracker */}
      {currentStatus !== 'CANCELLED' && currentStatus !== 'EXPIRED' && (
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif font-medium text-zinc-300">Fulfillment Pipeline</span>
            <span className="text-[10px] text-zinc-500 font-mono">Stage {currentStepIdx + 1} of 6</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {pipelineSteps.map((step, idx) => {
              const isPast = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div
                  key={step}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-bold'
                      : isPast
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium'
                      : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-600'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider">
                    {step.replace('_', ' ')}
                  </div>
                  <div className="text-[9px] mt-1 opacity-75">
                    {isCurrent ? '● In Progress' : isPast ? '✓ Done' : '○ Pending'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancellation Notice Banner */}
      {currentStatus === 'CANCELLED' && (
        <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-900/50 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>Order Cancelled</span>
          </div>
          <div className="text-xs text-zinc-300 space-y-1">
            <p>
              <span className="text-zinc-500">Reason:</span>{' '}
              <span className="font-semibold capitalize">
                {order.cancellation_reason?.replace('_', ' ') || 'Not specified'}
              </span>
            </p>
            {order.cancellation_note && (
              <p>
                <span className="text-zinc-500">Admin Note:</span> {order.cancellation_note}
              </p>
            )}
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Inventory stock was automatically restored to catalog.</span>
            </p>
          </div>
        </div>
      )}

      {/* 2-Column Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Items, Financials & Audit Trail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
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

          {/* Audit Trail Timeline */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif text-white">Operational Audit Trail</h3>
              <History className="w-4 h-4 text-zinc-500" />
            </div>

            <div className="space-y-3">
              {order.audit_logs && order.audit_logs.length > 0 ? (
                order.audit_logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-400 font-mono">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(log.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {log.previous_status && (
                      <div className="text-[11px] text-zinc-400">
                        Transition: <span className="text-zinc-500">{log.previous_status}</span> →{' '}
                        <span className="text-emerald-400 font-semibold">{log.new_status}</span>
                      </div>
                    )}
                    {log.note && <div className="text-zinc-300 text-[11px]">{log.note}</div>}
                    {log.admin && (
                      <div className="text-[10px] text-zinc-500">
                        Actor: {log.admin.name} ({log.admin.email})
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-zinc-500">
                  No state changes recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Customer, Shipping & Payment Cards */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <User className="w-4 h-4 text-rose-500" />
              <span>Customer Details</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-semibold text-zinc-100">{order.user?.name || 'Guest'}</div>
              <div className="text-zinc-400">{order.user?.email || '-'}</div>
              <div className="text-zinc-400">{order.user?.phone || '-'}</div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Shipping Address</span>
            </div>
            <div className="space-y-1 text-xs text-zinc-300">
              <div className="font-semibold text-zinc-100">
                {order.shipping_address?.recipient_name || order.shipping_address?.name || '-'}
              </div>
              <div className="text-[11px] text-zinc-400">{order.shipping_address?.phone}</div>
              <p className="text-zinc-300 pt-1">
                {order.shipping_address?.address_line || order.shipping_address?.address}
              </p>
              {order.shipping_address?.address_detail && (
                <p className="text-amber-400/90 text-[11px]">
                  Note: {order.shipping_address.address_detail}
                </p>
              )}
              <div className="text-[11px] text-zinc-400 pt-1">
                {order.shipping_address?.district}, {order.shipping_address?.city},{' '}
                {order.shipping_address?.province} {order.shipping_address?.postal_code}
              </div>
            </div>
          </div>

          {/* Shipping & Courier Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Truck className="w-4 h-4 text-sky-500" />
              <span>Shipment Telemetry</span>
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Courier</span>
                <span className="font-bold text-white uppercase">
                  {order.shipping_courier} ({order.shipping_service})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Tracking #</span>
                <span className="font-mono font-semibold text-rose-400">
                  {order.shipment?.tracking_number || 'Not Assigned'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Status</span>
                <span className="capitalize font-medium text-zinc-200">
                  {order.shipment?.status || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Snapshot Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>Payment Details</span>
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Provider</span>
                <span className="font-semibold text-white uppercase">
                  {order.payment?.provider || 'MIDTRANS'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Transaction ID</span>
                <span className="font-mono text-zinc-400 text-[11px]">
                  {order.payment?.transaction_id || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Status</span>
                <span className="capitalize font-bold text-emerald-400">
                  {order.payment?.status || 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ship Order Modal */}
      {shipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShipModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-white">Ship Order #{order.id}</h3>
              <Truck className="w-5 h-5 text-sky-400" />
            </div>

            <form onSubmit={handleShipSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Courier Name *</label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. JNE, SICEPAT, POS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Service Type</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. REG, YES, BEST"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Tracking / Airway Bill Number *</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. JNE-CGK-198273645"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShipModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Dispatching...' : 'Dispatch Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setCancelModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-rose-900/50 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-white">Cancel Order #{order.id}</h3>
              <XCircle className="w-5 h-5 text-rose-500" />
            </div>

            <p className="text-xs text-zinc-400">
              Cancelling this order will mark it as <code className="text-rose-400">CANCELLED</code> and automatically restore the reserved stock back to the product catalog.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Cancellation Reason *</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 cursor-pointer"
                >
                  <option value="customer_request">Customer requested cancellation</option>
                  <option value="payment_issue">Payment issue / Unverified</option>
                  <option value="product_unavailable">Product unavailable / Defect</option>
                  <option value="shipping_issue">Shipping address / courier issue</option>
                  <option value="duplicate_order">Duplicate order</option>
                  <option value="fraud_suspicious">Fraud / suspicious activity</option>
                  <option value="other">Other (Requires Note)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">
                  Administrative Note {cancelReason === 'other' ? '*' : '(Optional)'}
                </label>
                <textarea
                  rows={3}
                  required={cancelReason === 'other'}
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  placeholder="Provide context or explanation for this cancellation..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Order Modal (Midtrans API) */}
      {refundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setRefundModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-amber-900/50 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-white">Refund Order #{order.id}</h3>
              <RotateCcw className="w-5 h-5 text-amber-400" />
            </div>

            <p className="text-xs text-zinc-400">
              Processing a refund will contact Midtrans gateway to refund the customer. The order state will be marked as <code className="text-amber-400">CANCELLED / REFUNDED</code> and inventory stock will be restored.
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Refund Amount (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={Number(order.payment?.amount || order.total)}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-sm font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Refund Reason *</label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Customer return, damaged package, out of stock"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 cursor-pointer shadow-md shadow-amber-600/20"
                >
                  {actionLoading ? 'Processing Refund...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

