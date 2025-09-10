import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/api';
import { apiClient } from '@/services/api';

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
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.login(email, password);
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;
            
            // Set token in API client
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
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Login failed',
            });
            return false;
          }
        } catch {
          set({
            isLoading: false,
            error: 'Network error occurred',
          });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.register(userData);
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;
            
            // Set token in API client
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
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Registration failed',
            });
            return false;
          }
        } catch {
          set({
            isLoading: false,
            error: 'Network error occurred',
          });
          return false;
        }
      },

      logout: () => {
        // Clear token from API client
        apiClient.setToken(null);
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          get().logout();
          return false;
        }

        try {
          const response = await apiClient.refreshToken(refreshToken);
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken: newRefreshToken } = response.data;
            
            // Set token in API client
            apiClient.setToken(accessToken);
            
            set({
              user,
              accessToken,
              refreshToken: newRefreshToken,
              isAuthenticated: true,
              error: null,
            });
            
            return true;
          } else {
            get().logout();
            return false;
          }
        } catch {
          get().logout();
          return false;
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);