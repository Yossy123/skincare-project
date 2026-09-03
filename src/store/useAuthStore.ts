import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useSyncExternalStore } from 'react';
import {
  User,
  LoginPayload,
  RegisterPayload,
  loginUser,
  registerUser,
  logoutUser as apiLogoutUser,
} from '@/lib/api';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (payload: LoginPayload) => {
        set({ loading: true, error: null });
        try {
          const res = await loginUser(payload);
          set({
            user: res.user,
            token: res.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          return true;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Login failed';
          set({ loading: false, error: msg });
          return false;
        }
      },

      register: async (payload: RegisterPayload) => {
        set({ loading: true, error: null });
        try {
          const res = await registerUser(payload);
          set({
            user: res.user,
            token: res.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          return true;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Registration failed';
          set({ loading: false, error: msg });
          return false;
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },

      logout: async () => {
        const { token } = get();
        if (token) {
          try {
            await apiLogoutUser(token);
          } catch (err) {
            console.error('Logout error:', err);
          }
        }
        get().clearAuth();
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: 'lumiere-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

const emptySubscribe = () => () => {};

/**
 * Custom React hook to safely wait for client-side Zustand auth hydration.
 * Uses useSyncExternalStore to prevent SSR mismatch errors in Next.js without cascading renders.
 */
export function useAuthHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
