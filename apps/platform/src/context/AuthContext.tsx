// MIKHLAFI LABS — Enterprise Authentication & Tenant Isolation Context
// Provides reactive session state, active tenant resolution, and RBAC metadata

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, UserProfile, TenantContext } from '../api/client';

interface AuthContextValue {
  user: UserProfile | null;
  tenant: TenantContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    nameEn: string;
    nameAr?: string;
    orgNameEn: string;
    orgNameAr?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<TenantContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const refreshAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
        setTenant(res.tenant);
        if (res.tenant?.organizationId) {
          api.setActiveOrganizationId(res.tenant.organizationId);
        }
      } else {
        setUser(null);
        setTenant(null);
        api.setActiveOrganizationId(null);
      }
    } catch {
      // 401 unauthenticated is a normal unauthenticated preview state
      setUser(null);
      setTenant(null);
      api.setActiveOrganizationId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setTenant(res.activeTenant);
      if (res.activeTenant?.organizationId) {
        api.setActiveOrganizationId(res.activeTenant.organizationId);
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    nameEn: string;
    nameAr?: string;
    orgNameEn: string;
    orgNameAr?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.register(data);
      // Fetch fresh session state and active tenant
      await refreshAuth();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setTenant(null);
      api.setActiveOrganizationId(null);
      setIsLoading(false);
    }
  };

  const switchOrganization = async (orgId: string) => {
    api.setActiveOrganizationId(orgId);
    await refreshAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated: !!user,
        isLoading,
        error,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        logout,
        switchOrganization,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
