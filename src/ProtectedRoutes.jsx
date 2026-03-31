import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { accessToken, authLoading } = useContext(AuthContext);

  //  wait until initial refresh check completes
  if (authLoading) {
    return <div>Loading...</div>;
  }

  //  only redirect after loading finishes
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
