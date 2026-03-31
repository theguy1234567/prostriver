import { createContext, useState, useEffect } from "react";
import { getRoleFromToken } from "../utils/decodeToken";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(
    localStorage.getItem("accessToken"),
  );
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const setAccessToken = (token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }

    setAccessTokenState(token);
  };

  // Decode role whenever token changes
  useEffect(() => {
    if (accessToken) {
      const role = getRoleFromToken(accessToken);
      setUser({ role });
    } else {
      setUser(null);
    }
  }, [accessToken]);

  //  IMPORTANT: Refresh token when app first loads
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          credentials: "include", // this is required evrywhere
          
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

  //  Listen for refresh event from apiFetch
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
