"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useLocation — A clean, crash-free browser geolocation hook.
 * Replaces the old useGPS.js which had blocking issues on HTTP origins.
 *
 * States: "idle" | "loading" | "success" | "denied" | "error"
 */
export function useLocation() {
  const [coords, setCoords] = useState(null);  // { lat, lng }
  const [locality, setLocality] = useState(null); // Local area name
  const [status, setStatus] = useState("idle"); // idle | loading | success | denied | error
  const [error, setError] = useState(null);
  const [speed, setSpeed] = useState(0);        // km/h
  const [accuracy, setAccuracy] = useState(null);
  const watchRef = useRef(null);

  const onSuccess = useCallback(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    setCoords({ lat, lng });
    setAccuracy(Math.round(pos.coords.accuracy));
    setSpeed(pos.coords.speed != null ? Math.round(pos.coords.speed * 3.6) : 0);
    setStatus("success");
    setError(null);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      if (res.ok) {
        const data = await res.json();
        const locName = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || data.address?.county || data.address?.state_district || "Unknown Area";
        setLocality(locName);
      }
    } catch {
      setLocality("Local mapping...");
    }
  }, []);

  const onError = useCallback((err) => {
    if (err.code === 1) {
      setStatus("denied");
      setError("Location permission denied. Please allow access in your browser settings.");
    } else if (err.code === 2) {
      setStatus("error");
      setError("Position unavailable. Check your signal.");
    } else {
      setStatus("error");
      setError("Location request timed out. Please try again.");
    }
  }, []);

  /** One-shot location fetch */
  const getLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setStatus("loading");
    setError(null);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });
  }, [onSuccess, onError]);

  /** Continuous watch — call startWatch() / stopWatch() */
  const startWatch = useCallback(() => {
    if (watchRef.current != null) return; // already watching
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setStatus("loading");
    setError(null);
    watchRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  }, [onSuccess, onError]);

  const stopWatch = useCallback(() => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setCoords(null);
    setSpeed(0);
    setAccuracy(null);
    setStatus("idle");
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  return { coords, locality, status, error, speed, accuracy, getLocation, startWatch, stopWatch };
}
