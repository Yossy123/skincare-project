'use client';

import React, { useState } from 'react';
import { AdminOrderDetail } from '@/lib/api';
import { RotateCcw, Truck, XCircle } from 'lucide-react';

interface OrderActionButtonsProps {
  order: AdminOrderDetail;
  actionLoading: boolean;
  onProcess: () => void;
  onShip: (payload: { tracking_number: string; courier: string; service: string }) => Promise<boolean>;
  onDeliver: () => void;
  onComplete: () => void;
  onCancel: (payload: { reason: string; note?: string }) => Promise<boolean>;
  onRefund: (payload: { reason: string; amount?: number }) => Promise<boolean>;
}

export function OrderActionButtons({
  order,
  actionLoading,
  onProcess,
  onShip,
  onDeliver,
  onComplete,
  onCancel,
  onRefund,
}: OrderActionButtonsProps) {
  const currentStatus = (order.status || '').toUpperCase();

  // Modals state
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.shipment?.tracking_number || '');
  const [courierName, setCourierName] = useState(order.shipping_courier || 'JNE');
  const [serviceName, setServiceName] = useState(order.shipping_service || 'REG');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('customer_request');
  const [cancelNote, setCancelNote] = useState('');

  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(Number(order.payment?.amount || order.total));

  const handleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    const success = await onShip({
      tracking_number: trackingNumber.trim(),
      courier: courierName.trim(),
      service: serviceName.trim(),
    });
    if (success) {
      setShipModalOpen(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onCancel({
      reason: cancelReason,
      note: cancelNote.trim(),
    });
    if (success) {
      setCancelModalOpen(false);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundReason.trim()) return;
    const success = await onRefund({
      reason: refundReason.trim(),
      amount: refundAmount > 0 ? refundAmount : undefined,
    });
    if (success) {
      setRefundModalOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
        {order.allowed_actions.includes('process') && (
          <button
            type="button"
            onClick={onProcess}
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
            onClick={onDeliver}
            disabled={actionLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            Mark Delivered
          </button>
        )}

        {order.allowed_actions.includes('complete') && (
          <button
            type="button"
            onClick={onComplete}
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

        {process.env.NEXT_PUBLIC_MIDTRANS_ENABLED === 'true' && order.payment && order.payment.status !== 'refunded' && ['PAID', 'PROCESSING', 'CANCELLED'].includes(currentStatus) && (
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
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
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
    </>
  );
}
