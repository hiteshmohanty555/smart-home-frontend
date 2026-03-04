import React, { useState, useEffect } from "react";
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

export default function Register({ onRegister }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (/^\d*$/.test(value)) {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  // Start countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtp = async () => {
    if (!form.phone) {
      setOtpError("Please enter phone number first");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const fullPhone = selectedCountryCode + form.phone;
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          isRegistration: true
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        setCountdown(30); // 30 seconds countdown
        setOtpError("");
      } else {
        setOtpError(data.message || "Failed to send OTP");
      }
    } catch (e) {
      setOtpError("Network error. Please try again.");
    }
    setOtpLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp) {
      setOtpError("Please enter OTP");
      return;
    }

    setLoading(true);
    setOtpError("");

    try {
      const fullPhone = selectedCountryCode + form.phone;
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          otp: otp,
          isRegistration: true
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // OTP verified, now proceed with registration
        await completeRegistration();
      } else {
        setOtpError(data.message || "Invalid OTP");
      }
    } catch (e) {
      setOtpError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const completeRegistration = async () => {
    try {
      const fullPhone = selectedCountryCode + form.phone;
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          address: form.address,
          phone: fullPhone
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Account created successfully! 🎉");
        setTimeout(() => {
          onRegister(data.user);
        }, 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.address || !form.phone) {
      setError("Please fill in all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Start OTP verification process
    await sendOtp();
  };

  return (
    <div className="register-page">
      {/* Cartoon Characters */}
      <div className="cartoon-left">
        <div className="character pointing">
          <div className="character-body">
            <div className="character-head">👨‍💻</div>
            <div className="character-arm pointing-arm">👈</div>
          </div>
        </div>
      </div>

      <div className="cartoon-right">
        <div className="character sitting">
          <div className="character-body">
            <div className="character-head">👩‍💻</div>
            <div className="laptop">💻</div>
          </div>
        </div>
        <div className="leaf-decoration">🍃</div>
      </div>

      <div className="register-container">
        <div className="register-card">
          {/* Profile Icon */}
          <div className="profile-icon-container">
            <div className="profile-icon">👤</div>
          </div>

          <h1 className="register-title">Join My Smart Space</h1>
          <p className="register-subtitle">Create your account to get started</p>

          <div className="register-form">
            {/* Single Name Field */}
            <div className="form-group full-width">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Email Field - Full Width */}
            <div className="form-group full-width">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Phone Number Field - Full Width */}
            <div className="form-group full-width">
              <label>Phone Number</label>
              <div className="phone-input-group">
                <select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="country-select"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                  className="phone-input"
                  maxLength="10"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="Enter your full address"
                value={form.address}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* OTP Section */}
            {otpSent && (
              <div className="form-group full-width">
                <label>Enter OTP</label>
                <div className="otp-input-group">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={handleOtpChange}
                    className="form-input otp-input"
                    maxLength="6"
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={loading}
                    className="verify-otp-button"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
                <div className="otp-resend">
                  {countdown > 0 ? (
                    <span>Resend OTP in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={otpLoading}
                      className="resend-link"
                    >
                      {otpLoading ? "Sending..." : "Resend OTP"}
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <span className="button-content">
                  <div className="spinner"></div>
                  Creating Account...
                </span>
              ) : (
                otpSent ? "Complete Registration" : "Send OTP"
              )}
            </button>
          </div>

          {error && (
            <div className="alert error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {otpError && (
            <div className="alert error">
              <span className="alert-icon">⚠️</span>
              {otpError}
            </div>
          )}

          {success && (
            <div className="alert success">
              <span className="alert-icon">✅</span>
              {success}
            </div>
          )}

          <div className="register-footer">
            <p>Already have an account? <button className="link-button" onClick={() => navigate('/login')}>Sign In</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}
