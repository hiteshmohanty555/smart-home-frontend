import React, { useEffect, useState, useRef } from "react";
import "../App.css";
import FanDial from "./FanDial";
import { getStatus, postLight, postFan, postUpdate, API_BASE, getUserProfile, setActiveProfile } from "../api";
import WebSocketClient from "../utils/WebSocketClient";
import WeatherAnim from "./WeatherAnim";
import ProfileSlider from "./ProfileSlider";
import { useNavigate } from "react-router-dom";

const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:5000";

export default function Dashboard({ user, selectedProfile }) {
  const [state, setState] = useState({
    lightOn: false,
    fanSpeed: 0,
    tankLevel: 0,
    pumpOn: false,
    smokeDetected: false,
    climate: {
      tempC: "--",
      humidity: "--",
      feelsLike: "--",
      pressure: "--",
      visibility: "--",
      condition: "Unknown"
    }
  });
  const [connected, setConnected] = useState(false);
  const [showProfileSlider, setShowProfileSlider] = useState(false);
  const [userProfiles, setUserProfiles] = useState([]);
  const [localSelectedProfile, setLocalSelectedProfile] = useState(selectedProfile);
  const wsRef = useRef(null);
  const lastNonZeroSpeed = useRef(3); // default fallback speed when turning fan on
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    getStatus().then(d => {
      setState(s => ({ ...s, ...d }));
      if (d.fanSpeed && d.fanSpeed > 0) lastNonZeroSpeed.current = d.fanSpeed;
    }).catch(e => console.warn("Initial status failed:", e));
  }, [user]);

  // WebSocket subscription
  useEffect(() => {
    if (!user) return;
    const ws = new WebSocketClient(WS_URL);
    wsRef.current = ws;
    ws.connect();

    const unsub = ws.subscribe((msg) => {
      if (!msg) return;
      if (msg.type === "ws_open") { setConnected(true); return; }
      if (msg.type === "ws_close") { setConnected(false); return; }
      if (msg.type === "status_update" || msg.type === "state") {
        setState(s => ({ ...s, ...msg }));
        if (msg.fanSpeed && msg.fanSpeed > 0) lastNonZeroSpeed.current = msg.fanSpeed;
      }
      if (msg.type === "device") {
        if (msg.device === "fan") {
          setState(s => ({ ...s, fanSpeed: msg.speed }));
          if (msg.speed > 0) lastNonZeroSpeed.current = msg.speed;
        }
        if (msg.device === "light") setState(s => ({ ...s, lightOn: msg.state }));
      }
      if (msg.type === "sensor") {
        setState(s => ({
          ...s,
          climate: {
            ...s.climate,
            tempC: msg.temperature || s.climate.tempC,
            humidity: msg.humidity || s.climate.humidity,
            feelsLike: msg.feelsLike || s.climate.feelsLike,
            pressure: msg.pressure || s.climate.pressure,
            visibility: msg.visibility || s.climate.visibility,
            condition: msg.condition || s.climate.condition
          },
          tankLevel: msg.tankLevel,
          smokeDetected: msg.smokeDetected
        }));
      }
    });

    return () => unsub();
  }, [user]);

  const changeFanSpeed = (speed) => {
    if (!user) return;
    postFan(speed).catch(e => console.warn("Failed to set fan speed:", e));
  };

  const toggleFanPower = () => {
    if (!user) return;
    const newSpeed = state.fanSpeed > 0 ? 0 : lastNonZeroSpeed.current;
    postFan(newSpeed).catch(e => console.warn("Failed to toggle fan power:", e));
  };

  const toggleLight = () => {
    if (!user) return;
    postLight(!state.lightOn).catch(e => console.warn("Failed to toggle light:", e));
  };

  const resetSmoke = () => {
    if (!user) return;
    postUpdate({ smokeDetected: false }).catch(e => console.warn("Failed to reset smoke alarm:", e));
  };

  const smokeClass = state.smokeDetected ? "smoke-alert" : "smoke-safe";
  const pumpClass = state.pumpOn ? "pump-on" : "pump-off";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      'clear': '☀️',
      'sunny': '☀️',
      'cloudy': '☁️',
      'partly-cloudy': '⛅',
      'rain': '🌧️',
      'snow': '❄️',
      'unknown': '🌤️'
    };
    return icons[condition?.toLowerCase()] || icons.unknown;
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const profileData = await getUserProfile(token);
      setUserProfiles(profileData.profiles || []);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const toggleProfileSlider = () => {
    if (!showProfileSlider) {
      fetchUserProfile();
    }
    setShowProfileSlider(!showProfileSlider);
  };

  const closeProfileSlider = () => {
    setShowProfileSlider(false);
  };

  const handleProfileSelect = async (profile) => {
    try {
      const token = localStorage.getItem('token');
      if (token && profile._id) {
        await setActiveProfile(token, profile._id);
      }
      setLocalSelectedProfile(profile);
      setShowProfileSlider(false);
    } catch (error) {
      console.error('Failed to set active profile:', error);
      // Still update local state even if API call fails
      setLocalSelectedProfile(profile);
      setShowProfileSlider(false);
    }
  };

  return (
    <div
      className="dashboard-container"
      style={{
        backgroundColor: localSelectedProfile?.backgroundPreference || '#f5f5f5'
      }}
    >
      {/* Enhanced Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand-section">
            <h1 className="dashboard-title">🏠 Smart Home Dashboard</h1>
            <p className="dashboard-subtitle">Intelligent Home Control System</p>
          </div>
          <div className="header-controls">
            <div className="status-indicators">
              <div className="status-item clickable" onClick={toggleProfileSlider}>
                <div className="profile-display">
                  {localSelectedProfile?.photo ? (
                    <img
                      src={`${API_BASE}${localSelectedProfile.photo}`}
                      alt={localSelectedProfile.name}
                      className="profile-avatar"
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      <span className="avatar-icon">👤</span>
                    </div>
                  )}
                  <div className="profile-info">
                    <span className="profile-name">{localSelectedProfile?.name || selectedProfile?.name || 'Default'}</span>
                    <span className="click-hint">👆 Click to view details</span>
                  </div>
                </div>
              </div>
              <div className="status-item">
                <div className={`connection-indicator ${connected ? 'online' : 'offline'}`}>
                  <span className="indicator-dot"></span>
                  <span className="status-text">{connected ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Enhanced Climate Section */}
        <section className="climate-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">🌡️</span>
              Climate Conditions
            </h2>
            <div className="weather-icon-large">
              {getWeatherIcon(state.climate.condition)}
            </div>
          </div>

          <div className="climate-grid">
            <div className="climate-primary">
              <div className="temperature-display">
                <div className="temp-main">
                  <span className="temp-value" data-placeholder={state.climate.tempC === "--"}>{state.climate.tempC}</span>
                  <span className="temp-unit">°C</span>
                </div>
                <div className="temp-label">Temperature</div>
              </div>

              <div className="humidity-display">
                <div className="humidity-main">
                  <span className="humidity-value" data-placeholder={state.climate.humidity === "--"}>{state.climate.humidity}</span>
                  <span className="humidity-unit">%</span>
                </div>
                <div className="humidity-label">Humidity</div>
              </div>
            </div>

            <div className="climate-secondary">
              <div className="climate-detail">
                <span className="detail-label">Feels Like:</span>
                <span className="detail-value" data-placeholder={state.climate.feelsLike === "--"}>{state.climate.feelsLike}°C</span>
              </div>
              <div className="climate-detail">
                <span className="detail-label">Pressure:</span>
                <span className="detail-value" data-placeholder={state.climate.pressure === "--"}>{state.climate.pressure} hPa</span>
              </div>
              <div className="climate-detail">
                <span className="detail-label">Visibility:</span>
                <span className="detail-value" data-placeholder={state.climate.visibility === "--"}>{state.climate.visibility} km</span>
              </div>
              <div className="climate-detail">
                <span className="detail-label">Condition:</span>
                <span className="detail-value" data-placeholder={state.climate.condition === "Unknown"}>{state.climate.condition}</span>
              </div>
            </div>
          </div>

          <div className="weather-animation">
            <WeatherAnim
              temp={state.climate.tempC}
              humidity={state.climate.humidity}
              condition={state.climate.condition}
            />
          </div>
        </section>

        {/* Enhanced Light Control */}
        <section className="control-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">💡</span>
              Lighting Control
            </h2>
          </div>
          <div className="control-content">
            <button
              className={`control-btn ${state.lightOn ? "active" : ""}`}
              onClick={toggleLight}
            >
              <span className="btn-icon">{state.lightOn ? '🔆' : '💡'}</span>
              <span className="btn-text">{state.lightOn ? "Turn Off" : "Turn On"}</span>
            </button>
            <div className={`status-indicator ${state.lightOn ? 'on' : 'off'}`}>
              {state.lightOn ? 'Lights On' : 'Lights Off'}
            </div>
          </div>
        </section>

        {/* Enhanced Fan Control */}
        <section className="control-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">🌀</span>
              Fan Control
            </h2>
          </div>
          <div className="fan-control-content">
            <div className="fan-dial-section">
              <FanDial value={state.fanSpeed} onChange={changeFanSpeed} size={180} />
              <div className="fan-speed-display">
                <div className="speed-value">{state.fanSpeed}</div>
                <div className="speed-label">Speed Level</div>
              </div>
            </div>
            <div className="fan-buttons">
              <button
                className={`control-btn ${state.fanSpeed > 0 ? "active" : ""}`}
                onClick={toggleFanPower}
              >
                <span className="btn-icon">{state.fanSpeed > 0 ? '⏹️' : '▶️'}</span>
                <span className="btn-text">{state.fanSpeed > 0 ? "Fan OFF" : "Fan ON"}</span>
              </button>
            </div>
          </div>
          <div className="control-hint">Drag the dial or use buttons to control fan speed (0–5)</div>
        </section>

        {/* Enhanced Safety & Water */}
        <section className="monitoring-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">🛡️</span>
              Safety & Water Monitoring
            </h2>
          </div>
          <div className="monitoring-grid">
            <div className="monitoring-item">
              <div className="monitoring-header">
                <h3 className="monitoring-title">Water Tank</h3>
                <div className={`status-chip ${pumpClass}`}>
                  Pump {state.pumpOn ? "ON" : "OFF"}
                </div>
              </div>
              <div className="water-tank-container">
                <div className="water-tank" aria-hidden>
                  <div className="water" style={{ height: `${state.tankLevel ?? 0}%` }} />
                  <div className="tank-overlay">
                    <div className="tank-percentage">{state.tankLevel ?? 0}%</div>
                    <div className="tank-label">Filled</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="monitoring-item">
              <div className="monitoring-header">
                <h3 className="monitoring-title">Smoke Detection</h3>
                <div className={`status-chip ${smokeClass}`}>
                  {state.smokeDetected ? "🚨 ALERT" : "✅ SAFE"}
                </div>
              </div>
              <div className={`smoke-status ${smokeClass}`}>
                <div className="status-icon">
                  {state.smokeDetected ? '🚨' : '✅'}
                </div>
                <div className="status-message">
                  {state.smokeDetected ? "SMOKE DETECTED!" : "No Smoke Detected"}
                </div>
              </div>
              <button
                className="reset-btn"
                onClick={resetSmoke}
                disabled={!state.smokeDetected}
              >
                <span className="btn-icon">🔄</span>
                Reset Smoke Alarm
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>&copy; 2026 My Smart Space by Team Alpha. All rights reserved.</p>
          <div className="footer-stats">
            <span>System Status: {connected ? '🟢 Online' : '🔴 Offline'}</span>
            <span>•</span>
            <span>Last Updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </footer>

      {/* Profile Slider */}
      <ProfileSlider
        user={user}
        profiles={userProfiles}
        isOpen={showProfileSlider}
        onClose={closeProfileSlider}
        token={localStorage.getItem('token')}
        selectedProfile={localSelectedProfile}
        onProfileSelect={handleProfileSelect}
        onProfileCreated={(newProfile) => {
          setUserProfiles(prev => [...prev, newProfile]);
        }}
      />
    </div>
  );
}
