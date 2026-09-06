'use client';

import React from 'react';
import { AdminOrderDetail } from '@/lib/api';
import { Truck } from 'lucide-react';

interface OrderShipmentCardProps {
  order: AdminOrderDetail;
}

export function OrderShipmentCard({ order }: OrderShipmentCardProps) {
  return (
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
  );
}
