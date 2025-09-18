import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'blue';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  applyTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',

      setTheme: (theme: Theme) => {
        set({ theme });
        get().applyTheme(theme);
      },

      applyTheme: (theme: Theme) => {
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme);

        // Also apply to body element for immediate effect
        document.body.setAttribute('data-theme', theme);
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Apply theme after rehydration
        if (state?.theme) {
          state.applyTheme(state.theme);
        }
      },
    }
  )
);