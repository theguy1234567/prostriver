import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  if (user.role !== "ADMIN") {
    return (
      <div className="p-10 text-red-500 text-xl">
        🚫 Access Denied (Admin Only)
      </div>
    );
  }

  return <Outlet />;
}
