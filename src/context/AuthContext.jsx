import { createContext, useState, useEffect } from "react";
import { getRoleFromToken } from "../utils/decodeToken";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(
    localStorage.getItem("accessToken"),
  );
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authLoading, setAuthLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const setAccessToken = (token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }

    setAccessTokenState(token);
  };

  useEffect(() => {
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

        const updatedUser = {
          ...savedUser,
          role: payload.role,
          fullName:
            payload.fullName ||
            payload.name ||
            savedUser.fullName ||
            savedUser.email ||
            payload.email,
          email: payload.email || savedUser.email,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (err) {
        console.error("Token decode failed:", err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [accessToken]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();

          if (data.accessToken) {
            setAccessToken(data.accessToken);
          }
        } else {
          setAccessToken(null);
        }
      } catch (err) {
        console.error("Initial refresh failed:", err);
        setAccessToken(null);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  useEffect(() => {
    const handleTokenRefresh = (e) => {
      setAccessToken(e.detail);
    };

    const handleLogout = () => {
      setAccessToken(null);
    };

    window.addEventListener("tokenRefreshed", handleTokenRefresh);
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("tokenRefreshed", handleTokenRefresh);
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        user,
        setUser,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
