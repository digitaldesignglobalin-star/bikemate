"use client";
import { useState, useEffect } from "react";

// WMO Weather Code mapping
const WMO = {
  0:  { label: "Clear Sky",        icon: "☀️" },
  1:  { label: "Mainly Clear",     icon: "🌤️" },
  2:  { label: "Partly Cloudy",    icon: "⛅" },
  3:  { label: "Overcast",         icon: "☁️" },
  45: { label: "Foggy",            icon: "🌫️" },
  48: { label: "Icy Fog",          icon: "🌫️" },
  51: { label: "Light Drizzle",    icon: "🌦️" },
  53: { label: "Drizzle",          icon: "🌦️" },
  55: { label: "Heavy Drizzle",    icon: "🌧️" },
  61: { label: "Light Rain",       icon: "🌧️" },
  63: { label: "Moderate Rain",    icon: "🌧️" },
  65: { label: "Heavy Rain",       icon: "🌧️" },
  71: { label: "Light Snow",       icon: "🌨️" },
  73: { label: "Moderate Snow",    icon: "❄️" },
  75: { label: "Heavy Snow",       icon: "❄️" },
  80: { label: "Rain Showers",     icon: "🌦️" },
  81: { label: "Showers",          icon: "🌧️" },
  82: { label: "Violent Showers",  icon: "⛈️" },
  95: { label: "Thunderstorm",     icon: "⛈️" },
  96: { label: "Thunderstorm",     icon: "⛈️" },
  99: { label: "Hail Storm",       icon: "⛈️" },
};

const RAINY_CODES = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];

function getAITip(temp, rainChance, code) {
  if (code === 95 || code === 96 || code === 99)
    return "⛈️ Thunderstorm alert — postpone your ride if possible!";
  if (rainChance >= 60 || RAINY_CODES.includes(code))
    return "🌧️ Rain likely — pack your raincoat before heading out!";
  if (rainChance >= 35)
    return "🌦️ Rain possible — carry a light jacket just in case.";
  if (code === 45 || code === 48)
    return "🌫️ Foggy conditions — reduce speed and use low beam headlights.";
  if (temp >= 38)
    return "🥵 Extreme heat — hydrate every 50 km, avoid afternoon sun.";
  if (temp >= 33)
    return "☀️ Hot day ahead — keep water handy and take shaded breaks.";
  if (temp <= 12)
    return "🥶 Cold ride — wear thermal layers and a windproof jacket!";
  if (temp <= 18)
    return "🧥 Cool weather — a jacket will keep you comfortable at speed.";
  return "🏍️ Perfect riding conditions — enjoy the open road, stay safe!";
}

export function useWeather(coords) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coords?.lat || !coords?.lng) return;
    let cancelled = false;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current_weather=true&hourly=precipitation_probability,temperature_2m&forecast_days=1&timezone=auto`
        );
        if (!res.ok) throw new Error("Weather API error");
        const data = await res.json();
        if (cancelled) return;

        const cw = data.current_weather;
        const hour = new Date().getHours();
        const rainChance = data.hourly?.precipitation_probability?.[hour] ?? 0;
        const temp = Math.round(cw.temperature);
        const code = cw.weathercode;
        const meta = WMO[code] ?? WMO[0];

        setWeather({
          temp,
          condition: meta.label,
          icon: meta.icon,
          rainChance,
          aiTip: getAITip(temp, rainChance, code),
          isRaining: rainChance >= 35 || RAINY_CODES.includes(code),
        });
      } catch (e) {
        console.warn("[useWeather]", e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWeather();
    return () => { cancelled = true; };
  }, [coords?.lat, coords?.lng]);

  return { weather, loading };
}
