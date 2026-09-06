'use client';

import { useState, useCallback } from 'react';
import { validateCheckout, CheckoutValidationResponse } from '@/lib/api';
import { CartItem } from '@/store/useCartStore';

export function useCheckoutValidation(token: string | null, cartItems: CartItem[]) {
  const [checkoutData, setCheckoutData] = useState<CheckoutValidationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const runCheckoutValidation = useCallback(
    async (addressId?: number | null) => {
      if (!token || cartItems.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setValidationError(null);

      try {
        const payloadItems = cartItems.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        }));

        const response = await validateCheckout(
          {
            items: payloadItems,
            address_id: addressId ?? null,
          },
          token
        );

        setCheckoutData(response);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to validate checkout calculation.';
        setValidationError(msg);
      } finally {
        setLoading(false);
      }
    },
    [token, cartItems]
  );

  return {
    checkoutData,
    loading,
    validationError,
    setValidationError,
    runCheckoutValidation,
  };
}
