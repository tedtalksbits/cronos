import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { AppProvider } from './providers/AppProvider.tsx';
import { ThemeProvider } from './providers/themeProvider.tsx';
import ReactQueryProvider from './providers/ReactQueryProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      {/* <AuthProvider> */}
      <ReactQueryProvider>
        <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
          <App />
        </ThemeProvider>
      </ReactQueryProvider>
      {/* </AuthProvider> */}
    </AppProvider>
  </StrictMode>
);
