import { MantineProvider, createTheme, MantineColorsTuple } from '@mantine/core';
import { Global } from '@emotion/react';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Import React to ensure JSX works
import React from 'react';

// Contexts
const AuthContext = React.createContext({});
const ShowContext = React.createContext({});
const StreamContext = React.createContext({});

// Mock components to satisfy TypeScript
const HostDashboard = () => <div>Host Dashboard</div>;
const Login = () => <div>Login</div>;

// Mock hooks
const useAuth = () => ({
  isAuthenticated: false,
  loading: false,
});

// Mock providers
const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>
);

const ShowProvider = ({ children }: { children: React.ReactNode }) => (
  <ShowContext.Provider value={{ addCaller: () => {} }}>{children}</ShowContext.Provider>
);

const StreamProvider = ({ children }: { children: React.ReactNode }) => (
  <StreamContext.Provider value={{}}>{children}</StreamContext.Provider>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // You can add a loading spinner here
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const queryClient = new QueryClient();

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>({
    key: 'mantine-color-scheme',
    defaultValue: 'dark',
  });

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
            <AuthProvider>
              <ShowProvider>
                <StreamProvider>
                  <Router>
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
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Router>
                </StreamProvider>
              </ShowProvider>
            </AuthProvider>
          </ModalsProvider>
        </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
