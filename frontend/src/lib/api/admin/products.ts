import { API_BASE_URL } from '../client';

/* ==========================================================================
   Admin Product Management Interfaces & API Functions
   ========================================================================== */

export interface AdminProductListItem {
  id: number;
  category_id: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  formatted_price?: string;
  weight: number;
  stock: number;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminProductPaginatedResponse {
  data: AdminProductListItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/**
 * Fetch paginated products for Admin back office.
 */
export async function fetchAdminProducts(
  params: {
    page?: number;
    per_page?: number;
    search?: string;
    category_id?: number | string;
    is_active?: boolean | string;
    stock_status?: string;
  },
  token: string
): Promise<AdminProductPaginatedResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.search) query.set('search', params.search);
  if (params.category_id) query.set('category_id', String(params.category_id));
  if (params.is_active !== undefined && params.is_active !== '') {
    query.set('is_active', String(params.is_active));
  }
  if (params.stock_status) query.set('stock_status', params.stock_status);

  const res = await fetch(`${API_BASE_URL}/admin/products?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch products (${res.status})`);
  }

  return res.json();
}

/**
 * Create a new product.
 */
export async function adminCreateProduct(
  payload: {
    category_id: number;
    name: string;
    slug?: string;
    description?: string;
    price: number;
    weight: number;
    stock: number;
    image?: string;
    is_active?: boolean;
  },
  token: string
): Promise<AdminProductListItem> {
  const res = await fetch(`${API_BASE_URL}/admin/products`, {
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
    throw new Error(errorJson.message || `Failed to create product (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Update an existing product.
 */
export async function adminUpdateProduct(
  id: number,
  payload: {
    category_id?: number;
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    weight?: number;
    stock?: number;
    image?: string;
    is_active?: boolean;
  },
  token: string
): Promise<AdminProductListItem> {
  const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to update product (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Toggle product activation.
 */
export async function adminToggleProduct(id: number, token: string): Promise<AdminProductListItem> {
  const res = await fetch(`${API_BASE_URL}/admin/products/${id}/toggle`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to toggle product status (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Controlled stock adjustment.
 */
export async function adminAdjustStock(
  id: number,
  payload: { type: 'set' | 'increment' | 'decrement'; amount: number; reason?: string },
  token: string
): Promise<AdminProductListItem> {
  const res = await fetch(`${API_BASE_URL}/admin/products/${id}/stock`, {
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
    throw new Error(errorJson.message || `Failed to adjust stock (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

// Re-export category types and functions for backwards compatibility
export type { AdminCategoryItem } from './categories';
export {
  fetchAdminCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminToggleCategory,
  adminDeleteCategory,
} from './categories';
