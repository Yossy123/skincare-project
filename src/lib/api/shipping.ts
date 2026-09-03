import { API_BASE_URL } from './client';
import type { ShippingRatePayload, ShippingRate, DestinationResult } from './types';

/**
 * Calculate domestic shipping rates from couriers (JNE, SiCepat, J&T, POS, TIKI).
 */
export async function fetchShippingRates(
  payload: ShippingRatePayload,
  token?: string
): Promise<ShippingRate[]> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/shipping/rates`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const json = await res.json();

  if (!res.ok) {
    const errorMsg = json.errors
      ? Object.values(json.errors).flat().join(' ')
      : json.message || 'Failed to calculate shipping rates';
    throw new Error(errorMsg);
  }

  return json.data || [];
}

/**
 * Search RajaOngkir domestic destination locations.
 */
export async function searchDestinations(query: string): Promise<DestinationResult[]> {
  const res = await fetch(`${API_BASE_URL}/shipping/destinations?search=${encodeURIComponent(query)}`, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to search destination locations');
  }

  const json = await res.json();
  return json.data || [];
}
