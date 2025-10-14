// src/components/WeatherAnim.jsx
import React, { useMemo } from "react";

/**
 * WeatherAnim
 * Props:
 *  - temp: number|null - temperature in Celsius
 *  - humidity: number|null - humidity percentage
 *  - condition: string - weather condition (clear, cloudy, rain, snow, etc.)
 *
 * Enhanced weather animation with better condition handling.
 */
export default function WeatherAnim({ temp, humidity, condition }) {
  const weatherCondition = useMemo(() => {
    // Use provided condition if available, otherwise infer from temp/humidity
    if (condition && condition !== "Unknown") {
      return condition.toLowerCase();
    }

    // Fallback logic based on temp and humidity
    if (!temp || temp === "--") return "partly-cloudy";

    const t = parseFloat(temp);
    const h = humidity && humidity !== "--" ? parseFloat(humidity) : 50;

    if (t <= 0 && h > 70) return "snow";
    if (h > 85) return "rain";
    if (h > 70) return "cloudy";
    if (h > 40 && h <= 70) return "partly-cloudy";
    if (t > 25 && h < 60) return "clear";
    return "partly-cloudy";
  }, [temp, humidity, condition]);

  return (
    <div className={`weather-anim weather-${weatherCondition}`} aria-hidden>
      {/* Enhanced Animated layers — purely CSS */}
      <div className="sun" />
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="cloud cloud-c" />
      <div className="rain-layer">
        <div className="drop" />
        <div className="drop" />
        <div className="drop" />
        <div className="drop" />
        <div className="drop" />
      </div>
      <div className="snow-layer">
        <div className="flake" />
        <div className="flake" />
        <div className="flake" />
        <div className="flake" />
        <div className="flake" />
      </div>
      {/* Lightning for stormy conditions */}
      <div className="lightning-layer">
        <div className="lightning-bolt" />
      </div>
    </div>
  );
}
