import { API_BASE_URL } from './client';

export interface PaymentResponse {
  payment_id: number;
  token: string;
  redirect_url: string | null;
  amount: number;
}

export async function createPayment(orderId: number, token: string): Promise<PaymentResponse> {
  const res = await fetch(`${API_BASE_URL}/payments`, {
    method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ order_id: orderId }), cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Payment preparation failed.');
  return json.data;
}
