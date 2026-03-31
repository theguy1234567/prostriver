import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    email: "",
    fullname: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");

  // ============================
  // STEP 1 → EMAIL VALIDATION ONLY
  // ============================
  const handleEmailNext = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!user.email) {
      toast.error("Email is required");
      return;
    }

    if (!emailRegex.test(user.email)) {
      toast.error("Enter a valid email");
      return;
    }

    setStep(2);
  };

  // ============================
  // STEP 2 → PASSWORD + SIGNUP
  // ============================
  const handleSignup = async () => {
    if (!user.fullname || !user.password || !user.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (user.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          fullName: user.fullname,
          password: user.password,
        }),
      });

      toast.success("OTP sent to your email");
      setStep(3);
    } catch (err) {
      if (err.status === 409) {
        toast.error("Account already exists. Please login.");
      } else {
        toast.error(err.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // STEP 3 → OTP VERIFY
  // ============================
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

      toast.success("Email verified successfully");
      navigate("/login");
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
    <div className="bg-sky-100 min-h-screen flex justify-center items-center px-4 py-6">
      <div className="bg-red-100 w-full max-w-6xl min-h-[85vh] rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        {/* LEFT FORM */}
        <div className="bg-sky-400/50 rounded-3xl md:rounded-4xl w-full md:w-[60%] flex items-center justify-center overflow-hidden px-4 sm:px-6 py-6 sm:py-8">
          <div className="w-full overflow-hidden">
            <div
              className="flex w-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
            >
              {/* STEP 1 */}
              <div className="min-w-full flex flex-col items-center justify-center font-averaiserif">
                <h2 className="text-2xl mb-4 font-semibold">Enter Email</h2>

                <input
                  className="w-full max-w-md bg-white px-4 py-3 rounded-lg outline-none"
                  placeholder="Email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />

                <button
                  className="bg-sky-400 p-3 rounded-lg px-10 mt-6 w-full max-w-md"
                  onClick={handleEmailNext}
                  disabled={loading}
                >
                  Next
                </button>
              </div>

              {/* STEP 2 */}
              <div className="min-w-full flex flex-col items-center justify-center font-averaiserif">
                <h2 className="text-2xl mb-4 font-semibold">
                  Secure Your Account
                </h2>

                <div className="w-full max-w-md space-y-4">
                  <input
                    className="w-full bg-white px-4 py-3 rounded-lg outline-none"
                    placeholder="Full Name"
                    value={user.fullname}
                    onChange={(e) =>
                      setUser({ ...user, fullname: e.target.value })
                    }
                  />

                  <input
                    className="w-full bg-white px-4 py-3 rounded-lg outline-none"
                    type="password"
                    placeholder="Password"
                    value={user.password}
                    onChange={(e) =>
                      setUser({ ...user, password: e.target.value })
                    }
                  />

                  <input
                    className="w-full bg-white px-4 py-3 rounded-lg outline-none"
                    type="password"
                    placeholder="Confirm Password"
                    value={user.confirmPassword}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        confirmPassword: e.target.value,
                      })
                    }
                  />

                  <button
                    className="w-full bg-sky-400 py-3 rounded-lg"
                    onClick={handleSignup}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="min-w-full flex flex-col items-center justify-center font-averaiserif">
                <h2 className="text-2xl mb-4 font-semibold">Verify OTP</h2>

                <div className="w-full max-w-md space-y-4">
                  <input
                    className="w-full bg-white px-4 py-3 rounded-lg outline-none"
                    value={user.email}
                    disabled
                  />

                  <input
                    className="w-full bg-white px-4 py-3 rounded-lg outline-none"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <button
                    className="w-full bg-sky-400 py-3 rounded-lg"
                    onClick={handleOtp}
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>

                  <button
                    onClick={handleResendOtp}
                    className="text-blue-600 underline mt-2 w-full"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-[#D7CDCC] rounded-3xl w-full md:w-[40%] flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-averaiserif leading-tight">
            Welcome to <i className="font-garamound">pro</i>strive
          </h1>

          <p className="mt-5 font-averaiserif text-sm sm:text-base">
            Already have an account?
          </p>

          <Link
            to="/login"
            className="text-blue-600 underline mt-2 font-averaiserif"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
