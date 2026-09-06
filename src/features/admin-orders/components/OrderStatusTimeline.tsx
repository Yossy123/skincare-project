'use client';

import React from 'react';
import { AdminOrderDetail } from '@/lib/api';
import { XCircle, CheckCircle2, History } from 'lucide-react';

interface OrderStatusTimelineProps {
  order: AdminOrderDetail;
}

export function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const currentStatus = (order.status || '').toUpperCase();
  const pipelineSteps = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
  const currentStepIdx = pipelineSteps.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {/* Pipeline Step Progress Tracker */}
      {currentStatus !== 'CANCELLED' && currentStatus !== 'EXPIRED' && (
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif font-medium text-zinc-300">Fulfillment Pipeline</span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Stage {currentStepIdx >= 0 ? currentStepIdx + 1 : 0} of 6
            </span>
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
  );
}
