import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const countryCodes = [
  { code: "+1", label: "🇺🇸 USA", value: "+1" },
  { code: "+44", label: "🇬🇧 UK", value: "+44" },
  { code: "+91", label: "🇮🇳 India", value: "+91" },
  { code: "+61", label: "🇦🇺 Australia", value: "+61" },
  { code: "+81", label: "🇯🇵 Japan", value: "+81" },
  { code: "+49", label: "🇩🇪 Germany", value: "+49" },
  { code: "+33", label: "🇫🇷 France", value: "+33" },
  { code: "+86", label: "🇨🇳 China", value: "+86" },
];

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: enter phone, 2: enter otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const verifyInProgress = useRef(false);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const requestOtp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const contact = countryCode + phone;
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: contact }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("OTP sent successfully! 📱");
        setTimeout(() => {
          setStep(2);
          setSuccess("");
        }, 1500);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (verifyInProgress.current) {
      return;
    }
    verifyInProgress.current = true;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const contact = countryCode + phone;
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: contact, otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Login successful! 🎉");
        setTimeout(() => {
          onLogin(data.user || { phone: contact, profiles: [] });
        }, 1500);
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
    verifyInProgress.current = false;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPhone(value);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-left-content">
            <div className="welcome-animation">
              <div className="floating-icons">
                <div className="icon phone-icon">📱</div>
                <div className="icon message-icon">💬</div>
                <div className="icon home-icon">🏠</div>
                <div className="icon lock-icon">🔐</div>
                <div className="icon wifi-icon">📶</div>
                <div className="icon bulb-icon">💡</div>
              </div>
            </div>
            <h1>Welcome back!</h1>
            <p>You can sign in to access your existing account.</p>

            <div className="connection-guide">
              <div className="guide-item">
                <div className="guide-icon">📱</div>
                <div className="guide-text">
                  <strong>Enter your phone number</strong>
                  <span>We'll send you a secure code</span>
                </div>
              </div>
              <div className="guide-arrow">↓</div>
              <div className="guide-item">
                <div className="guide-icon">🔐</div>
                <div className="guide-text">
                  <strong>Verify with OTP</strong>
                  <span>Enter the 6-digit code we sent</span>
                </div>
              </div>
              <div className="guide-arrow">↓</div>
              <div className="guide-item">
                <div className="guide-icon">🏠</div>
                <div className="guide-text">
                  <strong>Access your smart home</strong>
                  <span>Control all your devices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="login-right">
          <div className="login-card">
            <h2>Sign In</h2>
            <div className="step-indicator">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
            </div>

            {step === 1 && (
              <div className="form-step">
                <label>Phone Number *</label>
                <div className="phone-input-group">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    disabled={loading}
                    className="country-select"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    className="input-field phone-input"
                    maxLength="10"
                  />
                </div>
                <button
                  onClick={requestOtp}
                  disabled={loading || phone.length !== 10}
                  className="btn-primary"
                >
                  {loading ? "Sending OTP..." : "Send OTP 📱"}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <label>OTP Code *</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={loading}
                  className="input-field"
                  maxLength="6"
                />
                <button
                  onClick={verifyOtp}
                  disabled={loading || !otp || otp.length !== 6}
                  className="btn-primary"
                >
                  {loading ? "Verifying..." : "Verify & Login 🚀"}
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                  }}
                  className="btn-secondary"
                >
                  ← Back
                </button>
              </div>
            )}

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            <div className="login-footer">
              <p>New here? <button className="link-button" onClick={() => navigate('/register')}>Create an Account</button></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
