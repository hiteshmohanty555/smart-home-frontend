// src/App.js


import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ProfilesManager from "./components/ProfilesManager";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login onLogin={setUser} onShowRegister={() => {}} />} />
        <Route path="/register" element={<Register onRegister={setUser} onShowLogin={() => {}} />} />
        <Route path="/profiles" element={
          user ? <ProfilesManager token={user.token} onSelectProfile={setSelectedProfile} /> : <Navigate to="/login" />
        } />
        <Route path="/dashboard" element={
          user && selectedProfile ? <Dashboard user={user} selectedProfile={selectedProfile} /> : <Navigate to="/login" />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
