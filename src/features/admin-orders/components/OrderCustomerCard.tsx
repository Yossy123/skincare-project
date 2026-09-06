'use client';

import React from 'react';
import { AdminOrderDetail } from '@/lib/api';
import { User, MapPin } from 'lucide-react';

interface OrderCustomerCardProps {
  order: AdminOrderDetail;
}

export function OrderCustomerCard({ order }: OrderCustomerCardProps) {
  return (
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
    </div>
  );
}
