'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, ShippingRate } from '@/lib/api';
import { CartItem } from '@/store/useCartStore';

export function useCheckoutOrder(
  token: string | null,
  cartItems: CartItem[],
  clearCart: () => void
) {
  const router = useRouter();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handlePlaceOrder = async (
    selectedAddressId: number | null,
    selectedRate: ShippingRate | null
  ) => {
    if (!token || !selectedAddressId || !selectedRate || cartItems.length === 0) {
      setOrderError('Please select a delivery address and shipping courier service before placing your order.');
      return;
    }

    setPlacingOrder(true);
    setOrderError(null);

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        address_id: selectedAddressId,
        courier: selectedRate.courier,
        service: selectedRate.service,
      };

      const createdOrder = await createOrder(orderPayload, token);

      clearCart();
      router.push(`/account/orders/${createdOrder.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setOrderError(msg);
      setPlacingOrder(false);
    }
  };

  return {
    placingOrder,
    orderError,
    setOrderError,
    handlePlaceOrder,
  };
}
