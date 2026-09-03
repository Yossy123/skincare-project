import { API_BASE_URL } from '../client';

/* ==========================================================================
   Admin Analytics Response Interfaces
   ========================================================================== */

export interface SalesAnalyticsResponse {
  period: string;
  start_date: string;
  end_date: string;
  summary: {
    revenue: number;
    formatted_revenue: string;
    orders: number;
    average_order_value: number;
    formatted_average_order_value: string;
  };
  series: Array<{
    date: string;
    label: string;
    revenue: number;
    formatted_revenue: string;
    orders: number;
  }>;
}

export interface OrderAnalyticsResponse {
  period: string;
  total_orders: number;
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
}

export interface ProductAnalyticsResponse {
  period: string;
  low_stock_threshold: number;
  best_selling: Array<{
    product_id: number;
    name: string;
    units_sold: number;
    revenue: number;
    formatted_revenue: string;
  }>;
  top_revenue: Array<{
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
}

export interface CustomerAnalyticsResponse {
  period: string;
  summary: {
    total_customers: number;
    new_customers: number;
    purchasing_customers: number;
    repeat_customers: number;
    repeat_rate_percentage: number;
  };
  top_customers: Array<{
    id: number;
    name: string;
    email: string;
    phone: string | null;
    orders_count: number;
    total_spent: number;
    formatted_total_spent: string;
    last_order_date: string | null;
  }>;
}

export interface PaymentAnalyticsResponse {
  period: string;
  summary: {
    total_transactions: number;
    success_rate_percentage: number;
    successful: {
      count: number;
      amount: number;
      formatted_amount: string;
    };
    pending: {
      count: number;
      amount: number;
      formatted_amount: string;
    };
    failed: {
      count: number;
      amount: number;
      formatted_amount: string;
    };
    expired: {
      count: number;
      amount: number;
      formatted_amount: string;
    };
  };
  payment_methods: Array<{
    method: string;
    count: number;
    amount: number;
    formatted_amount: string;
  }>;
}

export interface ShippingAnalyticsResponse {
  period: string;
  summary: {
    total_shipped_orders: number;
    total_shipping_cost: number;
    formatted_total_shipping_cost: string;
    average_shipping_cost: number;
    formatted_average_shipping_cost: string;
  };
  courier_usage: Array<{
    courier: string;
    orders_count: number;
    percentage: number;
    total_cost: number;
    formatted_total_cost: string;
  }>;
  service_usage: Array<{
    courier: string;
    service: string;
    orders_count: number;
    total_cost: number;
    formatted_total_cost: string;
  }>;
  destinations: Array<{
    region: string;
    orders_count: number;
    percentage: number;
  }>;
}

/**
 * Fetch Sales & Revenue Analytics.
 */
export async function fetchSalesAnalytics(
  params: { period?: string; start_date?: string; end_date?: string },
  token: string
): Promise<SalesAnalyticsResponse> {
  const query = new URLSearchParams();
  if (params.period) query.set('period', params.period);
  if (params.start_date) query.set('start_date', params.start_date);
  if (params.end_date) query.set('end_date', params.end_date);

  const res = await fetch(`${API_BASE_URL}/admin/analytics/sales?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch sales analytics (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch Order Analytics & Status Distribution.
 */
export async function fetchOrderAnalytics(
  params: { period?: string; limit?: number },
  token: string
): Promise<OrderAnalyticsResponse> {
  const query = new URLSearchParams();
  if (params.period) query.set('period', params.period);
  if (params.limit) query.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE_URL}/admin/analytics/orders?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch order analytics (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch Product Analytics, Rankings & Stock Alerts.
 */
export async function fetchProductAnalytics(
  params: { period?: string; limit?: number; threshold?: number },
  token: string
): Promise<ProductAnalyticsResponse> {
  const query = new URLSearchParams();
  if (params.period) query.set('period', params.period);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.threshold) query.set('threshold', String(params.threshold));

  const res = await fetch(`${API_BASE_URL}/admin/analytics/products?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch product analytics (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch Customer Analytics & Top Spending Clients.
 */
export async function fetchCustomerAnalytics(
  params: { period?: string; limit?: number },
  token: string
): Promise<CustomerAnalyticsResponse> {
  const query = new URLSearchParams();
  if (params.period) query.set('period', params.period);
  if (params.limit) query.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE_URL}/admin/analytics/customers?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch customer analytics (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch Midtrans Payment Analytics.
 */
export async function fetchPaymentAnalytics(
  params: { period?: string },
  token: string
): Promise<PaymentAnalyticsResponse> {
  const query = new URLSearchParams();
  if (params.period) query.set('period', params.period);

  const res = await fetch(`${API_BASE_URL}/admin/analytics/payments?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch payment analytics (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch Courier Usage & Shipping Analytics.
 */
export async function fetchShippingAnalytics(
  params: { period?: string },
  token: string
): Promise<ShippingAnalyticsResponse> {
  const query = new URLSearchParams();
  if (params.period) query.set('period', params.period);

  const res = await fetch(`${API_BASE_URL}/admin/analytics/shipping?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch shipping analytics (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}
