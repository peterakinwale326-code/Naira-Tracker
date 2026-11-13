"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface SavedCalculation {
  id: string;
  title: string;
  amount: number;
  baseYear: number;
  targetYear: number;
  equivalentAmount: number;
  lossPercent: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  socialLogin: (provider: string, email: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  saveCalculation: (data: {
    title: string;
    amount: number;
    baseYear: number;
    targetYear: number;
    equivalentAmount: number;
    lossPercent: number;
  }) => Promise<{ success: boolean; error?: string }>;
  savedCalculations: SavedCalculation[];
  fetchSavedCalculations: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = `${API_BASE_URL}/api/v1/auth`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check stored token on load
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("naira_tracker_token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const profile = await res.json();
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role || "USER",
            createdAt: profile.createdAt,
          });
          if (profile.savedCalculations) {
            setSavedCalculations(profile.savedCalculations);
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem("naira_tracker_token");
          setToken(null);
          setUser(null);
        }
      } catch {
        // Backend offline or error
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Login failed" };
      }

      localStorage.setItem("naira_tracker_token", data.token);
      setToken(data.token);
      setUser({
        ...data.user,
        role: data.user.role || "USER",
      });
      fetchSavedCalculations(data.token);
      return { success: true };
    } catch {
      return { success: false, error: "Network error connecting to auth server" };
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Login failed" };
      }
      if (data.user?.role !== "ADMIN") {
        return { success: false, error: "This account does not have administrator access." };
      }

      localStorage.setItem("naira_tracker_token", data.token);
      setToken(data.token);
      setUser({ ...data.user, role: "ADMIN" });
      fetchSavedCalculations(data.token);
      return { success: true };
    } catch {
      return { success: false, error: "Network error connecting to auth server" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Registration failed" };
      }

      localStorage.setItem("naira_tracker_token", data.token);
      setToken(data.token);
      setUser({
        ...data.user,
        role: data.user.role || "USER",
      });
      return { success: true };
    } catch {
      return { success: false, error: "Network error connecting to auth server" };
    }
  };

  const socialLogin = async (_provider: string, _email: string, _name: string) => {
    return { success: false, error: "Social sign-in is not configured. Please use your email and password." };
  };

  const logout = () => {
    localStorage.removeItem("naira_tracker_token");
    setToken(null);
    setUser(null);
    setSavedCalculations([]);
  };

  const fetchSavedCalculations = async (currentToken?: string) => {
    const activeToken = currentToken || token;
    if (!activeToken) return;

    try {
      const res = await fetch(`${API_BASE}/calculations`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedCalculations(data);
      }
    } catch {
      // Ignore
    }
  };

  const saveCalculation = async (data: {
    title: string;
    amount: number;
    baseYear: number;
    targetYear: number;
    equivalentAmount: number;
    lossPercent: number;
  }) => {
    if (!token) {
      return { success: false, error: "Must be logged in to save calculations" };
    }

    try {
      const res = await fetch(`${API_BASE}/calculations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await fetchSavedCalculations();
        return { success: true };
      }
      return { success: false, error: "Failed to save calculation" };
    } catch {
      return { success: false, error: "Server communication error" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        adminLogin,
        register,
        socialLogin,
        logout,
        saveCalculation,
        savedCalculations,
        fetchSavedCalculations: () => fetchSavedCalculations(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
