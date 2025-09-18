import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/utils/queryClient';
import { AppRoutes } from '@/routes';
import { useThemeStore } from '@/stores/themeStore';

function App() {
  // Initialize theme on app startup
  React.useEffect(() => {
    const { theme, applyTheme } = useThemeStore.getState();
    applyTheme(theme);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
