"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../utils/api";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../utils/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [isPremium, setIsPremium] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("isPremium") === "true";
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !localStorage.getItem("token");
  });
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        setUser(null);
        setIsPremium(false);
        return;
      }

      try {
        const response = await fetch("/api/user/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setIsPremium(data.user.subscriptionActive);
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("isPremium", data.user.subscriptionActive ? "true" : "false");
        } else if (data.error === "Invalid Token" || data.error === "Unauthorized") {
          logout();
        }
      } catch (err) {
        console.error("Profile sync error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const setupRecaptcha = (containerId) => {
    // Always clear stale verifier so it can be re-initialized fresh
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        // Reset verifier so next attempt gets a fresh one
        window.recaptchaVerifier = null;
      }
    });
  };

  const getReadableFirebaseError = (err) => {
    const code = err.code || '';
    if (code === 'auth/invalid-phone-number') return 'Invalid phone number. Please enter a valid 10-digit Indian number.';
    if (code === 'auth/too-many-requests') return 'Too many OTP requests. Please wait a few minutes and try again.';
    if (code === 'auth/quota-exceeded') return 'OTP quota exceeded. Please try again later.';
    if (code === 'auth/captcha-check-failed') return 'reCAPTCHA check failed. Please refresh the page and try again.';
    if (code === 'auth/missing-phone-number') return 'Please enter your mobile number.';
    if (code === 'auth/invalid-app-credential') return 'Firebase configuration error. Contact support.';
    if (code === 'auth/code-expired') return 'OTP has expired. Please request a new code.';
    if (code === 'auth/invalid-verification-code') return 'Incorrect OTP. Please check and try again.';
    return err.message || 'Something went wrong. Please try again.';
  };

  const requestOTP = async (phoneNumber) => {
    try {
      // Ensure phone has country code. Defaulting to India +91 if none provided.
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      // Always set up a fresh reCAPTCHA verifier before each request
      setupRecaptcha('recaptcha-container');
      const appVerifier = window.recaptchaVerifier;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      return { success: true };
    } catch (err) {
      console.error('OTP send error:', err);
      // Reset the verifier so next attempt starts fresh
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }
      throw new Error(getReadableFirebaseError(err));
    }
  };

  const verifyOTP = async (phoneNumber, otp) => {
    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        throw new Error("OTP session expired. Please request a new code.");
      }
      
      const result = await confirmationResult.confirm(otp);
      const fbUser = result.user;
      
      // Sync with our Vercel backend
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formattedPhone,
          firebaseUid: fbUser.uid
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to sync user data");

      const { token, user: backendUser } = data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(backendUser));
      localStorage.setItem("isPremium", backendUser.subscriptionActive ? "true" : "false");
      
      // Clear OTP session after successful verification
      window.confirmationResult = null;
      
      setIsPremium(backendUser.subscriptionActive);
      setUser(backendUser);
      router.push("/dashboard");
      return { token, user: backendUser };
    } catch (err) {
      console.error('OTP verify error:', err);
      throw new Error(getReadableFirebaseError(err));
    }
  };

  const login = async (phoneOrEmail, password) => {
    try {
      // Offline Admin Bypass Mode
      if (phoneOrEmail === "admin@bikemate.com" && password === "admin123") {
        const mockAdmin = { 
          id: "admin-1", 
          name: "Bikemate Master Admin", 
          email: "admin@bikemate.com", 
          role: "ADMIN" 
        };
        localStorage.setItem("token", "mock-admin-jwt-token");
        localStorage.setItem("user", JSON.stringify(mockAdmin));
        setUser(mockAdmin);
        router.push("/admin/dashboard");
        return;
      }
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneOrEmail, password })
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Login failed");
      }
      
      const { token, user: backendUser } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(backendUser));
      localStorage.setItem("isPremium", backendUser.subscriptionActive ? "true" : "false");
      
      setIsPremium(backendUser.subscriptionActive);
      setUser(backendUser);
      router.push("/dashboard");
      return { token, user: backendUser };
    } catch (err) {
      if (err.message.includes("No password set")) {
         throw new Error("OTP_REQUIRED");
      }
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    await api.post("/auth/register", { name, email, password });
    // After signup, we ask them to use OTP for the first login
    return { success: true, message: "Account created! Now login with OTP." };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isPremium");
    setIsPremium(false);
    setUser(null);
    router.push("/");
  };

  const upgradeToPremium = () => {
    setIsPremium(true);
    localStorage.setItem("isPremium", "true");
  };

  const updateUser = async (newData) => {
    try {
      const token = localStorage.getItem("token");
      if (token && token !== "mock-admin-jwt-token") {
        const response = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(newData)
        });
        const data = await response.json();
        if (data.success) {
          const updatedUser = { ...user, ...data.user };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
          return { success: true };
        }
        throw new Error(data.error);
      } else {
        // Fallback for offline mode / mock admin
        const updatedUser = { ...user, ...newData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
    } catch (err) {
      console.error("Update profile error:", err);
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, isPremium, upgradeToPremium, updateUser, requestOTP, verifyOTP, setupRecaptcha }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
