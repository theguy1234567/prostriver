import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { apiFetch } from "../../utils/apiFetch";

export default function Login() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const { setAccessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const handleSignin = async () => {
    try {
      setError("");

      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      if (!data.accessToken) {
        throw new Error("No token received");
      }

      // ✅ FIXED
      localStorage.setItem("accessToken", data.accessToken);
      setAccessToken(data.accessToken);

      navigate("/app");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-sky-100 min-h-screen flex justify-center items-center">
      <div className="bg-red-100 h-[75vh] w-[60vw] rounded-2xl p-4 flex flex-row">
        {/* LEFT PANEL */}
        <div className="bg-[#D7CDCC] rounded-3xl flex flex-col items-center justify-center w-[40%]">
          <h1 className="font-garamound text-5xl">
            Login to <i>pro</i>strive
          </h1>

          <h1 className="font-garamound mt-5">Don’t have an account?</h1>

          <Link to="/signin" className="text-blue-600 underline mt-2">
            Sign up
          </Link>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-[#3DFAFF] rounded-4xl w-[60%] flex flex-col items-center justify-center">
          <label>Email</label>
          <input
            className="bg-white/70 backdrop-blur-md px-4 py-3 m-2 rounded-lg outline-none focus:ring-2 focus:ring-sky-400 transition shadow-sm"
            placeholder="Email"
            type="text"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />

          <label>Password</label>
          <input
            className="bg-white/70 backdrop-blur-md px-4 py-3 m-2 rounded-lg outline-none focus:ring-2 focus:ring-sky-400 transition shadow-sm"
            placeholder="Password"
            type="password" // ✅ fixed
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />

          {/* ERROR MESSAGE */}
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

          <button
            onClick={handleSignin}
            className="bg-sky-300 hover:bg-sky-400 transition rounded-2xl px-6 py-2 m-2 shadow"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
