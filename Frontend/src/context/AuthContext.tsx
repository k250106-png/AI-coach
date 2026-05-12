'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/src/services/firebase/firebase.client';
import { clearAuthCookies, getDemoAuthSession, type DemoAuthUser } from '@/src/services/firebase/auth';
import type { UserRole } from '@/src/services/auth';

type ResolvedUser = User | DemoAuthUser | null;
type ResolvedRole = UserRole | null;

interface AuthContextValue {
  user: ResolvedUser;
  authLoading: boolean;
  role: ResolvedRole;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8000'
).replace(/\/$/, '');

// Cache for role fetching with TTL
const roleCache = new Map<string, { role: ResolvedRole; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchRole(uid: string): Promise<ResolvedRole> {
  // Check cache first
  const cached = roleCache.get(uid);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.role;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/api/firebase/users/${encodeURIComponent(uid)}`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return 'CANDIDATE';
    }

    const data = await response.json().catch(() => ({}));
    const role = (data as { user?: { role?: unknown } })?.user?.role;
    const resolvedRole = String(role || '').toUpperCase() === 'RECRUITER'
      ? 'RECRUITER'
      : String(role || '').toUpperCase() === 'ADMIN'
        ? 'ADMIN'
        : 'CANDIDATE';
    
    // Cache the result
    roleCache.set(uid, { role: resolvedRole, timestamp: Date.now() });
    return resolvedRole;
  } catch {
    // On timeout or error, return default role
    return 'CANDIDATE';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ResolvedUser>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState<ResolvedRole>(null);

  const refreshRole = async () => {
    const demoSession = getDemoAuthSession();
    if (demoSession) {
      setUser(demoSession.user);
      setRole(demoSession.role);
      return;
    }

    if (!auth.currentUser) {
      setRole(null);
      return;
    }

    try {
      const nextRole = await fetchRole(auth.currentUser.uid);
      setRole(nextRole);
    } catch {
      setRole('CANDIDATE');
    }
  };

  useEffect(() => {
    const syncDemoSession = () => {
      const demoSession = getDemoAuthSession();
      if (demoSession) {
        setUser(demoSession.user);
        setRole(demoSession.role);
      } else if (!auth.currentUser) {
        setUser(null);
        setRole(null);
      }
      setAuthLoading(false);
    };

    const handleDemoSessionChange = () => {
      syncDemoSession();
    };

    window.addEventListener('demo_auth_changed', handleDemoSessionChange);

    const demoSession = getDemoAuthSession();
    if (demoSession) {
      syncDemoSession();
      return () => {
        window.removeEventListener('demo_auth_changed', handleDemoSessionChange);
      };
    }

    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      const currentDemoSession = getDemoAuthSession();
      if (currentDemoSession) {
        setUser(currentDemoSession.user);
        setRole(currentDemoSession.role);
        setAuthLoading(false);
        return;
      }

      setUser(currentUser);

      if (!currentUser) {
        clearAuthCookies();
        setRole(null);
        setAuthLoading(false);
        return;
      }

      try {
        const nextRole = await fetchRole(currentUser.uid);
        setRole(nextRole);
      } catch {
        setRole('CANDIDATE');
      } finally {
        setAuthLoading(false);
      }
    });

    return () => {
      window.removeEventListener('demo_auth_changed', handleDemoSessionChange);
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ user, authLoading, role, refreshRole }), [user, authLoading, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider.');
  }
  return context;
}
