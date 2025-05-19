import { MantineProvider, ColorSchemeProvider, ColorScheme, Global } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ShowProvider } from './contexts/ShowContext';
import HostDashboard from './pages/HostDashboard';
import Login from './pages/Login';

const queryClient = new QueryClient();

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'dark',
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  useHotkeys([['mod+J', () => toggleColorScheme()]]);

  return (
    <QueryClientProvider client={queryClient}>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider
          theme={{
            colorScheme,
            colors: {
              brand: [
                '#f0f9ff',
                '#e0f2fe',
                '#bae6fd',
                '#7dd3fc',
                '#38bdf8',
                '#0ea5e9',
                '#0284c7',
                '#0369a1',
                '#075985',
                '#0c4a6e',
              ],
            },
            primaryColor: 'brand',
          }}
          withGlobalStyles
          withNormalizeCSS
        >
          <Global
            styles={(theme) => ({
              '*, *::before, *::after': {
                boxSizing: 'border-box',
              },
              body: {
                ...theme.fn.fontStyles(),
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
                color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
                lineHeight: theme.lineHeight,
              },
            })}
          />
          <ModalsProvider>
            <Notifications position="top-right" />
            <AuthProvider>
              <ShowProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<HostDashboard />} />
                  </Routes>
                </Router>
              </ShowProvider>
            </AuthProvider>
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </QueryClientProvider>
  );
}

export default App;
