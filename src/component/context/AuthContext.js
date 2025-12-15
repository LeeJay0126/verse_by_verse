import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../utils/ApiFetch";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // On mount: ask the server if we already have a session
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch(`/auth/me`);

        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }

        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          if (data?.ok && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
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
    const res = await apiFetch(`/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });


    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.ok === false) {
      throw new Error(data?.error || "Login failed");
    }

    setUser(data.user);
    return data.user;
  }


  // Logout: call /auth/logout, clear `user`
  async function logout() {
    try {
      await apiFetch(`/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
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

// Custom hook for convenience
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
