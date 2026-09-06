'use client';

import React from 'react';
import { CheckoutValidationResponse } from '@/lib/api';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface CheckoutPaymentSectionProps {
  loading: boolean;
  checkoutData: CheckoutValidationResponse | null;
}

export function CheckoutPaymentSection({
  loading,
  checkoutData,
}: CheckoutPaymentSectionProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-rose-50 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
            3
          </span>
          <h2 className="font-serif text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Validated Products & Inventory
          </h2>
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>DB Verified</span>
        </span>
      </div>

      {loading && !checkoutData ? (
        <div className="space-y-3 animate-pulse py-4">
          <div className="h-16 bg-stone-100 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-16 bg-stone-100 dark:bg-zinc-800 rounded-2xl" />
        </div>
      ) : checkoutData?.items ? (
        <div className="space-y-3 divide-y divide-rose-50 dark:divide-zinc-800">
          {checkoutData.items.map((item) => (
            <div
              key={item.product_id}
              className="pt-3 first:pt-0 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-zinc-800 dark:to-zinc-800 border border-rose-100 dark:border-zinc-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-rose-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {item.name}
                  </h4>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span>{item.formatted_price}</span>
                    <span>×</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {item.quantity}
                    </span>
                    {item.weight > 0 && <span>• {item.weight * item.quantity}g</span>}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-50">
                  {item.formatted_line_subtotal}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  In Stock ({item.stock})
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
