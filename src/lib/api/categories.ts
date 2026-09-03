import { API_BASE_URL } from './client';
import type { Category } from './types';

/**
 * Fetch list of active categories.
 */
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories (${res.status})`);
  }

  const json = await res.json();
  return json.data || [];
}

/**
 * Fetch single category by slug.
 */
export async function fetchCategoryBySlug(slug: string): Promise<Category> {
  const res = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(slug)}`, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (res.status === 404) {
    throw new Error('Category not found');
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch category (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}
