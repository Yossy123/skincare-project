import { API_BASE_URL } from '../client';

/* ==========================================================================
   Admin Dashboard Interfaces
   ========================================================================== */

export interface AdminKPICard {
  value: number;
  formatted: string;
  label: string;
}

export interface AdminDashboardOverview {
  kpis: {
    total_revenue: AdminKPICard;
    total_orders: AdminKPICard;
    total_customers: AdminKPICard;
    total_products: AdminKPICard;
    today_revenue: AdminKPICard;
    today_orders: AdminKPICard;
    pending_payments: AdminKPICard;
    low_stock_products: AdminKPICard;
  };
  sales_trend_7d: Array<{
    date: string;
    label: string;
    revenue: number;
    formatted_revenue: string;
    orders: number;
  }>;
  status_distribution: Array<{
    status: string;
    count: number;
    percentage: number;
    total_amount: number;
    formatted_amount: string;
  }>;
  recent_orders: Array<{
    id: number;
    order_number: string;
    customer: {
      name: string;
      email: string;
    };
    created_at: string;
    formatted_date: string;
    total: number;
    formatted_total: string;
    order_status: string;
    payment_status: string;
    courier: string;
  }>;
  top_products: Array<{
    product_id: number;
    name: string;
    units_sold: number;
    revenue: number;
    formatted_revenue: string;
  }>;
  inventory_alerts: {
    low_stock: Array<{
      id: number;
      name: string;
      slug: string;
      stock: number;
      price: number;
      formatted_price: string;
      status: string;
    }>;
    low_stock_count: number;
    out_of_stock: Array<{
      id: number;
      name: string;
      slug: string;
      stock: number;
      price: number;
      formatted_price: string;
      status: string;
    }>;
    out_of_stock_count: number;
  };
  clinical?: {
    total_patients: number;
    new_patients_this_month: number;
    bookings_today: number;
    bookings_pending: number;
    bookings_confirmed: number;
    bookings_completed: number;
    today_doctor_schedules?: Array<{
      id: number;
      name: string;
      specialization: string;
      appointments_count: number;
    }>;
  };
}

/**
 * Fetch Executive Admin Dashboard Overview (Protected: Sanctum Admin).
 */
export async function fetchAdminOverview(token: string): Promise<AdminDashboardOverview> {
  const res = await fetch(`${API_BASE_URL}/admin/dashboard/overview`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch admin overview (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}
