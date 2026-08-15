/**
 * AuthContext.tsx — ScriptureCast V2 Authenticated Application State (Phase A5)
 */

import * as React from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSetupRequired: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkSetupStatus: () => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isSetupRequired, setIsSetupRequired] = React.useState<boolean>(false);

  const checkSetupStatus = React.useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/setup/status", {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const required = Boolean(data.isSetupRequired);
        setIsSetupRequired(required);
        return required;
      }
    } catch (_err) {
      // Ignore network failures, fallback to false
    }
    return false;
  }, []);

  const refreshSession = React.useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          return;
        }
      }
      setCurrentUser(null);
    } catch (_err) {
      setCurrentUser(null);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);
      const setupReq = await checkSetupStatus();
      if (!setupReq) {
        await refreshSession();
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [checkSetupStatus, refreshSession]);

  const login = async (identifier: string, password: string): Promise<void> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    if (data.user) {
      setCurrentUser(data.user);
      setIsSetupRequired(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setCurrentUser(null);
    }
  };

  const value: AuthContextType = {
    currentUser,
    role: currentUser?.role ?? null,
    isAuthenticated: Boolean(currentUser),
    isLoading,
    isSetupRequired,
    login,
    logout,
    refreshSession,
    checkSetupStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
