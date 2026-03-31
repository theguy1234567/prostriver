import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

export default function Public() {
  const { accessToken, authLoading } = useContext(AuthContext);

  if (authLoading) {
    return (
      <>
        <div>New access token generating hold on</div>
      </>
    );
  }

  if (accessToken) {
    console.log("new access generated redirecting to /app");

    return <Navigate to="/app" replace />;
  }
  return <Outlet />;
}
