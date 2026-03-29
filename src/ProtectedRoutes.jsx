import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { accessToken } = useContext(AuthContext);

  if (!accessToken) return <Navigate to="/login" replace />;

  return <Outlet />;
}
