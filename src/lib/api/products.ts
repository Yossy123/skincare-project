import { API_BASE_URL } from './client';
import type { Product, PaginatedResponse, ProductFilterParams } from './types';

/**
 * Fetch paginated products with query filters.
 */
export async function fetchProducts(params: ProductFilterParams = {}): Promise<PaginatedResponse<Product>> {
  const query = new URLSearchParams();

  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.sort) query.set('sort', params.sort);
  if (params.page) query.set('page', params.page.toString());
  if (params.per_page) query.set('per_page', params.per_page.toString());

  const url = `${API_BASE_URL}/products?${query.toString()}`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products (${res.status})`);
  }

  return res.json();
}

/**
 * Fetch single product by slug.
 */
export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(slug)}`, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (res.status === 404) {
    throw new Error('Product not found');
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch product (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}
