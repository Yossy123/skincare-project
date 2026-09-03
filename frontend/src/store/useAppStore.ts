import { create } from 'zustand';
import { fetchHealth, HealthResponse } from '@/lib/api';

export type HealthState = 'idle' | 'loading' | 'healthy' | 'error';

interface AppStore {
  // Health & connection status
  healthState: HealthState;
  healthData: HealthResponse | null;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  errorMessage: string | null;

  // Actions
  checkBackendHealth: () => Promise<void>;
  resetHealth: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  healthState: 'idle',
  healthData: null,
  latencyMs: null,
  lastCheckedAt: null,
  errorMessage: null,

  checkBackendHealth: async () => {
    set({ healthState: 'loading', errorMessage: null });
    try {
      const { data, latencyMs } = await fetchHealth();
      set({
        healthState: data.status === 'ok' ? 'healthy' : 'error',
        healthData: data,
        latencyMs,
        lastCheckedAt: new Date().toLocaleTimeString(),
        errorMessage: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to connect to Laravel REST API';
      set({
        healthState: 'error',
        healthData: null,
        latencyMs: null,
        lastCheckedAt: new Date().toLocaleTimeString(),
        errorMessage: message,
      });
    }
  },

  resetHealth: () => {
    set({
      healthState: 'idle',
      healthData: null,
      latencyMs: null,
      lastCheckedAt: null,
      errorMessage: null,
    });
  },
}));
