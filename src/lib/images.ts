import { API_BASE_URL } from './api/client';

/**
 * Backend origin without the /api suffix, used for serving storage assets.
 */
export function getBackendOrigin(): string {
  return API_BASE_URL.replace(/\/api\/?$/, '');
}

/**
 * Resolve a product image reference to a URL:
 * absolute http(s)/data URLs pass through; relative paths are treated as
 * backend storage paths (e.g. "products/serum.jpg" -> origin/storage/products/serum.jpg).
 */
export function resolveProductImage(image?: string | null): string | null {
  const value = (image ?? '').trim();
  if (!value) {
    return null;
  }
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }
  const origin = getBackendOrigin();
  return value.startsWith('/') ? `${origin}${value}` : `${origin}/storage/${value}`;
}
