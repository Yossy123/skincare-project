import { API_BASE_URL } from './client';
import type { Address, AddressPayload } from './types';

/**
 * Fetch shipping addresses for authenticated user.
 */
export async function fetchAddresses(token: string): Promise<Address[]> {
  const res = await fetch(`${API_BASE_URL}/addresses`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch addresses (${res.status})`);
  }

  const json = await res.json();
  return json.data || [];
}

/**
 * Create a new shipping address.
 */
export async function createAddress(payload: AddressPayload, token: string): Promise<Address> {
  const res = await fetch(`${API_BASE_URL}/addresses`, {
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
      : json.message || 'Failed to create address';
    throw new Error(errorMsg);
  }

  return json.data;
}

/**
 * Update an existing shipping address.
 */
export async function updateAddress(id: number, payload: Partial<AddressPayload>, token: string): Promise<Address> {
  const res = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: 'PUT',
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
      : json.message || 'Failed to update address';
    throw new Error(errorMsg);
  }

  return json.data;
}

/**
 * Delete a shipping address.
 */
export async function deleteAddress(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Failed to delete address (${res.status})`);
  }
}
