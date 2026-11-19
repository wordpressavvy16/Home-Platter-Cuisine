import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, MealProvider } from '../types';
import * as authApi from '../api/authApi';
import * as providerApi from '../api/providerApi';

interface LoginResult {
  mfaRequired: boolean;
  mfaToken?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // For actions like login/signup
  isInitializing: boolean; // For initial app load
  isProviderSetupComplete: boolean | null;
  providerProfile: MealProvider | null;
  justLoggedIn: boolean;
  setJustLoggedIn: (status: boolean) => void;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResult | null>;
  signup: (name: string, email: string, password: string, role: User['role']) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  verifyLoginWithMfa: (mfaToken: string, otp: string) => Promise<void>;
  refreshProviderProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [providerProfile, setProviderProfile] = useState<MealProvider | null>(null);
  
  const clearError = useCallback(() => setError(null), []);

  const storeAuthData = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('homeplatter-user', JSON.stringify(userData));
    localStorage.setItem('homeplatter-token', authToken);
  };

  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    setProviderProfile(null);
    localStorage.removeItem('homeplatter-user');
    localStorage.removeItem('homeplatter-token');
  };

  const refreshProviderProfile = useCallback(async () => {
    const localUserStr = localStorage.getItem('homeplatter-user');
    const localToken = localStorage.getItem('homeplatter-token');
    if (!localUserStr || !localToken) return;
    
    const localUser: User = JSON.parse(localUserStr);

    if (localUser?.role === 'PROVIDER' && localToken) {
      try {
        const profile = await providerApi.getProviderByUserId(localUser.id, localToken);
        setProviderProfile(profile || null);
      } catch (e) {
        console.error("Failed to refresh provider profile", e);
        setProviderProfile(null);
      }
    }
  }, []);

  useEffect(() => {
    const checkLoggedIn = async () => {
      setIsInitializing(true);
      try {
        const storedUser = localStorage.getItem('homeplatter-user');
        const storedToken = localStorage.getItem('homeplatter-token');

        if (storedUser && storedToken) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          if (parsedUser.role === 'PROVIDER') {
            await refreshProviderProfile();
          }
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
        clearAuthData();
      } finally {
        setIsInitializing(false);
      }
    };
    checkLoggedIn();
  }, [refreshProviderProfile]);


  const login = async (email: string, password: string): Promise<LoginResult | null> => {
    clearError();
    setIsLoading(true);
    try {
      const data = await authApi.login(email, password);
      
      if (data.mfaRequired) {
        return { mfaRequired: true, mfaToken: data.mfaToken };
      }

      storeAuthData(data.user!, data.token!);
      if (data.user!.role === 'PROVIDER') {
          await refreshProviderProfile();
      }
      setJustLoggedIn(true);
      return { mfaRequired: false };

    } catch (err: any) {
      setError(err.message || 'Login failed.');
      return null; // Return null on failure instead of throwing
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyLoginWithMfa = async (mfaToken: string, otp: string) => {
    clearError();
    setIsLoading(true);
    try {
      const { user, token } = await authApi.verifyLoginMfa(mfaToken, otp);
      storeAuthData(user, token);
      if (user.role === 'PROVIDER') {
        await refreshProviderProfile();
      }
      setJustLoggedIn(true);
    } catch (err: any) {
      setError(err.message || 'MFA verification failed.');
      throw err; // Re-throw to be caught in the UI form
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: User['role']): Promise<boolean> => {
    clearError();
    setIsLoading(true);
    try {
      const { user, token } = await authApi.signup(name, email, password, role);
      storeAuthData(user, token);
      if (user.role === 'PROVIDER') {
        await refreshProviderProfile();
      }
      setJustLoggedIn(true);
      return true;
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      clearAuthData();
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user && !!token;
  const isProviderSetupComplete = providerProfile?.isSetupComplete ?? null;

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitializing,
    isProviderSetupComplete,
    providerProfile,
    justLoggedIn,
    setJustLoggedIn,
    error,
    login,
    signup,
    logout,
    clearError,
    verifyLoginWithMfa,
    refreshProviderProfile
  }), [user, token, isAuthenticated, isLoading, isInitializing, isProviderSetupComplete, providerProfile, justLoggedIn, error, refreshProviderProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};