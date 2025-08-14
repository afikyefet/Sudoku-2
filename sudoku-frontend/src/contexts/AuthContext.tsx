import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AuthContextType,
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse
} from '../types';
import { authAPI, handleApiError } from '../services/api';

/**
 * Authentication Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      const authResponse: AuthResponse = await authAPI.login(credentials);
      
      // Save to state
      setUser(authResponse.user);
      setToken(authResponse.token);
      
      // Save to localStorage
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register function
   */
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      setLoading(true);
      const authResponse: AuthResponse = await authAPI.register(credentials);
      
      // Save to state
      setUser(authResponse.user);
      setToken(authResponse.token);
      
      // Save to localStorage
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = (): void => {
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Context value
   */
  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;