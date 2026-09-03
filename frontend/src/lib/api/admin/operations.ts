import { API_BASE_URL } from '../client';
import type { AdminOrderDetail } from './orders';

/* ==========================================================================
   Advanced Operations & Background Automation Interfaces & Client
   ========================================================================== */

export interface OperationalAlertsData {
  unprocessed_paid_orders: number;
  stale_pending_orders: number;
  low_stock_products: number;
  out_of_stock_products: number;
  recent_refunds_count: number;
}

/**
 * Process verified refund for an order via Midtrans API.
 */
export async function adminRefundOrder(
  id: number,
  payload: { reason: string; amount?: number },
  token: string
): Promise<AdminOrderDetail> {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/refund`, {
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
    throw new Error(errorJson.message || `Failed to process refund (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch real-time operational indicators and alerts.
 */
export async function fetchOperationalAlerts(token: string): Promise<OperationalAlertsData> {
  const res = await fetch(`${API_BASE_URL}/admin/operations/alerts`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch operational alerts (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Trigger background cleanup of expired pending payment orders.
 */
export async function adminExpirePendingOrders(
  hours: number = 24,
  token: string
): Promise<{ message: string; expired_count: number }> {
  const res = await fetch(`${API_BASE_URL}/admin/operations/expire-pending`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ hours }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to expire pending orders (${res.status})`);
  }

  return res.json();
}

/**
 * Trigger background synchronization of active shipments.
 */
export async function adminSyncShipments(
  token: string
): Promise<{ message: string; synced_count: number }> {
  const res = await fetch(`${API_BASE_URL}/admin/operations/sync-shipments`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to synchronize shipments (${res.status})`);
  }

  return res.json();
}
