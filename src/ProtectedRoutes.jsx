import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { accessToken, authLoading } = useContext(AuthContext);

  // wait until initial refresh check completes
  // check public if not working
  if (authLoading) {
    return (
      <div
        className="transition-all duration-1000 min-h-screen w-screen flex justify-center items-center font-averaiserif sm:text-5xl text-2xl font-bold"
        style={{
          animation: "fadePulse 1.5s ease-in-out infinite",
        }}
      >
        Getting things ready for you ...
      </div>
    );
  }

  // only redirect after loading finishes
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
