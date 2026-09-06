'use client';

import React from 'react';
import { ShippingRate } from '@/lib/api';
import { Package, AlertCircle, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';

interface CheckoutShippingSectionProps {
  totalWeightFormatted?: string;
  shippingLoading: boolean;
  shippingError: string | null;
  shippingRates: ShippingRate[];
  selectedRate: ShippingRate | null;
  onSelectRate: (rate: ShippingRate) => void;
  onRetry: () => void;
}

const courierColors: Record<string, string> = {
  JNE: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
  SICEPAT: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
  JNT: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
  POS: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900',
  TIKI: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  ANTERAJA: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900',
  GOSEND: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900',
  GRAB: 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800',
  WAHANA: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900',
};

export function CheckoutShippingSection({
  totalWeightFormatted = '0 g',
  shippingLoading,
  shippingError,
  shippingRates,
  selectedRate,
  onSelectRate,
  onRetry,
}: CheckoutShippingSectionProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-rose-50 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
            2
          </span>
          <h2 className="font-serif text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Shipping Courier
          </h2>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
          <Package className="w-3.5 h-3.5 text-zinc-400" />
          <span>{totalWeightFormatted}</span>
        </span>
      </div>

      {shippingLoading ? (
        <div className="space-y-3 py-4 animate-pulse">
          <div className="h-16 bg-stone-100 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-16 bg-stone-100 dark:bg-zinc-800 rounded-2xl" />
        </div>
      ) : shippingError ? (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-800 dark:text-amber-200 text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{shippingError}</span>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 font-bold underline text-amber-900 dark:text-amber-100 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : shippingRates.length === 0 ? (
        <div className="p-6 text-center text-xs text-zinc-500">
          Select a valid delivery address to view available courier services.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shippingRates.map((rate, idx) => {
              const isSelected =
                selectedRate?.courier === rate.courier &&
                selectedRate?.service === rate.service;

              const badgeClass =
                courierColors[rate.courier] ||
                'text-zinc-600 bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300';

              return (
                <div
                  key={`${rate.courier}-${rate.service}-${idx}`}
                  onClick={() => onSelectRate(rate)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-400 dark:border-rose-700 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-rose-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badgeClass}`}>
                        {rate.courier}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{rate.formatted_etd}</span>
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      {rate.service}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {rate.description || rate.courier_name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-rose-100/60 dark:border-zinc-800 text-xs">
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">
                      {rate.formatted_price}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
