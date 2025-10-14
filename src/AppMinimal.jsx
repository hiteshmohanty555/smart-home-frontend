import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

function AppContent() {
  const [user, setUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    // Store user token or info in localStorage or context as needed
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    // Set default profile if available
    if (userData.profiles && userData.profiles.length > 0) {
      const defaultProfile = userData.profiles.find(p => p.isDefault) || userData.profiles[0];
      setSelectedProfile(defaultProfile);
      localStorage.setItem("selectedProfile", JSON.stringify(defaultProfile));
    }
    // Redirect to dashboard after login
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedProfile(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <Dashboard
            user={user}
            selectedProfile={selectedProfile}
            onLogout={handleLogout}
          />
        }
      />
    </Routes>
  );
}

export default function AppMinimal() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
