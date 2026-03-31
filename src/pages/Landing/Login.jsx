import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { apiFetch } from "../../utils/apiFetch";
import toast from "react-hot-toast";

export default function Login() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const { setAccessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!user.email || !user.password) {
      toast.error("Email and password are required");
      return;
    }

    if (!emailRegex.test(user.email)) {
      toast.error("Enter a valid email");
      return;
    }

    try {
      setLoading(true);

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

      setAccessToken(data.accessToken);

      toast.success("Welcome back!");
      navigate("/app");
    } catch (err) {
      if (err.status === 401) {
        toast.error("Invalid email or password");
      } else if (err.status === 403) {
        toast.error("Email not verified");
      } else {
        toast.error(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-sky-100 min-h-screen flex justify-center items-center px-4 py-6">
      <div className="bg-red-100 w-full max-w-6xl min-h-[85vh] rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        {/* LEFT PANEL */}
        <div className="bg-[#D7CDCC] rounded-3xl flex flex-col p-6 items-center justify-center w-full md:w-[40%] text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-averaiserif leading-tight">
            Login to <i className="font-garamound">pro</i>strive
          </h1>

          <h1 className="font-averaiserif mt-5 text-sm sm:text-base">
            Don’t have an account?
          </h1>

          <Link
            to="/signin"
            className="text-blue-600 underline mt-2 font-averaiserif"
          >
            Sign up
          </Link>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-[#3DFAFF] rounded-3xl md:rounded-4xl w-full md:w-[60%] flex flex-col items-center justify-center px-6 sm:px-10 py-8">
          <div className="w-full max-w-md">
            <label className="block mb-2 font-medium">Email</label>
            <input
              className="w-full bg-white/70 backdrop-blur-md px-4 py-3 mb-4 rounded-lg outline-none focus:ring-2 focus:ring-sky-400 transition shadow-sm"
              placeholder="Email"
              type="text"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />

            <label className="block mb-2 font-medium">Password</label>
            <input
              className="w-full bg-white/70 backdrop-blur-md px-4 py-3 mb-6 rounded-lg outline-none focus:ring-2 focus:ring-sky-400 transition shadow-sm"
              placeholder="Password"
              type="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />

            <button
              onClick={handleSignin}
              disabled={loading}
              className="w-full bg-sky-300 hover:bg-sky-400 transition rounded-2xl px-6 py-3 shadow disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
