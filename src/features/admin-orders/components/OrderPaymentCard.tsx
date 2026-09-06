'use client';

import React from 'react';
import { AdminOrderDetail } from '@/lib/api';
import { CreditCard } from 'lucide-react';

interface OrderPaymentCardProps {
  order: AdminOrderDetail;
}

export function OrderPaymentCard({ order }: OrderPaymentCardProps) {
  return (
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
  );
}
