import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../utils/ApiFetch";
import { createAuthApi } from "@verse/shared";

const AuthContext = createContext(null);

const authApi = createAuthApi({ apiFetch });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { user } = await authApi.getCurrentUser();
        if (!cancelled) setUser(user);
      } catch (err) {
        console.error("[auth] /auth/me error", err);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(identifier, password) {
    const user = await authApi.login(identifier, password);
    setUser(user);
    return user;
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("[auth] logout error", err);
    } finally {
      setUser(null);
    }
  }

  const value = {
    user,
    setUser,
    initializing,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
