'use client';

import { useState, useCallback } from 'react';
import { fetchShippingRates, ShippingRate } from '@/lib/api';
import { CartItem } from '@/store/useCartStore';

export function useShippingRates(token: string | null, cartItems: CartItem[]) {
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const loadShippingRates = useCallback(
    async (destination: string | number, weightGrams: number) => {
      if (!destination || weightGrams <= 0) return;

      setShippingLoading(true);
      setShippingError(null);

      try {
        const rates = await fetchShippingRates(
          {
            destination,
            weight: weightGrams,
            couriers: ['jne', 'sicepat', 'jnt', 'tiki', 'pos'],
            items: cartItems.map((item) => ({
              product_id: item.productId,
              quantity: item.quantity,
            })),
          },
          token || undefined
        );

        setShippingRates(rates);

        if (rates.length > 0) {
          setSelectedRate((prev) => {
            if (prev) {
              const matched = rates.find(
                (r) => r.courier === prev.courier && r.service === prev.service
              );
              return matched || rates[0];
            }
            return rates[0];
          });
        } else {
          setSelectedRate(null);
        }
      } catch (err: unknown) {
        console.error('Shipping calculation error:', err);
        const msg = err instanceof Error ? err.message : 'Shipping rates could not be loaded. Please try again.';
        setShippingError(msg);
      } finally {
        setShippingLoading(false);
      }
    },
    [token, cartItems]
  );

  return {
    shippingRates,
    selectedRate,
    setSelectedRate,
    shippingLoading,
    shippingError,
    setShippingError,
    loadShippingRates,
  };
}
