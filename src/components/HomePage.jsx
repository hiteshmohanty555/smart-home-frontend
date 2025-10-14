import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Welcome to Smart Home</h1>
        <p>Your intelligent home control system</p>
      </header>

      <main className="home-main">
        <section className="hero">
          <div className="hero-content">
            <h2>Control Your Home with Ease</h2>
            <p>
              Experience the future of home automation with our comprehensive smart home solution.
              Monitor and control lights, fans, climate, safety systems, and more from anywhere.
            </p>
            <button className="cta-button" onClick={() => navigate('/login')}>
              Get Started
            </button>
          </div>
          <div className="hero-image">
            {/* Placeholder for smart home illustration */}
            <div className="smart-home-icon">🏠</div>
          </div>
        </section>

        <section className="features">
          <h3>Key Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h4>Lighting Control</h4>
              <p>Turn lights on/off and adjust brightness remotely.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌡️</div>
              <h4>Climate Monitoring</h4>
              <p>Monitor temperature and humidity in real-time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌀</div>
              <h4>Fan Control</h4>
              <p>Adjust fan speed from 0 to 5 with ease.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚨</div>
              <h4>Safety & Security</h4>
              <p>Smoke detection and water tank monitoring.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h4>Mobile Access</h4>
              <p>Control your home from your smartphone or web browser.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h4>Real-time Updates</h4>
              <p>Get instant notifications and live status updates.</p>
            </div>
          </div>
        </section>

        <section className="about">
          <h3>About Smart Home</h3>
          <p>
            Our smart home system integrates seamlessly with your existing devices to provide
            a centralized control hub. Whether you're at home or away, maintain comfort,
            security, and efficiency with our intuitive interface and powerful automation features.
          </p>
        </section>
      </main>

      <footer className="home-footer">
        <p>&copy; 2024 Smart Home by Team Alpha. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
