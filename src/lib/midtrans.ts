/**
 * Midtrans Snap frontend integration (popup mode via snap.js).
 *
 * The snap.js script exposes `window.snap`. It requires the Midtrans client key
 * (public by design) and a different host per environment:
 *   - sandbox:    https://app.sandbox.midtrans.com/snap/snap.js
 *   - production: https://app.midtrans.com/snap/snap.js
 */

export interface SnapPaymentResult {
  order_id?: string;
  status_code?: string;
  transaction_status?: string;
  payment_type?: string;
  [key: string]: unknown;
}

export interface SnapCallbacks {
  onSuccess?: (result: SnapPaymentResult) => void;
  onPending?: (result: SnapPaymentResult) => void;
  onError?: (result: SnapPaymentResult) => void;
  onClose?: () => void;
}

interface SnapGlobal {
  pay: (token: string, options?: SnapCallbacks) => void;
  hide?: () => void;
}

declare global {
  interface Window {
    snap?: SnapGlobal;
  }
}

const SNAPPY_SCRIPT_ID = 'midtrans-snap-js';

export function isMidtransProduction(): boolean {
  return process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
}

export function getMidtransClientKey(): string {
  return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
}

function snapScriptUrl(): string {
  return isMidtransProduction()
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';
}

let snapLoadPromise: Promise<SnapGlobal> | null = null;

export function loadSnap(): Promise<SnapGlobal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Midtrans Snap hanya tersedia di browser.'));
  }

  if (window.snap) {
    return Promise.resolve(window.snap);
  }

  if (snapLoadPromise) {
    return snapLoadPromise;
  }

  const clientKey = getMidtransClientKey();
  if (!clientKey) {
    return Promise.reject(new Error('Midtrans client key is not configured.'));
  }

  snapLoadPromise = new Promise<SnapGlobal>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SNAPPY_SCRIPT_ID;
    script.src = snapScriptUrl();
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    script.onload = () => {
      if (window.snap) {
        resolve(window.snap);
      } else {
        reject(new Error('Midtrans Snap failed to initialize.'));
      }
    };
    script.onerror = () => {
      snapLoadPromise = null;
      reject(new Error('Midtrans Snap script failed to load.'));
    };
    document.head.appendChild(script);
  });

  return snapLoadPromise;
}

/**
 * Opens the Snap payment popup with the given transaction token.
 * Returns false when the embedded popup is unavailable so the caller can
 * fall back to the hosted redirect URL.
 */
export async function payWithSnap(token: string, callbacks: SnapCallbacks): Promise<boolean> {
  try {
    const snap = await loadSnap();
    snap.pay(token, callbacks);
    return true;
  } catch {
    return false;
  }
}
