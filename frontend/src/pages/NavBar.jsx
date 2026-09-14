import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export const NavBar = () => {
  const { userData, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <header className="custom-navbar">
      <div className="nav-container">
        <Link to="/" className="brand-logo">
          <div className="logo-icon-wrapper">
            <VideoCallIcon className="brand-icon" />
          </div>
          <span className="brand-title">Video<span className="brand-accent">Meet</span></span>
        </Link>

        <nav className="nav-actions">
          {userData?.token ? (
            <>
              <Link to="/home" className="nav-btn nav-btn-outline">
                <DashboardIcon fontSize="small" />
                <span>Dashboard</span>
              </Link>
              <button onClick={onLogout} className="nav-btn nav-btn-ghost">
                <LogoutIcon fontSize="small" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn nav-btn-ghost">
                <LoginIcon fontSize="small" />
                <span>Login</span>
              </Link>
              <Link to="/register" className="nav-btn nav-btn-primary">
                <PersonAddIcon fontSize="small" />
                <span>Register</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

