import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { WithAuth } from '../utils/WithAuth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';

const HistoryComponent = () => {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const history = await getHistoryOfUser();
        if (isMounted) {
          // Sort meetings by date descending (most recent first)
          const sorted = Array.isArray(history)
            ? [...history].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            : [];
          setMeetings(sorted);
        }
      } catch (e) {
        console.error('Error loading history:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchChatHistory();
    return () => {
      isMounted = false;
    };
  }, [getHistoryOfUser]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (meetingId) => {
    navigator.clipboard.writeText(meetingId);
    setToastMessage(`Copied meeting code "${meetingId}" to clipboard!`);
    setToastOpen(true);
  };

  const handleRejoin = (meetingId) => {
    navigate(`/${meetingId}`);
  };

  return (
    <div className="history-page">
      <header className="custom-navbar">
        <div className="nav-container">
          <Link to="/home" className="brand-logo">
            <div className="logo-icon-wrapper">
              <VideoCallIcon className="brand-icon" />
            </div>
            <span className="brand-title">Video<span className="brand-accent">Meet</span></span>
          </Link>

          <Link to="/home" className="nav-btn nav-btn-outline">
            <ArrowBackIcon fontSize="small" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="history-container">
        <div className="history-header">
          <div className="history-title-section">
            <div className="history-icon-circle">
              <EventNoteIcon />
            </div>
            <div>
              <h2>Meeting History</h2>
              <p>Review and rejoin your past conferences and calls</p>
            </div>
          </div>
          <span className="history-count-badge">
            {meetings.length} {meetings.length === 1 ? 'Meeting' : 'Meetings'}
          </span>
        </div>

        {loading ? (
          <div className="history-loading">
            <CircularProgress sx={{ color: '#f59e0b' }} />
            <p>Loading your meeting history...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="history-empty-card">
            <div className="empty-icon-wrapper">
              <EventNoteIcon sx={{ fontSize: 60, color: '#64748b' }} />
            </div>
            <h3>No Meetings Found</h3>
            <p>You haven't participated in any meetings yet. Start an instant meeting or join one using a code.</p>
            <Link to="/home" className="btn-hero-primary mt-3">
              <VideoCallIcon />
              <span>Start a Meeting</span>
            </Link>
          </div>
        ) : (
          <div className="history-grid">
            {meetings.map((meeting, index) => (
              <div key={meeting._id || index} className="history-card">
                <div className="history-card-header">
                  <span className="meeting-tag">Meeting</span>
                  <span className="meeting-date">{formatDate(meeting.createdAt)}</span>
                </div>

                <div className="history-card-body">
                  <div className="code-display-box">
                    <span className="code-label">Code:</span>
                    <span className="code-value">{meeting.meetingId}</span>
                  </div>
                </div>

                <div className="history-card-actions">
                  <Tooltip title="Copy Code">
                    <button
                      onClick={() => copyToClipboard(meeting.meetingId)}
                      className="card-action-btn btn-copy"
                    >
                      <ContentCopyIcon fontSize="small" />
                      <span>Copy</span>
                    </button>
                  </Tooltip>

                  <button
                    onClick={() => handleRejoin(meeting.meetingId)}
                    className="card-action-btn btn-rejoin"
                  >
                    <PlayArrowIcon fontSize="small" />
                    <span>Rejoin</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
};

export const History = WithAuth(HistoryComponent);
export default History;

