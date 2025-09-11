// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AxiosError } from 'axios';
import { apiClient } from '@/services/api';
import type { User, ApiResponse } from '@/types/api'; // adjust if your User type lives elsewhere

// ---- Types for auth payloads ----
type LoginSuccessData = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

type RegisterSuccessData = LoginSuccessData;

type RefreshSuccessData = LoginSuccessData;

type BackendError = { message: string };

// Narrow plain backend error `{ message: string }` (e.g., 401)
const isBackendError = (v: unknown): v is BackendError =>
  typeof v === 'object' && v !== null && 'message' in v && typeof (v as any).message === 'string';

// ---- Store state/actions ----
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // --- Initial state ---
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // --- Actions ---
      async login(email, password) {
        set({ isLoading: true, error: null });

        try {
          debugger
          // apiClient.login may return either BackendError or ApiResponse<LoginSuccessData>
          const response = (await apiClient.login(email, password)) as BackendError | ApiResponse<LoginSuccessData>;

          // Case A: backend returned plain error JSON (e.g., 401)
          if (isBackendError(response)) {
            set({ isLoading: false, error: response.message });
            return false;
          }

          // Case B: backend success response
          if (response != null && 'token' in response) {
            const { token, email: userEmail, firstName, lastName } = response;

            apiClient.setToken(token);

            set({
              user: { email: userEmail, firstName, lastName },
              accessToken: token,   // ✅ use token directly
              refreshToken: null,   // ✅ backend doesn’t provide it yet
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return true;
          }

          // Case C: normalized API error
          set({
            isLoading: false,
            error: response.error?.message ?? 'Login failed',
          });
          return false;
        } catch (err) {
          const axErr = err as AxiosError<BackendError>;
          set({
            isLoading: false,
            error: axErr.response?.data?.message ?? 'Network error occurred',
          });
          return false;
        }
      },

      async register(userData) {
        set({ isLoading: true, error: null });

        try {
          const response = (await apiClient.register(userData)) as BackendError | ApiResponse<RegisterSuccessData>;

          if (isBackendError(response)) {
            set({ isLoading: false, error: response.message });
            return false;
          }

          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;

            apiClient.setToken(accessToken);

            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return true;
          }

          set({
            isLoading: false,
            error: response.error?.message ?? 'Registration failed',
          });
          return false;
        } catch (err) {
          const axErr = err as AxiosError<BackendError>;
          set({
            isLoading: false,
            error: axErr.response?.data?.message ?? 'Network error occurred',
          });
          return false;
        }
      },

      logout() {
        apiClient.setToken(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      async refreshAuth() {
        const currentRefresh = get().refreshToken;
        if (!currentRefresh) {
          get().logout();
          return false;
        }

        try {
          const response = (await apiClient.refreshToken(currentRefresh)) as BackendError | ApiResponse<RefreshSuccessData>;

          if (isBackendError(response)) {
            get().logout();
            return false;
          }

          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;

            apiClient.setToken(accessToken);

            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              error: null,
            });

            return true;
          }

          get().logout();
          return false;
        } catch {
          get().logout();
          return false;
        }
      },

      clearError() {
        set({ error: null });
      },

      setLoading(loading: boolean) {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Ensure Authorization header gets set after rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          apiClient.setToken(state.accessToken);
        }
      },
    }
  )
);
