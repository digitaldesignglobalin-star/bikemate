"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(formData.name, formData.email, formData.password);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 animate-page-enter">
      <div className="max-w-md w-full">
        {/* Animated background highlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-bh-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative glass-card p-8 md:p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black font-heading tracking-tight mb-3">Join the Pack</h1>
            <p className="text-bh-gray text-sm">Create your free rider account today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-bh-red/10 border border-bh-red/20 text-bh-red text-xs font-bold p-4 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all"
                placeholder="rider@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg btn-full mt-6"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-bh-gray">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-white hover:text-bh-primary transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
