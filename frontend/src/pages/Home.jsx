import React, { useState, useContext } from 'react';
import { WithAuth } from '../utils/WithAuth';
import { useNavigate, Link } from 'react-router-dom';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const [meetingCode, setMeetingCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { userData, handleLogout, addUserHistory } = useContext(AuthContext);
  const username = userData?.username || localStorage.getItem('username') || 'User';

  const cleanInputCode = (input) => {
    if (!input) return '';
    const trimmed = input.trim();
    // Support pasting full URL or path
    const parts = trimmed.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : trimmed;
  };

  const handleJoinVideoCall = async (e) => {
    if (e) e.preventDefault();
    const code = cleanInputCode(meetingCode);
    if (!code) {
      setErrorMsg('Please enter a valid meeting code or URL.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      try {
        await addUserHistory(code);
      } catch (err) {
        console.warn('Could not record meeting history:', err);
      }
      navigate(`/${code}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInstantMeeting = async () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const seg = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const newCode = `${seg(3)}-${seg(4)}-${seg(3)}`;

    try {
      setLoading(true);
      try {
        await addUserHistory(newCode);
      } catch (err) {
        console.warn('Could not record meeting history:', err);
      }
      navigate(`/${newCode}`);
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <div className="home-dashboard">
      <header className="custom-navbar">
        <div className="nav-container">
          <Link to="/home" className="brand-logo">
            <div className="logo-icon-wrapper">
              <VideoCallIcon className="brand-icon" />
            </div>
            <span className="brand-title">Video<span className="brand-accent">Meet</span></span>
          </Link>

          <div className="nav-actions">
            <div className="user-pill">
              <div className="avatar-circle">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="username-display">{username}</span>
            </div>

            <Tooltip title="Meeting History">
              <Link to="/history" className="nav-icon-btn" aria-label="Meeting History">
                <HistoryIcon />
              </Link>
            </Tooltip>

            <Tooltip title="Log Out">
              <button onClick={onLogout} className="nav-icon-btn logout-btn" aria-label="Log Out">
                <LogoutIcon />
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-left">
            <div className="welcome-banner">
              <span className="greeting-badge">Welcome back, {username} 👋</span>
              <h1>High quality video meetings for everyone</h1>
              <p>
                Connect, collaborate, and celebrate from anywhere with secure video calling.
                Start a new meeting or enter a code to join an ongoing call.
              </p>
            </div>

            {errorMsg && (
              <Alert severity="error" className="mb-3" onClose={() => setErrorMsg('')}>
                {errorMsg}
              </Alert>
            )}

            <div className="meeting-action-card">
              <div className="action-buttons-wrapper">
                <button
                  onClick={handleStartInstantMeeting}
                  className="btn-new-meeting"
                  disabled={loading}
                >
                  <AddCircleOutlineIcon />
                  <span>Start Instant Meeting</span>
                </button>

                <div className="divider-or">
                  <span>or</span>
                </div>

                <form onSubmit={handleJoinVideoCall} className="join-form">
                  <div className="join-input-group">
                    <input
                      type="text"
                      className="join-input"
                      placeholder="Enter a code or link"
                      value={meetingCode}
                      onChange={(e) => {
                        setMeetingCode(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                    />
                    <button
                      type="submit"
                      className="btn-join"
                      disabled={loading || !meetingCode.trim()}
                    >
                      <span>Join</span>
                      <ArrowForwardIcon fontSize="small" />
                    </button>
                  </div>
                </form>
              </div>

              <div className="quick-tip">
                <span className="tip-dot"></span>
                <span>Tip: You can paste a full meeting URL or just the meeting code.</span>
              </div>
            </div>
          </div>

          <div className="dashboard-right">
            <div className="illustration-wrapper">
              <img src="/logo.svg" alt="VideoMeet Illustration" className="dashboard-illustration" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ProtectedHome = WithAuth(Home);
export default ProtectedHome;
