"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // Kept for admin login
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP, 3 = Admin Password
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, requestOTP, verifyOTP } = useAuth();
  // Note: reCAPTCHA is initialized fresh inside requestOTP() — no need to call setupRecaptcha here

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await requestOTP(phone);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await verifyOTP(phone, otp);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      // If step 1, we use phone. If step 3, we use email.
      const identifier = step === 1 ? phone : email;
      await login(identifier, password);
    } catch (err) {
      if (err.message === "OTP_REQUIRED") {
        setStep(2);
        setError("Password login not enabled for this account yet. Please use OTP to verify your number first.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-page-enter">
      <div className="max-w-md w-full">
        {/* Animated background highlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-bh-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative glass-card p-8 md:p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black font-heading tracking-tight mb-3">
              {step === 2 ? "Verify OTP" : "Rider Login"}
            </h1>
            <p className="text-bh-gray text-sm">
              {step === 1 ? "Enter your mobile number to receive a secure code" : 
               step === 2 ? `Check your messages for ${phone}` :
               "Master access for administrators"}
            </p>
          </div>

          <form className="space-y-6">
            {error && (
              <div className="bg-bh-red/10 border border-bh-red/20 text-bh-red text-xs font-bold p-4 rounded-xl animate-shake">
                {error}
              </div>
            )}

            <div id="recaptcha-container"></div>

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bh-gray font-bold">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl py-4 pr-4 pl-12 text-sm focus:border-bh-primary outline-none transition-all placeholder:text-bh-gray-darker font-mono"
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1 flex justify-between">
                    <span>Password (Trusted Device)</span>
                    <span className="text-bh-gray text-[0.6rem] normal-case tracking-normal">Optional</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all placeholder:text-bh-gray-darker"
                    placeholder="Enter password to skip OTP"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleAdminLogin} // This now calls login(phone, password)
                    disabled={isSubmitting || !phone || !password}
                    className="btn bg-[#1A1A1A] hover:bg-[#222] text-white py-4 rounded-xl text-sm font-bold disabled:opacity-50 transition-all border border-white/5"
                  >
                    {isSubmitting ? "..." : "Login via Password"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    disabled={isSubmitting || !phone}
                    className="btn btn-primary py-4 rounded-xl text-sm font-bold shadow-glow-red disabled:opacity-50"
                  >
                    {isSubmitting ? "..." : "Get OTP"}
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
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
                  onClick={() => setStep(1)}
                  className="text-[0.65rem] font-bold text-bh-gray-dark hover:text-white mt-4 block mx-auto uppercase tracking-widest"
                >
                  ← Change Number
                </button>
              </div>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all"
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
              onClick={() => setStep(step === 3 ? 1 : 3)}
              className="text-[0.65rem] font-black text-bh-gray-dark hover:text-bh-primary transition-colors uppercase tracking-[0.2em] text-center"
            >
              {step === 3 ? "Use Rider Login" : "Master Admin Login"}
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
