import { API_BASE_URL } from './client';
import type { OrderStorePayload, Order, PaginatedResponse } from './types';

/**
 * Create a new customer order.
 */
export async function createOrder(
  payload: OrderStorePayload,
  token: string
): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const json = await res.json();

  if (!res.ok) {
    const errorMsg = json.errors
      ? Object.values(json.errors).flat().join(' ')
      : json.message || 'Order creation failed';
    throw new Error(errorMsg);
  }

  return json.data;
}

/**
 * Fetch customer orders.
 */
export async function fetchOrders(token: string, page = 1): Promise<PaginatedResponse<Order>> {
  const res = await fetch(`${API_BASE_URL}/orders?page=${page}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch orders (${res.status})`);
  }

  return res.json();
}

/**
 * Fetch single order by ID.
 */
export async function fetchOrderById(id: number | string, token: string): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch order details (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}
