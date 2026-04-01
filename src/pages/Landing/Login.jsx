import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { apiFetch } from "../../utils/apiFetch";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setAccessToken, setUser: setAuthUser } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

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

      const userData = {
        email: user.email,
        fullName: user.email,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setAuthUser(userData);
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
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4 py-6">
      <div
        className={`w-full max-w-6xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden grid md:grid-cols-2 transition-all duration-700 ease-out ${
          fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Left Branding Panel */}
        <div className="hidden md:flex flex-col justify-center px-10 lg:px-16 py-12 border-r border-zinc-200 dark:border-zinc-800 bg-amber-300 dark:bg-zinc-900">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 mb-4">
            ProStriver
          </p>

          <h1 className="text-5xl lg:text-6xl font-garamound leading-tight text-zinc-900 dark:text-white">
            Login to <i>pro</i>striver
          </h1>

          <p className="mt-6 text-zinc-500 dark:text-zinc-400 text-lg leading-8"></p>

          <div className="mt-10">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Don’t have an account?
            </p>
            <Link
              to="/signin"
              className="mt-2 inline-block text-zinc-900 dark:text-white font-medium hover:underline"
            >
              Create one now →
            </Link>
          </div>
        </div>

        {/* Right Login Form */}
        <div
          className={`flex items-center justify-center px-6 sm:px-10 py-10 transition-all duration-700 delay-150 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-garamound text-zinc-900 dark:text-white md:hidden">
              Welcome Back
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 mt-2 mb-8 md:mt-0">
              Sign in to continue your ProStriver journey.
            </p>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-zinc-500 dark:text-zinc-400">
                  Email
                </label>
                <div className="mt-2 relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={user.email}
                    onChange={(e) =>
                      setUser({ ...user, email: e.target.value })
                    }
                    className="w-full rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-12 pr-4 py-3 outline-none focus:border-zinc-500 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-500 dark:text-zinc-400">
                  Password
                </label>
                <div className="mt-2 relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={user.password}
                    onChange={(e) =>
                      setUser({ ...user, password: e.target.value })
                    }
                    className="w-full rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-12 pr-12 py-3 outline-none focus:border-zinc-500 text-zinc-900 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                onClick={handleSignin}
                disabled={loading}
                className="w-full rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-2 md:hidden">
                Don’t have an account?{" "}
                <Link
                  to="/signin"
                  className="text-zinc-900 dark:text-white font-medium hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
