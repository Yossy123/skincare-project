import { API_BASE_URL } from '../client';

/* ==========================================================================
   Admin Category Management Interfaces & API Functions
   ========================================================================== */

export interface AdminCategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all categories with products count for Admin back office.
 */
export async function fetchAdminCategories(token: string): Promise<AdminCategoryItem[]> {
  const res = await fetch(`${API_BASE_URL}/admin/categories`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to fetch categories (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Create a new category.
 */
export async function adminCreateCategory(
  payload: { name: string; slug?: string; description?: string; is_active?: boolean },
  token: string
): Promise<AdminCategoryItem> {
  const res = await fetch(`${API_BASE_URL}/admin/categories`, {
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
    throw new Error(errorJson.message || `Failed to create category (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Update an existing category.
 */
export async function adminUpdateCategory(
  id: number,
  payload: { name?: string; slug?: string; description?: string; is_active?: boolean },
  token: string
): Promise<AdminCategoryItem> {
  const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
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
    throw new Error(errorJson.message || `Failed to update category (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Toggle category activation.
 */
export async function adminToggleCategory(id: number, token: string): Promise<AdminCategoryItem> {
  const res = await fetch(`${API_BASE_URL}/admin/categories/${id}/toggle`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to toggle category (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Delete a category if empty.
 */
export async function adminDeleteCategory(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Failed to delete category (${res.status})`);
  }
}
