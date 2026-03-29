import { createContext, useState, useEffect } from "react";
import { getRoleFromToken } from "../utils/decodeToken";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  // ✅ LOAD TOKEN ON APP START
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAccessToken(token);
    }
  }, []);

  // ✅ DECODE ROLE
  useEffect(() => {
    if (accessToken) {
      const role = getRoleFromToken(accessToken);
      setUser({ role });
    } else {
      setUser(null);
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
