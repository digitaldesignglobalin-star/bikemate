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
      setLoading(false);
    };

    checkUser();
  }, []);

  const setupRecaptcha = (containerId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved
        }
      });
    }
  };

  const requestOTP = async (phoneNumber) => {
    try {
      // Ensure phone has country code. Defaulting to India +91 if none provided.
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      return { success: true };
    } catch (err) {
      console.error(err);
      throw new Error(err.message || "Failed to send OTP. Please try again.");
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
      
      // Sync with our new Vercel backend
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          firebaseUid: fbUser.uid
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to sync user data");

      const { token, user: backendUser } = data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(backendUser));
      localStorage.setItem("isPremium", backendUser.subscriptionActive ? "true" : "false");
      
      setIsPremium(backendUser.subscriptionActive);
      setUser(backendUser);
      router.push("/dashboard");
      return { token, user: backendUser };
    } catch (err) {
      console.error(err);
      throw new Error(err.message || "Invalid OTP code");
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
