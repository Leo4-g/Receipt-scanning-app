import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, userType: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from storage on app start
    const loadUser = async () => {
      try {
        const userJson = await SecureStore.getItemAsync('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would make an API call to authenticate
      // For demo purposes, we'll simulate a successful login
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on email
      let userType = 'employee';
      if (email.includes('accountant')) {
        userType = 'accountant';
      } else if (email.includes('admin')) {
        userType = 'admin';
      } else if (email.includes('owner')) {
        userType = 'owner';
      }
      
      const userData: User = {
        id: '123456',
        name: email.split('@')[0],
        email,
        userType,
      };
      
      // Save user to storage
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('Login successful:', userData);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, userType: string) => {
    try {
      // In a real app, this would make an API call to register the user
      // For demo purposes, we'll simulate a successful registration
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData: User = {
        id: '123456',
        name,
        email,
        userType,
      };
      
      // Save user to storage
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('Registration successful:', userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    try {
      // Clear user from storage
      await SecureStore.deleteItemAsync('user');
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
