import { API_BASE_URL } from './api/client';

/**
 * Backend origin without the /api suffix, used for serving storage assets.
 */
export function getBackendOrigin(): string {
  return API_BASE_URL.replace(/\/api\/?$/, '');
}

// Product photos used when the backend still contains a legacy storage path
// but the corresponding uploaded file is not available locally.
const PRODUCT_PHOTO_FALLBACKS: Record<string, string> = {
  'products/vitamin-c-serum.jpg':
    'https://images.unsplash.com/photo-1732861612355-c81b32c70075?auto=format&fit=crop&w=900&q=85',
  'products/barrier-cream.jpg':
    'https://wonderbeauties.blr1.digitaloceanspaces.com/production-storage/3281/%25D9%2585%25D8%25B1%25D8%25B7%25D8%25A8%25D8%25A7%25D8%AA.jpeg%3F_%3D1757252481658',
  'products/cleansing-balm.jpg':
    'https://images.unsplash.com/photo-1732861612244-5704d12e9397?auto=format&fit=crop&w=900&q=85',
  'products/cushion-foundation.jpg':
    'https://s3.cosmopolitan.co.id/1771208738.webp',
  'products/lip-tint-french-rose.jpg':
    'https://images.unsplash.com/photo-1687662008657-b94277bfb30e?auto=format&fit=crop&w=900&q=85',
  'products/liquid-blush.jpg':
    'https://images.unsplash.com/photo-1667242003851-e76e43823b8d?auto=format&fit=crop&w=900&q=85',
  'products/maison-rose-parfum.jpg':
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85',
  'products/solar-citrus.jpg':
    'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=900&q=85',
  'products/body-oil.jpg':
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85',
  'products/hair-mask.jpg':
    'https://images.unsplash.com/photo-1732861612355-c81b32c70075?auto=format&fit=crop&w=900&q=85',
};

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
  if (PRODUCT_PHOTO_FALLBACKS[value]) {
    return PRODUCT_PHOTO_FALLBACKS[value];
  }
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }
  const origin = getBackendOrigin();
  return value.startsWith('/') ? `${origin}${value}` : `${origin}/storage/${value}`;
}
