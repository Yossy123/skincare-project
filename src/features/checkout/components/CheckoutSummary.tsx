'use client';

import React from 'react';
import { CheckoutValidationResponse, ShippingRate } from '@/lib/api';
import { Truck, Package, CreditCard, Loader2 } from 'lucide-react';

interface CheckoutSummaryProps {
  checkoutData: CheckoutValidationResponse | null;
  selectedRate: ShippingRate | null;
  canPlaceOrder: boolean;
  placingOrder: boolean;
  onPlaceOrder: () => void;
}

export function CheckoutSummary({
  checkoutData,
  selectedRate,
  canPlaceOrder,
  placingOrder,
  onPlaceOrder,
}: CheckoutSummaryProps) {
  const subtotal = checkoutData?.summary.subtotal || 0;
  const shippingCost = selectedRate?.price || 0;
  const grandTotal = subtotal + shippingCost;
  const formattedGrandTotal = 'Rp ' + Number(grandTotal).toLocaleString('id-ID');

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6 sticky top-28">
      <h3 className="font-serif text-xl font-semibold text-zinc-900 dark:text-zinc-50 pb-4 border-b border-rose-100 dark:border-zinc-800">
        Payment Summary
      </h3>

      <div className="space-y-3.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
        <div className="flex justify-between">
          <span>Product Subtotal</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {checkoutData?.summary.formatted_subtotal || 'Rp 0'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-zinc-400" />
            <span>Courier Delivery</span>
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {selectedRate ? (
              <span>{selectedRate.formatted_price} ({selectedRate.courier})</span>
            ) : (
              <span className="text-zinc-400">Select courier</span>
            )}
          </span>
        </div>

        <div className="flex justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-zinc-400" />
            <span>Package Weight</span>
          </span>
          <span>{checkoutData?.summary.formatted_total_weight || '0 g'}</span>
        </div>

        <div className="flex justify-between pt-4 border-t border-rose-100/70 dark:border-zinc-800 text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
          <span>Total Due</span>
          <span className="text-rose-600 dark:text-rose-400">
            {formattedGrandTotal}
          </span>
        </div>
      </div>

      {/* Order Placement Action */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={!canPlaceOrder || placingOrder}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-center"
        >
          {placingOrder ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Secure Order...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Place Order & Prepare Payment</span>
            </>
          )}
        </button>

        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Atomic Order Security:
          </p>
          <p>
            • Stock will be reserved and locked atomically.
          </p>
          <p>
            • Order item prices and delivery addresses are frozen upon order creation.
          </p>
        </div>
      </div>
    </div>
  );
}
