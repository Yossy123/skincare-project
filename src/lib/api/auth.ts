import { API_BASE_URL } from './client';
import type { HealthResponse, RegisterPayload, LoginPayload, AuthResponse, User } from './types';

/**
 * Fetch health status from Laravel backend.
 */
export async function fetchHealth(): Promise<{ data: HealthResponse; latencyMs: number }> {
  const startTime = performance.now();
  const res = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const latencyMs = Math.round(performance.now() - startTime);

  if (!res.ok) {
    throw new Error(`API returned HTTP ${res.status}: ${res.statusText}`);
  }

  const data: HealthResponse = await res.json();
  return { data, latencyMs };
}

/**
 * Register a new customer.
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data.errors
      ? Object.values(data.errors).flat().join(' ')
      : data.message || 'Registration failed';
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Login customer with email and password.
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data.errors
      ? Object.values(data.errors).flat().join(' ')
      : data.message || 'Login failed';
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Logout customer and revoke access token.
 */
export async function logoutUser(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

/**
 * Fetch current authenticated customer profile.
 */
export async function fetchMe(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Unauthenticated');
  }

  const json = await res.json();
  return json.user;
}
