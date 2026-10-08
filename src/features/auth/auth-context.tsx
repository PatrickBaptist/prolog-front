import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ACCESS_SESSION_KEY } from '../../shared/api/client';
import type { AuthUser, LoginResponse } from '../../shared/api/types';
import { authService } from './auth.service';

interface Session {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  authenticated: boolean;
  login: (matricula: string, password: string) => Promise<LoginResponse>;
  startSession: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function storedSession(): Session | null {
  const raw = sessionStorage.getItem(ACCESS_SESSION_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Session;
    return value.token && value.user?.id ? value : null;
  } catch {
    sessionStorage.removeItem(ACCESS_SESSION_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(storedSession);

  const startSession = useCallback((token: string, user: AuthUser) => {
    const next = { token, user };
    sessionStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ACCESS_SESSION_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    window.addEventListener('prolog:session-expired', logout);
    return () => window.removeEventListener('prolog:session-expired', logout);
  }, [logout]);

  const login = useCallback(async (matricula: string, password: string) => {
    const result = await authService.login(matricula, password);
    if (!result.requiresPasswordChange) startSession(result.token, result.user);
    return result;
  }, [startSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      authenticated: Boolean(session),
      login,
      startSession,
      logout,
    }),
    [login, logout, session, startSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return context;
}
