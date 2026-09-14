import React from 'react';
import { Link } from 'react-router-dom';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupsIcon from '@mui/icons-material/Groups';

export const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-pulse"></span>
          <span>Next-Gen Video Collaboration</span>
        </div>

        <h1 className="hero-title">
          <span className="gradient-text">Connect</span> with anyone, anywhere in HD
        </h1>

        <p className="hero-subtitle">
          Experience seamless, high-quality video meetings with crystal-clear audio,
          instant screen sharing, and interactive live chat — no downloads required.
        </p>

        <div className="hero-cta-group">
          <Link to="/home" className="btn-hero-primary">
            <VideoCameraFrontIcon />
            <span>Get Started Free</span>
          </Link>
          <Link to="/login" className="btn-hero-secondary">
            <span>Sign In</span>
          </Link>
        </div>

        <div className="hero-features-row">
          <div className="feature-item">
            <SecurityIcon className="feature-icon" />
            <span>End-to-End Encryption</span>
          </div>
          <div className="feature-item">
            <SpeedIcon className="feature-icon" />
            <span>Ultra Low Latency</span>
          </div>
          <div className="feature-item">
            <GroupsIcon className="feature-icon" />
            <span>Multi-Peer Calls</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="visual-card">
          <img src="/mobile.png" alt="VideoMeet App Preview" className="hero-image" />
          <div className="visual-glow"></div>
        </div>
      </div>
    </section>
  );
};

