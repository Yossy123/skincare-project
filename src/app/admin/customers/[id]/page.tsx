'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchAdminCustomerDetail,
  adminToggleCustomer,
  AdminCustomerDetailResponse,
} from '@/lib/api';
import {
  ArrowLeft,
  User,
  ShoppingBag,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Power,
  ExternalLink,
  History,
  ShieldAlert,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminCustomerDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const customerId = Number(resolvedParams.id);

  const { token } = useAuthStore();

  const [data, setData] = useState<AdminCustomerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Deactivation Modal
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [toggleReason, setToggleReason] = useState('');
  const [toggleNote, setToggleNote] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (token && customerId) {
      fetchAdminCustomerDetail(customerId, token)
        .then((res) => {
          if (!isMounted) return;
          setData(res);
          setError(null);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (!isMounted) return;
          const msg = err instanceof Error ? err.message : 'Failed to load customer profile';
          setError(msg);
          setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [token, customerId]);

  const handleToggleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !data) return;

    setActionLoading(true);
    setError(null);
    try {
      const updated = await adminToggleCustomer(
        customerId,
        {
          reason: toggleReason.trim() || undefined,
          note: toggleNote.trim() || undefined,
        },
        token
      );
      setData(updated);
      setToggleModalOpen(false);
      const isNowActive = updated.customer.is_active;
      setSuccessMessage(
        `Customer '${updated.customer.name}' account has been ${
          isNowActive ? 'Reactivated' : 'Deactivated'
        }.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update account status';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-zinc-900 rounded-3xl border border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-900/40 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-lg font-serif text-white">Customer Not Found</h3>
        <p className="text-xs text-zinc-400">{error}</p>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customers</span>
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { customer, statistics, addresses, orders, audit_logs } = data;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Customers</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-serif font-bold text-base flex items-center justify-center shrink-0">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-serif text-white font-normal">{customer.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    customer.is_active
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {customer.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {customer.email} • Registered{' '}
                {new Date(customer.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setToggleReason('');
              setToggleNote('');
              setToggleModalOpen(true);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              customer.is_active
                ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20'
                : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{customer.is_active ? 'Deactivate Account' : 'Reactivate Account'}</span>
          </button>
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

      {/* Deactivated Notice */}
      {!customer.is_active && (
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-950/30 border border-rose-900/50 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-rose-300">Account Deactivated by Administration</div>
            <p className="text-zinc-400">
              This customer is currently restricted from logging in and placing new orders. Historical order data and transaction snapshots are preserved.
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Total Lifetime Spending</div>
          <div className="text-xl font-serif text-white font-normal">
            {statistics.formatted_total_spending}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span>{statistics.paid_orders_count} paid transactions</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Total Orders Placed</div>
          <div className="text-xl font-serif text-white font-normal">
            {statistics.total_orders} Orders
          </div>
          <div className="text-[10px] text-zinc-500">
            {statistics.completed_orders} completed • {statistics.cancelled_orders} cancelled
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Average Order Value (AOV)</div>
          <div className="text-xl font-serif text-rose-400 font-normal">
            {statistics.formatted_aov}
          </div>
          <div className="text-[10px] text-zinc-500">Per paid checkout</div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Last Purchase Activity</div>
          <div className="text-base font-serif text-zinc-200 font-normal">
            {statistics.last_order_at ? (
              new Date(statistics.last_order_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            ) : (
              'No orders placed'
            )}
          </div>
          <div className="text-[10px] text-zinc-500">Latest checkout timestamp</div>
        </div>
      </div>

      {/* 2-Column Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Order History & Audit Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order History */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif text-white">Order History</h3>
              <ShoppingBag className="w-4 h-4 text-zinc-500" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] text-zinc-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Total Amount</th>
                    <th className="pb-3 font-semibold">Payment</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {orders.length > 0 ? (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 font-mono font-bold text-rose-400">
                          #{String(o.id).padStart(5, '0')}
                        </td>
                        <td className="py-3 text-zinc-400">
                          {new Date(o.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 font-semibold text-white">
                          Rp {Number(o.total).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3">
                          <span className="capitalize text-emerald-400 text-[11px]">
                            {o.payment_status}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === 'PAID' || o.status === 'COMPLETED' || o.status === 'DELIVERED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : o.status === 'PROCESSING' || o.status === 'SHIPPED'
                                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                                : o.status === 'PENDING_PAYMENT'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="inline-flex items-center gap-1 text-zinc-400 hover:text-white"
                          >
                            <span>Manage</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">
                        No orders recorded for this customer yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Administrative Audit Logs */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif text-white">Administrative Account Audit Log</h3>
              <History className="w-4 h-4 text-zinc-500" />
            </div>

            <div className="space-y-3">
              {audit_logs.length > 0 ? (
                audit_logs.map((log) => (
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
                    {log.reason && (
                      <div className="text-zinc-300 text-[11px]">
                        <span className="text-zinc-500">Reason:</span> {log.reason}
                      </div>
                    )}
                    {log.note && <div className="text-zinc-400 text-[11px]">{log.note}</div>}
                    {log.admin && (
                      <div className="text-[10px] text-zinc-500">
                        Actor: {log.admin.name} ({log.admin.email})
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-zinc-500">
                  No administrative account status changes recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Contact Profile & Addresses */}
        <div className="space-y-6">
          {/* Profile Snapshot */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <User className="w-4 h-4 text-rose-500" />
              <span>Contact Profile</span>
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Full Name</span>
                <span className="font-semibold text-white">{customer.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Email</span>
                <span className="font-mono text-zinc-200">{customer.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Phone</span>
                <span className="font-mono text-zinc-200">{customer.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Role</span>
                <span className="capitalize text-zinc-300 font-medium">{customer.role}</span>
              </div>
            </div>
          </div>

          {/* Shipping Addresses */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Registered Shipping Addresses ({addresses.length})</span>
            </div>

            <div className="space-y-3">
              {addresses.length > 0 ? (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-1 text-xs text-zinc-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        {addr.recipient_name || addr.name || customer.name}
                      </span>
                      {addr.is_default && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-500/20 text-rose-300">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">{addr.phone}</div>
                    <p className="pt-1 text-zinc-300">{addr.address_line || addr.address}</p>
                    <div className="text-[10px] text-zinc-500">
                      {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-zinc-500">
                  No saved shipping addresses.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate / Reactivate Modal */}
      {toggleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setToggleModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-white">
                {customer.is_active ? 'Deactivate Customer Account' : 'Reactivate Customer Account'}
              </h3>
              <Power className={`w-5 h-5 ${customer.is_active ? 'text-rose-500' : 'text-emerald-400'}`} />
            </div>

            <p className="text-xs text-zinc-400">
              {customer.is_active
                ? `Deactivating '${customer.name}' will immediately revoke active sessions and prevent the customer from logging in or placing new orders. Historical order data remains completely intact.`
                : `Reactivating '${customer.name}' will restore access, allowing the customer to log in and checkout normally.`}
            </p>

            <form onSubmit={handleToggleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Reason for Action</label>
                <input
                  type="text"
                  value={toggleReason}
                  onChange={(e) => setToggleReason(e.target.value)}
                  placeholder="e.g. Fraud prevention hold, Identity re-verified"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Administrative Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={toggleNote}
                  onChange={(e) => setToggleNote(e.target.value)}
                  placeholder="Add internal notes for administrative audit..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setToggleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-5 py-2 rounded-xl font-semibold text-white shadow-md disabled:opacity-50 cursor-pointer ${
                    customer.is_active
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  {actionLoading
                    ? 'Processing...'
                    : customer.is_active
                    ? 'Confirm Deactivation'
                    : 'Confirm Reactivation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
