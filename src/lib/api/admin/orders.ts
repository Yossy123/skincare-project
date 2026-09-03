import { API_BASE_URL } from '../client';
import type { Product } from '../types';

/* ==========================================================================
   Admin Order Management Interfaces
   ========================================================================== */

export interface OrderAuditLogItem {
  id: number;
  order_id: number;
  admin_id: number | null;
  admin?: {
    id: number;
    name: string;
    email: string;
  } | null;
  action: string;
  previous_status: string | null;
  new_status: string;
  reason: string | null;
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminOrderListItem {
  id: number;
  user_id: number;
  status: string;
  subtotal: number | string;
  shipping_cost: number | string;
  total: number | string;
  shipping_courier: string;
  shipping_service: string;
  shipping_etd?: string | null;
  shipping_address: {
    recipient_name?: string;
    name?: string;
    phone?: string;
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    address?: string;
    address_line?: string;
    address_detail?: string;
  };
  cancellation_reason?: string | null;
  cancellation_note?: string | null;
  cancelled_at?: string | null;
  allowed_actions: Array<'process' | 'ship' | 'deliver' | 'complete' | 'cancel'>;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  payment?: {
    id: number;
    order_id: number;
    provider: string;
    transaction_id?: string | null;
    status: string;
    amount: number | string;
    paid_at?: string | null;
  } | null;
  shipment?: {
    id: number;
    order_id: number;
    courier: string;
    service: string;
    tracking_number?: string | null;
    status: string;
    shipped_at?: string | null;
    delivered_at?: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface AdminOrderDetail extends AdminOrderListItem {
  order_items: Array<{
    id: number;
    order_id: number;
    product_id: number;
    product_name: string;
    unit_price: number | string;
    quantity: number;
    subtotal: number | string;
    product?: Product | null;
  }>;
  cancelled_by_user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  audit_logs: OrderAuditLogItem[];
}

export interface AdminOrderPaginatedResponse {
  data: AdminOrderListItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/**
 * Fetch paginated orders for Admin Order Management.
 */
export async function fetchAdminOrders(
  params: {
    page?: number;
    per_page?: number;
    search?: string;
    order_status?: string;
    payment_status?: string;
    courier?: string;
    start_date?: string;
    end_date?: string;
  },
  token: string
): Promise<AdminOrderPaginatedResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.search) query.set('search', params.search);
  if (params.order_status) query.set('order_status', params.order_status);
  if (params.payment_status) query.set('payment_status', params.payment_status);
  if (params.courier) query.set('courier', params.courier);
  if (params.start_date) query.set('start_date', params.start_date);
  if (params.end_date) query.set('end_date', params.end_date);

  const res = await fetch(`${API_BASE_URL}/admin/orders?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch admin orders (${res.status})`);
  }

  return res.json();
}

/**
 * Fetch complete order detail for Admin Back Office.
 */
export async function fetchAdminOrderDetail(id: number, token: string): Promise<AdminOrderDetail> {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch order detail (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Start order fulfillment (PAID -> PROCESSING).
 */
export async function adminProcessOrder(id: number, token: string): Promise<AdminOrderDetail> {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/process`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to process order (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Mark order as SHIPPED with tracking number (PROCESSING -> SHIPPED).
 */
export async function adminShipOrder(
  id: number,
  payload: { tracking_number: string; courier?: string; service?: string },
  token: string
): Promise<AdminOrderDetail> {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/ship`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to ship order (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Mark order as DELIVERED (SHIPPED -> DELIVERED).
 */
export async function adminDeliverOrder(id: number, token: string): Promise<AdminOrderDetail> {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/deliver`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to mark order as delivered (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Mark order as COMPLETED (DELIVERED -> COMPLETED).
 */
export async function adminCompleteOrder(id: number, token: string): Promise<AdminOrderDetail> {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/complete`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to complete order (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Cancel order and restore inventory stock.
 */
export async function adminCancelOrder(
  id: number,
  payload: { reason: string; note?: string },
  token: string
): Promise<AdminOrderDetail> {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/cancel`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to cancel order (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}
