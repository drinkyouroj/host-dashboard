import { MantineProvider, createTheme } from '@mantine/core';
import { Global } from '@emotion/react';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactElement } from 'react';

// Import context providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ShowProvider } from './contexts/ShowContext';
import { StreamProvider } from './contexts/StreamContext';

// Import components
import HostDashboard from './pages/HostDashboard';
import Login from './pages/Login';
import { CallersTestPage } from './pages/CallersTestPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  console.log('ProtectedRoute: Rendering');
  const { isAuthenticated, loading } = useAuth();
  console.log('ProtectedRoute: isAuthenticated', isAuthenticated, 'loading', loading);

  if (loading) {
    console.log('ProtectedRoute: Loading...');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Rendering protected content');
  return <>{children}</>;
};

// Main App Wrapper
const AppContent = () => {
  console.log('AppContent: Rendering');
  return (
    <AuthProvider>
      <ShowProvider>
        <StreamProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HostDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test/callers"
              element={
                <ProtectedRoute>
                  <CallersTestPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StreamProvider>
      </ShowProvider>
    </AuthProvider>
  );
};

const queryClient = new QueryClient();

function App() {
  console.log('App: Rendering');
  const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>({
    key: 'mantine-color-scheme',
    defaultValue: 'dark',
  });
  
  console.log('App: colorScheme', colorScheme);

  const toggleColorScheme = (value?: 'light' | 'dark') =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  useHotkeys([['mod+J', () => toggleColorScheme()]]);
  
  // Define your color scheme
  const theme = createTheme({
    primaryColor: 'blue',
    colors: {
      // Customize your colors here
      dark: [
        '#d5d7e0',
        '#acaebf',
        '#8c8fa3',
        '#666980',
        '#4d4f66',
        '#34354a',
        '#2b2c3d',
        '#1d1e30',
        '#0c0d21',
        '#01010a',
      ],
    },
  });
  
  // Global styles component
  const GlobalStyles = () => {
    const darkMode = colorScheme === 'dark';
    return (
      <Global
        styles={{
          '*, *::before, *::after': {
            boxSizing: 'border-box',
          },
          body: {
            backgroundColor: darkMode ? '#1a1b1e' : '#f8f9fa',
            color: darkMode ? '#fff' : '#000',
            lineHeight: 1.5,
            margin: 0,
            padding: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          },
        }}
      />
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={theme}
        defaultColorScheme="dark"
      >
        <GlobalStyles />
        <ModalsProvider>
          <Notifications position="top-right" />
          <AppContent />
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
