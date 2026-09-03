import { API_BASE_URL } from './client';
import type { CheckoutValidatePayload, CheckoutValidationResponse } from './types';

/**
 * Validate checkout cart items and calculate server-authoritative totals.
 */
export async function validateCheckout(
  payload: CheckoutValidatePayload,
  token: string
): Promise<CheckoutValidationResponse> {
  const res = await fetch(`${API_BASE_URL}/checkout/validate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const json = await res.json();

  if (!res.ok) {
    const errorMsg = json.errors
      ? Object.values(json.errors).flat().join(' ')
      : json.message || 'Checkout validation failed';
    throw new Error(errorMsg);
  }

  return json;
}
