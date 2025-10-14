// frontend/src/components/Knob.jsx
import React from "react";

/**
 * Simple knob fallback (uses range input)
 * props: value (0..5), onChange(newVal), size
 */
export default function Knob({ value = 0, onChange = () => {}, size = 140 }) {
  return (
    <div style={{ width: size, textAlign: "center" }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(180deg,#0f2435,#07141f)",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"inset 0 6px 16px rgba(0,0,0,0.6)"
      }}>
        <div style={{ textAlign:"center", color:"#fff" }}>
          <div style={{ fontSize: 28, fontWeight:700 }}>{value}</div>
          <div style={{ fontSize:12, color:"#9fb3d6" }}>Speed</div>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", marginTop: 12 }}
      />
    </div>
  );
}
