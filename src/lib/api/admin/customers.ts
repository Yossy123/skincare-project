import { API_BASE_URL } from '../client';
import type { Address } from '../types';

/* ==========================================================================
   Admin Customer Management Interfaces
   ========================================================================== */

export interface CustomerAuditLogItem {
  id: number;
  action: string;
  reason: string | null;
  note: string | null;
  admin?: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at: string;
}

export interface AdminCustomerListItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  total_orders: number;
  paid_orders_count: number;
  total_spending: number | null;
  last_order_at: string | null;
  created_at: string;
}

export interface AdminCustomerPaginatedResponse {
  data: AdminCustomerListItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface AdminCustomerDetailResponse {
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
  };
  statistics: {
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    paid_orders_count: number;
    total_spending: number;
    formatted_total_spending: string;
    average_order_value: number;
    formatted_aov: string;
    last_order_at: string | null;
  };
  addresses: Address[];
  orders: Array<{
    id: number;
    created_at: string;
    status: string;
    total: number;
    shipping_courier: string;
    payment_status: string;
    payment_provider: string;
    tracking_number: string | null;
  }>;
  audit_logs: CustomerAuditLogItem[];
}

/**
 * Fetch paginated customers with aggregated spending metrics.
 */
export async function fetchAdminCustomers(
  params: {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: boolean | string;
    start_date?: string;
    end_date?: string;
  },
  token: string
): Promise<AdminCustomerPaginatedResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.search) query.set('search', params.search);
  if (params.is_active !== undefined && params.is_active !== '') {
    query.set('is_active', String(params.is_active));
  }
  if (params.start_date) query.set('start_date', params.start_date);
  if (params.end_date) query.set('end_date', params.end_date);

  const res = await fetch(`${API_BASE_URL}/admin/customers?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch customers (${res.status})`);
  }

  return res.json();
}

/**
 * Fetch complete customer profile, lifetime metrics, order history, and audit logs.
 */
export async function fetchAdminCustomerDetail(
  id: number,
  token: string
): Promise<AdminCustomerDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/admin/customers/${id}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch customer details (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Toggle customer account activation (Deactivate / Reactivate).
 */
export async function adminToggleCustomer(
  id: number,
  payload: { reason?: string; note?: string },
  token: string
): Promise<AdminCustomerDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/admin/customers/${id}/toggle`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to update customer status (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}
