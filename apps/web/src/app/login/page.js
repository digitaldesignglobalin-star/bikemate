"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // Phone or email
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("main"); // main, otp, admin
  const [loginMode, setLoginMode] = useState("password"); // password, otp
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, requestOTP, verifyOTP } = useAuth();

  // Extract clean phone number
  const getPhone = () => {
    const clean = identifier.replace(/[^0-9]/g, "");
    return clean.length === 10 ? clean : identifier;
  };

  const isPhoneNumber = () => /^[0-9]{10}$/.test(identifier.replace(/[^0-9]/g, ""));

  // ── Password Login (Primary) ──
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) return setError("Enter phone/email and password");
    setIsSubmitting(true);
    try {
      await login(identifier.includes("@") ? identifier : `+91${getPhone()}`, password);
    } catch (err) {
      if (err.message === "OTP_REQUIRED") {
        setError("No password set. Use OTP to login and set a password in Profile.");
        setLoginMode("otp");
      } else {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── OTP Request ──
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    if (!isPhoneNumber()) return setError("Enter a valid 10-digit mobile number for OTP");
    setIsSubmitting(true);
    try {
      await requestOTP(getPhone());
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── OTP Verify ──
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await verifyOTP(getPhone(), otp);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Admin Login (email + password) ──
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) return setError("Enter email and password");
    setIsSubmitting(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-page-enter">
      <div className="max-w-md w-full">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-bh-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative glass-card p-8 md:p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black font-heading tracking-tight mb-3">
              {step === "otp" ? "Verify OTP" : step === "admin" ? "Admin Access" : "Welcome Back"}
            </h1>
            <p className="text-bh-gray text-sm">
              {step === "otp" ? `Enter the code sent to +91 ${getPhone()}` : 
               step === "admin" ? "Master access for administrators" :
               "Login with your password or mobile OTP"}
            </p>
          </div>

          <form className="space-y-6">
            {error && (
              <div className="bg-bh-red/10 border border-bh-red/20 text-bh-red text-xs font-bold p-4 rounded-xl animate-shake">
                {error}
              </div>
            )}

            <div id="recaptcha-container" className="absolute bottom-4 right-4 z-50"></div>

            {/* ── Main Login Screen ── */}
            {step === "main" && (
              <>
                <div className="space-y-2">
                  <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Phone Number or Email</label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all placeholder:text-bh-gray-darker"
                    placeholder="9876543210 or rider@email.com"
                  />
                </div>

                {/* Password mode (Primary) */}
                {loginMode === "password" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all placeholder:text-bh-gray-darker"
                        placeholder="Enter your password"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handlePasswordLogin}
                      disabled={isSubmitting || !identifier || !password}
                      className="btn btn-primary btn-lg btn-full shadow-glow-red disabled:opacity-50"
                    >
                      {isSubmitting ? "Signing in..." : "Login"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMode("otp")}
                      className="text-[0.65rem] font-bold text-bh-gray-dark hover:text-white transition-colors uppercase tracking-widest text-center block w-full mt-2"
                    >
                      Don&apos;t have password? Use OTP →
                    </button>
                  </>
                )}

                {/* OTP mode (Fallback) */}
                {loginMode === "otp" && (
                  <>
                    <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl">
                      <p className="text-[0.65rem] text-blue-400 font-bold">
                        📱 We&apos;ll send a one-time code to your mobile number.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      disabled={isSubmitting || !identifier}
                      className="btn btn-primary btn-lg btn-full shadow-glow-red disabled:opacity-50"
                    >
                      {isSubmitting ? "Sending OTP..." : "Send OTP"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMode("password")}
                      className="text-[0.65rem] font-bold text-bh-gray-dark hover:text-white transition-colors uppercase tracking-widest text-center block w-full mt-2"
                    >
                      ← Back to Password Login
                    </button>
                  </>
                )}
              </>
            )}

            {/* ── OTP Verification Step ── */}
            {step === "otp" && (
              <div className="space-y-2">
                <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">6-Digit Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-6 text-center text-2xl font-black tracking-[1em] focus:border-bh-primary outline-none transition-all"
                  placeholder="000000"
                />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isSubmitting || otp.length !== 6}
                  className="btn btn-primary btn-lg btn-full mt-6 shadow-glow-red"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Login"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setStep("main"); setOtp(""); }}
                  className="text-[0.65rem] font-bold text-bh-gray-dark hover:text-white mt-4 block mx-auto uppercase tracking-widest"
                >
                  ← Change Number
                </button>
              </div>
            )}

            {/* ── Admin Login ── */}
            {step === "admin" && (
              <>
                <div className="space-y-2">
                  <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all"
                    placeholder="admin@bikemet.in"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg btn-full mt-4 group"
                >
                  {isSubmitting ? "..." : "Admin Login"}
                </button>
              </>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
            <button 
              onClick={() => { setStep(step === "admin" ? "main" : "admin"); setError(""); }}
              className="text-[0.65rem] font-black text-bh-gray-dark hover:text-bh-primary transition-colors uppercase tracking-[0.2em] text-center"
            >
              {step === "admin" ? "← Rider Login" : "Master Admin Login"}
            </button>
            <p className="text-center text-xs text-bh-gray">
              New here? <Link href="/signup" className="text-white font-bold hover:text-bh-primary">Join Community</Link>
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes animate-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: animate-shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}
