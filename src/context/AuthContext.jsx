import { createContext, useState, useEffect } from "react";
import { getRoleFromToken } from "../utils/decodeToken";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(
    localStorage.getItem("accessToken"),
  );
  const [user, setUser] = useState(null);

  // ✅ SINGLE SOURCE OF TRUTH FOR TOKEN
  const setAccessToken = (token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
    setAccessTokenState(token);
  };

  // ✅ DECODE ROLE WHEN TOKEN CHANGES
  useEffect(() => {
    if (accessToken) {
      const role = getRoleFromToken(accessToken);
      setUser({ role });
    } else {
      setUser(null);
    }
  }, [accessToken]);

  // ✅ LISTEN FOR TOKEN REFRESH FROM apiFetch
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
        setAccessToken, // 🔥 use this everywhere
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
