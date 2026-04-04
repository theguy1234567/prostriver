import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import toast from "react-hot-toast";
import { Mail, User, Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { setAccessToken } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const [user, setUser] = useState({
    email: "",
    fullname: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);
  const handleSignin = async () => {
    if (!user.email || !user.password) {
      toast.error("Email and password are required");
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

      setAccessToken(data.accessToken);

      toast.success(data?.message || "Welcome back!");
      navigate("/app");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailNext = () => {
    if (!user.email) {
      toast.error("Email is required");
      return;
    }

    setStep(2);
  };

  const handleSignup = async () => {
    if (!user.fullname || !user.password || !user.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          fullName: user.fullname,
          password: user.password,
        }),
      });

      toast.success(res?.message || "OTP sent to your email");
      setStep(3);
    } catch (err) {
      const message =
        err?.data?.password ||
        err?.data?.message ||
        err.message ||
        "Signup failed";

      const lowerMsg = message.toLowerCase();

      if (
        lowerMsg.includes("already registered") ||
        lowerMsg.includes("already exists")
      ) {
        try {
          await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: user.email,
              password: user.password,
            }),
          });

          toast.error("Account already exists. Please login.");
          navigate("/login");
          return;
        } catch (loginErr) {
          const loginMessage =
            loginErr?.data?.message || loginErr.message || "";

          if (loginMessage.toLowerCase().includes("not verified")) {
            toast("Email exists but not verified. Please verify OTP.");
            setStep(3);
            return;
          }

          toast.error("Account already exists. Please login.");
          navigate("/login");
          return;
        }
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async () => {
    try {
      setLoading(true);

      await apiFetch("/api/auth/signup/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          purpose: "SIGNUP_VERIFY_EMAIL",
          otp,
        }),
      });

      // AUTO LOGIN AFTER VERIFY
      const loginData = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      if (!loginData.accessToken) {
        throw new Error("No token received");
      }

      const userData = {
        email: user.email,
        fullName: user.fullname,
      };

      localStorage.setItem("accessToken", loginData.accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setAccessToken(loginData.accessToken);

      toast.success("Account created successfully");
      navigate("/app");
    } catch (err) {
      toast.error(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);

      await apiFetch(
        `/api/auth/signup/resend-otp?email=${encodeURIComponent(user.email)}`,
        { method: "POST" },
      );

      toast.success("OTP sent again!");
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
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
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-600 dark:text-zinc-400 mb-4">
            ProStriver
          </p>

          <h1 className="text-5xl lg:text-6xl font-garamound leading-tight text-zinc-900 dark:text-white">
            Signup to <i>pro</i>striver
          </h1>

          <p className="mt-6 text-zinc-700 dark:text-zinc-400 text-lg leading-8">
            Start your journey of revision streaks, challenge tracking, and
            consistent learning discipline.
          </p>

          <div className="mt-10">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="mt-2 inline-block text-zinc-900 dark:text-white font-medium hover:underline"
            >
              Login now →
            </Link>
          </div>
        </div>

        {/* Right Signup Form */}
        <div
          className={`flex items-center justify-center px-6 sm:px-10 py-10 overflow-hidden transition-all duration-700 delay-150 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="w-full max-w-md overflow-hidden">
            <h1 className="text-4xl font-garamound text-zinc-900 dark:text-white md:hidden">
              Create Account
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 mt-2 mb-8">
              Build your learning system with ProStriver.
            </p>

            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
            >
              {/* Step 1 */}
              <div className="min-w-full space-y-5">
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

                <button
                  onClick={handleEmailNext}
                  disabled={loading}
                  className="w-full rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 font-medium hover:opacity-90 transition"
                >
                  Next
                </button>
              </div>

              {/* Step 2 */}
              <div className="min-w-full space-y-5 px-1">
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    placeholder="Full Name"
                    value={user.fullname}
                    onChange={(e) =>
                      setUser({ ...user, fullname: e.target.value })
                    }
                    className="w-full rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-12 pr-4 py-3 outline-none"
                  />
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={user.password}
                    onChange={(e) =>
                      setUser({ ...user, password: e.target.value })
                    }
                    className="w-full rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-12 pr-12 py-3 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={user.confirmPassword}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-12 pr-12 py-3 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 font-medium hover:opacity-90 transition"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>

              {/* Step 3 */}
              <div className="min-w-full space-y-5 px-1">
                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-4 top-5/6 -translate-y-1/2 text-zinc-400"
                  />
                  <p className="bg-gray-400/50 font-garamound text-2xl text-shadow-md text-center  mb-5 rounded-2xl p-6">
                    Your Email : {`${user.email}`}
                  </p>
                  <input
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-12 pr-4 py-3 outline-none"
                  />
                </div>

                <button
                  onClick={handleOtp}
                  disabled={loading}
                  className="w-full rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 font-medium hover:opacity-90 transition"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  onClick={handleResendOtp}
                  className="w-full text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  Resend OTP
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                  }}
                  className="w-full text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  ← Go back & change email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
