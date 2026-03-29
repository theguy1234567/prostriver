import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";

export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [user, setUser] = useState({
    email: "",
    fullname: "",
    password: "",
  });

  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================
  // SIGNUP
  // ============================
  const handleSignup = async () => {
    try {
      setError("");

      if (!user.email || !user.password || !user.fullname) {
        setError("All fields are required");
        return;
      }

      setLoading(true);

      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          fullName: user.fullname,
          password: user.password,
        }),
      });

      // ✅ New user → go OTP
      setStep(3);
    } catch (err) {
      console.log("Signup error:", err);

      // 🔥 Duplicate email handling
      if (err.status === 409) {
        try {
          // Try resend OTP → means user not verified
          await apiFetch(
            `/api/auth/signup/resend-otp?email=${encodeURIComponent(user.email)}`,
            { method: "POST" },
          );

          setError("Account exists. OTP resent.");
          setStep(3);
        } catch {
          // User already verified
          setError("Account already exists. Please login.");
          navigate("/login");
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // VERIFY OTP
  // ============================
  const handleOtp = async () => {
    try {
      setLoading(true);
      setError("");

      await apiFetch("/api/auth/signup/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          purpose: "SIGNUP_VERIFY_EMAIL",
          otp: otp,
        }),
      });

      navigate("/login");
    } catch (err) {
      if (err.message.toLowerCase().includes("expired")) {
        setError("OTP expired. Please resend.");
      } else if (err.message.toLowerCase().includes("invalid")) {
        setError("Invalid OTP.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // RESEND OTP
  // ============================
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError("");

      await apiFetch(
        `/api/auth/signup/resend-otp?email=${encodeURIComponent(user.email)}`,
        { method: "POST" },
      );

      setError("OTP sent again!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-sky-100 min-h-screen flex justify-center items-center">
      <div className="bg-red-100 h-[75vh] w-[60vw] rounded-2xl p-4 flex flex-row">
        {/* LEFT FORM */}
        <div className="bg-sky-400/50 rounded-4xl rounded-r-2xl w-[60%] flex flex-col items-center justify-center">
          <h2 className="text-2xl mb-4 font-semibold">
            {step === 1 && "Create Account"}
            {step === 2 && "Your Details"}
            {step === 3 && "Verify OTP"}
          </h2>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                className="input px-4 py-3 m-2 rounded-lg"
                placeholder="Email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />

              <input
                className="input px-4 py-3 m-2 rounded-lg"
                placeholder="Password"
                type="password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
              />

              <button onClick={() => setStep(2)}>Next</button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <input
                className="input px-4 py-3 m-2 rounded-lg"
                placeholder="Full Name"
                value={user.fullname}
                onChange={(e) => setUser({ ...user, fullname: e.target.value })}
              />

              <button onClick={handleSignup} disabled={loading}>
                {loading ? "Creating..." : "Next"}
              </button>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <input
                className="input px-4 py-3 m-2 rounded-lg"
                value={user.email}
                disabled
              />

              <input
                className="input px-4 py-3 m-2 rounded-lg"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button onClick={handleOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                onClick={handleResendOtp}
                className="text-blue-600 underline mt-2"
              >
                Resend OTP
              </button>
            </>
          )}

          {error && (
            <p className="text-red-600 text-sm mt-2 text-center px-4">
              {error}
            </p>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-[#D7CDCC] rounded-3xl w-[40%] flex flex-col items-center justify-center">
          <h1 className="text-4xl text-center">
            Welcome to <i>pro</i>strive
          </h1>

          <p className="mt-5">Already have an account?</p>

          <Link to="/login" className="text-blue-600 underline mt-2">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
