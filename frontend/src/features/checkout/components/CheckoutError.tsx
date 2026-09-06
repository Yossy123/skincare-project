'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface CheckoutErrorProps {
  validationError: string | null;
  orderError: string | null;
  onRevalidate?: () => void;
}

export function CheckoutError({
  validationError,
  orderError,
  onRevalidate,
}: CheckoutErrorProps) {
  if (!validationError && !orderError) return null;

  return (
    <div className="mb-8 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm">Checkout Notice</p>
        <p className="mt-1">{orderError || validationError}</p>
        {validationError && onRevalidate && (
          <button
            type="button"
            onClick={onRevalidate}
            className="mt-2 text-rose-700 dark:text-rose-300 font-bold underline cursor-pointer"
          >
            Re-validate Cart
          </button>
        )}
      </div>
    </div>
  );
}
