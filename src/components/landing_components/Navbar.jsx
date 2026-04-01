import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingNavbar() {
  const navigate = useNavigate();

  return (
    <div
      className="fixed top-0 left-0  w-full z-50
      bg-sky-400/70 backdrop-blur-md
      flex justify-between items-center
      px-6 py-2 text-white shadow-md"
    >
      {/* Logo */}
      <h1
        className="font-garamound text-gray-900 select-none text-xl cursor-pointer"
        onClick={() => navigate("/")}
      >
        Prostriver.
      </h1>

      {/* Nav Links */}
      <div className="flex items-center gap-6 text-sm">
        {/* <button
          onClick={() => navigate("/")}
          className="hover:text-lime-300 transition"
        >
          Home
        </button> */}

        {/* <button
          onClick={() => navigate("/about")}
          className="hover:text-lime-300 transition"
        >
          About
        </button> */}

        <button
          onClick={() => navigate("/login")}
          className="hover:text-lime-300 transition"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
