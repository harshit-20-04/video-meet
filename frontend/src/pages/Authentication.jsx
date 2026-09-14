import React, { useContext, useState } from 'react';
import Form from 'react-bootstrap/Form';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { BackButton } from './BackButton.jsx';

export const Register = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [err, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { handleRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!name.trim() || !userName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await handleRegister(name.trim(), userName.trim(), email.trim(), password);
      setMessage(res || "Account created successfully!");
      setOpen(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <div className="auth-page">
      <BackButton />
      <div className="auth-card-container">
        <div className="auth-side-panel">
          <div className="auth-side-content">
            <div className="auth-brand">
              <VideoCallIcon className="auth-brand-icon" />
              <span>Video<span className="brand-accent">Meet</span></span>
            </div>
            <h3>Join our collaborative community</h3>
            <p>Create an account to host unlimited meetings, invite teammates, and keep track of your meeting history.</p>
            <img src="/bannerforlogin.png" alt="Register Visual" className="auth-visual-img" />
            <div className="auth-switch-link">
              <span>Already have an account?</span>
              <Link to="/login" className="switch-link-btn">Log In</Link>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-header">
            <div className="auth-icon-badge">
              <AccountCircleIcon fontSize="large" />
            </div>
            <h2>Create Account</h2>
            <p className="auth-subtitle">Get started with free video conferencing today</p>
          </div>

          {err && (
            <Alert severity="error" className="auth-alert mb-3" onClose={() => setError("")}>
              {err}
            </Alert>
          )}

          <Form onSubmit={handleAuth} className="auth-form">
            <Form.Group className="mb-3" controlId="registerName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. janedoe"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="registerPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <CircularProgress size={18} sx={{ color: '#ffffff', mr: 1 }} />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </Form>
        </div>
      </div>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </div>
  );
};

export const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [err, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await handleLogin(userName.trim(), password);
      setMessage(res || "Login successful! Redirecting...");
      setOpen(true);
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Invalid credentials or server unavailable.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <div className="auth-page">
      <BackButton />
      <div className="auth-card-container">
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <div className="auth-icon-badge">
              <LockIcon fontSize="large" />
            </div>
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Sign in to join your calls and manage meetings</p>
          </div>

          {err && (
            <Alert severity="error" className="auth-alert mb-3" onClose={() => setError("")}>
              {err}
            </Alert>
          )}

          <Form onSubmit={handleAuth} className="auth-form">
            <Form.Group className="mb-3" controlId="loginUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <CircularProgress size={18} sx={{ color: '#ffffff', mr: 1 }} />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>
          </Form>
        </div>

        <div className="auth-side-panel">
          <div className="auth-side-content">
            <div className="auth-brand">
              <VideoCallIcon className="auth-brand-icon" />
              <span>Video<span className="brand-accent">Meet</span></span>
            </div>
            <h3>Crystal Clear Video Calls</h3>
            <p>Connect with loved ones and colleagues seamlessly with HD video and zero friction.</p>
            <img src="/bannerforlogin.png" alt="Login Visual" className="auth-visual-img" />
            <div className="auth-switch-link">
              <span>Don't have an account?</span>
              <Link to="/register" className="switch-link-btn">Create Account</Link>
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={message}
        onClose={handleClose}
      />
    </div>
  );
};


