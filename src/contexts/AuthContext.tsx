import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'host' | 'guest';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on initial load
    const checkAuth = async () => {
      try {
        // In a real app, you would verify the session with your backend
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token and get user data
          // This is a mock implementation
          const mockUser = {
            id: '1',
            email: 'host@example.com',
            name: 'Show Host',
            role: 'host' as const,
          };
          setUser(mockUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, you would make an API call to your backend
      if (email === 'host@example.com' && password === 'password') {
        const mockUser = {
          id: '1',
          email,
          name: 'Show Host',
          role: 'host' as const,
        };
        
        // Mock token
        const token = 'mock-jwt-token';
        localStorage.setItem('token', token);
        setUser(mockUser);
        navigate('/');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      showNotification({
        title: 'Login Failed',
        message: 'Invalid email or password',
        color: 'red',
        icon: <IconX size={16} />,
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
