import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingNavbar() {
  const navigate = useNavigate();

  return (
    <div
      className="absolute top-6 left-1/2 -translate-x-1/2 z-20 
                 bg-white/20 backdrop-blur-md 
                 px-8 py-3 rounded-full 
                 flex gap-8 text-white shadow-lg"
    >
      <button
        onClick={() => navigate("/")}
        className="hover:text-lime-300 transition"
      >
        Home
      </button>

      <button
        onClick={() => navigate("/about")}
        className="hover:text-lime-300 transition"
      >
        About
      </button>

      <button
        onClick={() => navigate("/signin")}
        className="hover:text-lime-300 transition"
      >
        Sign In
      </button>
    </div>
  );
}
