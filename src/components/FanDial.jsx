// src/components/FanDial.jsx
import React, { useRef, useEffect, useState } from "react";

/**
 * FanDial
 * props:
 *   value (0..5)
 *   onChange(newValue)
 *   size (px)
 * Shows circular dial, numeric center, color changes by speed (0..5)
 * Supports drag/rotate and click-to-set.
 */
export default function FanDial({ value = 0, onChange = () => {}, size = 150 }) {
  const svgRef = useRef(null);
  const [, setDragging] = useState(false);

  // radius / stroke
  const r = (size / 2) - 14;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;

  // convert speed 0..5 to percent 0..100
  const percent = (value / 5) * 100;
  const dash = (percent / 100) * circumference;

  // dynamic color (green->yellow->red)
  const colorMap = ["#94a3b8","#60a5fa","#38bdf8","#f59e0b","#fb7185","#ef4444"]; // index by speed
  const color = colorMap[Math.max(0, Math.min(5, value))];

  // compute angle from pointer event relative to center, returns 0..360
  function angleFromEvent(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    let ang = Math.atan2(dy, dx) * (180 / Math.PI); // -180..180
    ang = ang + 90; // rotate so 0 is top
    if (ang < 0) ang += 360;
    return ang; // 0..360 where 0 = top, 90 = right, 180 = bottom, 270 = left
  }

  function angleToValue(ang) {
    // map 0..360 to 0..5, but we want 360->5 and small sweep only
    // We'll allow full 360 mapping so top=0, clockwise increases
    const v = Math.round((ang / 360) * 5);
    return Math.max(0, Math.min(5, v));
  }

  function handlePointerDown(e) {
    e.preventDefault();
    setDragging(true);
    const ang = angleFromEvent(e);
    const v = angleToValue(ang);
    onChange(v);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }
  function handlePointerMove(e) {
    e.preventDefault();
    const ang = angleFromEvent(e);
    const v = angleToValue(ang);
    onChange(v);
  }
  function handlePointerUp(e) {
    setDragging(false);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  // small keyboard support
  useEffect(() => {
    function onKey(e) {
      if (["ArrowUp", "ArrowRight"].includes(e.key)) onChange(Math.min(5, value + 1));
      if (["ArrowDown", "ArrowLeft"].includes(e.key)) onChange(Math.max(0, value - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [value, onChange]);

  return (
    <div style={{ width: size, height: size, display: "inline-block", userSelect: "none" }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onPointerDown={handlePointerDown}
        style={{ touchAction: "none", cursor: "grab" }}
      >
        {/* background track */}
        <circle
          cx={cx} cy={cy} r={r}
          stroke="#0c2540"
          strokeWidth="12"
          fill="none"
        />
        {/* progress arc */}
        <circle
          cx={cx} cy={cy} r={r}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* center inner */}
        <circle cx={cx} cy={cy} r={r - 18} fill="rgba(255,255,255,0.02)" stroke="transparent" />
        {/* numeric label */}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: size * 0.22, fontWeight: 800, fill: "#fff" }}>
          {value}
        </text>
        {/* small label */}
        <text x={cx} y={cy + (size * 0.28)} textAnchor="middle" style={{ fontSize: 10, fill: "#9fb3d6" }}>
          Speed
        </text>
      </svg>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "#9fb3d6" }}>
        Drag or click the dial
      </div>
    </div>
  );
}
