import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import io from "socket.io-client";
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ChatIcon from '@mui/icons-material/Chat';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import PersonIcon from '@mui/icons-material/Person';
import { AuthContext } from '../context/AuthContext';
import "../styles/Videomeet.css";

const serverurl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
const peerConfigconnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

export const Videomeet = () => {
  const { url: routeUrl } = useParams();
  const meetingCode = routeUrl || window.location.pathname.replace(/^\/+/, '') || 'general-meet';

  const { userData } = useContext(AuthContext);
  const storedUser = userData?.username || localStorage.getItem('username') || '';

  const connections = useRef({});
  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const routeTo = useNavigate();

  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const chatBottomRef = useRef(null);

  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(true);

  const [openChat, setOpenChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessage, setNewMessage] = useState(0);
  const [askForUserName, setAskForUserName] = useState(true);
  const [username, setUserName] = useState(storedUser);
  const [lobbyError, setLobbyError] = useState("");
  const [videos, setVideos] = useState([]);
  const [copiedToast, setCopiedToast] = useState(false);

  // Fallback silent audio track
  const silence = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const dst = oscillator.connect(ctx.createMediaStreamDestination());
      oscillator.start();
      ctx.resume();
      return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    } catch {
      return null;
    }
  };

  // Fallback black video track
  const black = ({ width = 640, height = 480 } = {}) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').fillRect(0, 0, width, height);
      const stream = canvas.captureStream();
      return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let active = true;

    const initMedia = async () => {
      try {
        let vAvailable = true;
        let aAvailable = true;

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (!active) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          window.localStream = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch {
          try {
            const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (!active) {
              vStream.getTracks().forEach(t => t.stop());
              return;
            }
            window.localStream = vStream;
            if (localVideoRef.current) localVideoRef.current.srcObject = vStream;
            aAvailable = false;
          } catch {
            vAvailable = false;
          }

          try {
            const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (!active) {
              aStream.getTracks().forEach(t => t.stop());
              return;
            }
            if (!window.localStream) {
              window.localStream = aStream;
              if (localVideoRef.current) localVideoRef.current.srcObject = aStream;
            }
            aAvailable = true;
          } catch {
            aAvailable = false;
          }
        }

        if (active) {
          setVideo(vAvailable);
          setAudio(aAvailable);
          setScreenAvailable(!!navigator.mediaDevices?.getDisplayMedia);
        }
      } catch (e) {
        console.error("Permission check failed:", e);
      }
    };

    initMedia();

    return () => {
      active = false;
    };
  }, []);

  // Ensure local video element renders stream after leaving lobby
  useEffect(() => {
    if (!askForUserName && localVideoRef.current && window.localStream) {
      localVideoRef.current.srcObject = screenStreamRef.current || window.localStream;
    }
  }, [askForUserName]);

  // Auto scroll chat
  useEffect(() => {
    if (openChat) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, openChat]);

  const handleRemoteVideo = (socketId, stream) => {
    if (!stream || socketId === socketIdRef.current) return;

    setVideos((prevVideos) => {
      const existingIndex = prevVideos.findIndex((v) => v.socketId === socketId);
      if (existingIndex > -1) {
        const updated = [...prevVideos];
        updated[existingIndex] = { ...updated[existingIndex], stream };
        return updated;
      }
      return [
        ...prevVideos,
        {
          socketId,
          stream,
          autoPlay: true,
          playsInline: true,
        }
      ];
    });
  };

  const gotMessageFromServer = useCallback((fromId, msg) => {
    try {
      const signal = JSON.parse(msg);
      if (fromId === socketIdRef.current) return;

      if (!connections.current[fromId]) {
        connections.current[fromId] = new RTCPeerConnection(peerConfigconnections);
      }

      if (signal.sdp) {
        connections.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections.current[fromId].createAnswer()
                .then((description) => {
                  connections.current[fromId].setLocalDescription(description)
                    .then(() => {
                      if (socketRef.current) {
                        socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections.current[fromId].localDescription }));
                      }
                    })
                    .catch(e => console.error("Error setting local description:", e));
                })
                .catch(e => console.error("Error creating answer:", e));
            }
          })
          .catch(e => console.error("Error setting remote description:", e));
      }

      if (signal.ice) {
        connections.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch(e => console.error("Error adding ICE candidate:", e));
      }
    } catch (e) {
      console.error("Signal parsing error:", e);
    }
  }, []);

  const addMessage = useCallback((data, sender, socketIdSender) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        sender: sender || "Anonymous",
        data,
        isSelf: socketIdSender === socketIdRef.current,
        time: timeStr,
      }
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessage((prev) => prev + 1);
    }
  }, []);

  const connectToSocketServer = useCallback(() => {
    socketRef.current = io(serverurl, { secure: false });
    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on('connect', () => {
      socketIdRef.current = socketRef.current.id;
      // Join room using meeting code
      socketRef.current.emit("join-meeting", meetingCode);

      socketRef.current.on('chat-message', addMessage);

      socketRef.current.on('user-left', (id) => {
        setVideos((prev) => prev.filter((v) => v.socketId !== id));
        if (connections.current[id]) {
          connections.current[id].close();
          delete connections.current[id];
        }
      });

      socketRef.current.on('user-joined', (id, clients) => {
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;
          if (!connections.current[socketListId]) {
            connections.current[socketListId] = new RTCPeerConnection(peerConfigconnections);
          }

          connections.current[socketListId].onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
          };

          connections.current[socketListId].ontrack = (event) => {
            const [stream] = event.streams;
            handleRemoteVideo(socketListId, stream);
          };

          const activeStream = screenStreamRef.current || window.localStream;
          if (activeStream) {
            activeStream.getTracks().forEach((track) => {
              try {
                connections.current[socketListId].addTrack(track, activeStream);
              } catch {
                // track might already be added
              }
            });
          } else {
            const b = black();
            const s = silence();
            const tracks = [b, s].filter(Boolean);
            if (tracks.length > 0) {
              const fallbackStream = new MediaStream(tracks);
              window.localStream = fallbackStream;
              tracks.forEach((track) => {
                try {
                  connections.current[socketListId].addTrack(track, fallbackStream);
                } catch {
                  // ignore
                }
              });
            }
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections.current) {
            if (id2 === socketIdRef.current) continue;
            connections.current[id2].createOffer()
              .then((description) => {
                connections.current[id2].setLocalDescription(description)
                  .then(() => {
                    if (socketRef.current) {
                      socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections.current[id2].localDescription }));
                    }
                  })
                  .catch(e => console.error(e));
              })
              .catch(e => console.error(e));
          }
        }
      });
    });
  }, [gotMessageFromServer, addMessage, meetingCode]);

  const connect = () => {
    if (!username.trim()) {
      setLobbyError("Please enter your name to join the meeting.");
      return;
    }
    setLobbyError("");
    setAskForUserName(false);
    connectToSocketServer();
  };

  // Toggle Video (mute/unmute camera track)
  const handleToggleVideo = () => {
    const nextState = !video;
    setVideo(nextState);
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach(track => {
        track.enabled = nextState;
      });
    }
  };

  // Toggle Audio (mute/unmute microphone track)
  const handleToggleAudio = () => {
    const nextState = !audio;
    setAudio(nextState);
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach(track => {
        track.enabled = nextState;
      });
    }
  };

  // Stop Screen Share
  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }

    if (localVideoRef.current && window.localStream) {
      localVideoRef.current.srcObject = window.localStream;
    }

    if (window.localStream) {
      const camTrack = window.localStream.getVideoTracks()[0];
      for (const id in connections.current) {
        const pc = connections.current[id];
        if (pc.getSenders) {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender && camTrack) {
            sender.replaceTrack(camTrack).catch(e => console.error(e));
          }
        }
      }
    }

    setScreenSharing(false);
  };

  // Toggle Screen Share
  const handleToggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = displayStream;
        const screenTrack = displayStream.getVideoTracks()[0];

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
        }

        for (const id in connections.current) {
          const pc = connections.current[id];
          if (pc.getSenders) {
            const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) {
              sender.replaceTrack(screenTrack).catch(e => console.error(e));
            } else {
              pc.addTrack(screenTrack, displayStream);
            }
          }
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setScreenSharing(true);
      } catch (err) {
        console.warn("Screen sharing cancelled:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;
    socketRef.current.emit("chat-message", message.trim(), username);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEndCall = () => {
    // Stop local media
    if (window.localStream) {
      window.localStream.getTracks().forEach(track => track.stop());
      window.localStream = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    // Close peer connections
    for (let id in connections.current) {
      if (connections.current[id]) {
        connections.current[id].close();
      }
    }
    connections.current = {};

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const token = localStorage.getItem("token");
    routeTo(token ? "/home" : "/");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
        window.localStream = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      for (let id in connections.current) {
        if (connections.current[id]) {
          connections.current[id].close();
        }
      }
      connections.current = {};
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const handleOpenChat = () => {
    setOpenChat(prev => {
      if (!prev) setNewMessage(0);
      return !prev;
    });
  };

  const copyMeetingInfo = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
  };

  return (
    <div className="meet-main-wrapper">
      {askForUserName ? (
        /* ============ LOBBY SCREEN ============ */
        <div className="meet-lobby">
          <header className="custom-navbar">
            <div className="nav-container">
              <Link to="/home" className="brand-logo">
                <div className="logo-icon-wrapper">
                  <VideoCallIcon className="brand-icon" />
                </div>
                <span className="brand-title">Video<span className="brand-accent">Meet</span></span>
              </Link>
              <div className="lobby-room-badge">
                <span>Room:</span>
                <strong>{meetingCode}</strong>
              </div>
            </div>
          </header>

          <div className="lobby-content">
            <div className="lobby-preview-box">
              <div className="lobby-video-container">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`lobby-video ${!video ? 'video-hidden' : ''}`}
                />
                {!video && (
                  <div className="video-placeholder">
                    <div className="avatar-circle large">
                      {(username || "U").charAt(0).toUpperCase()}
                    </div>
                    <span>Camera is off</span>
                  </div>
                )}
                <div className="lobby-preview-controls">
                  <Tooltip title={video ? "Turn Camera Off" : "Turn Camera On"}>
                    <button
                      onClick={handleToggleVideo}
                      className={`lobby-ctrl-btn ${!video ? 'ctrl-off' : ''}`}
                    >
                      {video ? <VideocamIcon /> : <VideocamOffIcon />}
                    </button>
                  </Tooltip>
                  <Tooltip title={audio ? "Mute Microphone" : "Unmute Microphone"}>
                    <button
                      onClick={handleToggleAudio}
                      className={`lobby-ctrl-btn ${!audio ? 'ctrl-off' : ''}`}
                    >
                      {audio ? <MicIcon /> : <MicOffIcon />}
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="lobby-card">
              <h2>Ready to join?</h2>
              <p>Test your camera and microphone, enter your display name, and step into the call.</p>

              {lobbyError && (
                <Alert severity="error" className="mb-3" onClose={() => setLobbyError("")}>
                  {lobbyError}
                </Alert>
              )}

              <div className="lobby-form">
                <div className="lobby-input-group">
                  <PersonIcon className="input-icon" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (lobbyError) setLobbyError("");
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && connect()}
                    className="lobby-input"
                  />
                </div>

                <button onClick={connect} className="btn-join-meeting">
                  <span>Join Meeting Now</span>
                </button>
              </div>

              <div className="lobby-footer-note">
                <span>Meeting Code: <code>{meetingCode}</code></span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============ IN-CALL ROOM SCREEN ============ */
        <div className="meet-room-container">
          {/* Top Bar with Room Info */}
          <div className="meet-top-bar">
            <div className="room-info">
              <span className="room-label">Meeting:</span>
              <span className="room-name">{meetingCode}</span>
            </div>
            <Tooltip title="Copy Meeting Link to Invite Others">
              <button onClick={copyMeetingInfo} className="btn-copy-link">
                <ContentCopyIcon fontSize="small" />
                <span>Copy Invite Link</span>
              </button>
            </Tooltip>
          </div>

          {/* Conference Video Grid */}
          <div className={`meet-grid-area ${openChat ? 'chat-expanded' : ''}`}>
            <div className="video-tiles-grid">
              {/* Local User Video Tile */}
              <div className={`video-tile local-tile ${screenSharing ? 'sharing-screen' : ''}`}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`tile-video ${!video && !screenSharing ? 'video-hidden' : ''} ${screenSharing ? 'screen-feed' : 'camera-feed'}`}
                />
                {!video && !screenSharing && (
                  <div className="video-placeholder">
                    <div className="avatar-circle">
                      {(username || "You").charAt(0).toUpperCase()}
                    </div>
                    <span>Camera is off</span>
                  </div>
                )}
                <div className="participant-badge">
                  <span>{username} (You{screenSharing ? ' - Presenting' : ''})</span>
                  {!audio && <MicOffIcon fontSize="small" className="mute-indicator" />}
                </div>
              </div>

              {/* Remote Participants */}
              {videos.map((vid, idx) => (
                <div key={vid.socketId || idx} className="video-tile remote-tile">
                  <video
                    data-socket={vid.socketId}
                    ref={(ref) => {
                      if (ref && vid.stream) {
                        ref.srcObject = vid.stream;
                      }
                    }}
                    autoPlay
                    playsInline
                    className="tile-video"
                  />
                  <div className="participant-badge">
                    <span>Participant {idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Dock Controls */}
          <div className="meet-controls-dock">
            <Tooltip title={audio ? "Mute Microphone" : "Unmute Microphone"}>
              <IconButton
                onClick={handleToggleAudio}
                className={`dock-btn ${!audio ? 'dock-btn-off' : 'dock-btn-on'}`}
              >
                {audio ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={video ? "Stop Video" : "Start Video"}>
              <IconButton
                onClick={handleToggleVideo}
                className={`dock-btn ${!video ? 'dock-btn-off' : 'dock-btn-on'}`}
              >
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
            </Tooltip>

            {screenAvailable && (
              <Tooltip title={screenSharing ? "Stop Sharing Screen" : "Share Screen"}>
                <IconButton
                  onClick={handleToggleScreenShare}
                  className={`dock-btn ${screenSharing ? 'dock-btn-active' : 'dock-btn-on'}`}
                >
                  {screenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="In-Call Chat">
              <Badge badgeContent={newMessage} color="error" max={99}>
                <IconButton
                  onClick={handleOpenChat}
                  className={`dock-btn ${openChat ? 'dock-btn-active' : 'dock-btn-on'}`}
                >
                  <ChatIcon />
                </IconButton>
              </Badge>
            </Tooltip>

            <Tooltip title="Leave Meeting">
              <IconButton onClick={handleEndCall} className="dock-btn dock-btn-end">
                <CallEndIcon />
              </IconButton>
            </Tooltip>
          </div>

          {/* Chat Sidebar Drawer */}
          {openChat && (
            <aside className="chat-drawer">
              <div className="chat-header">
                <div className="chat-title">
                  <ChatIcon fontSize="small" />
                  <h4>In-Call Messages</h4>
                </div>
                <IconButton onClick={handleOpenChat} className="chat-close-btn">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>

              <div className="chat-notice">
                <span>Messages are visible to participants in this call.</span>
              </div>

              <div className="chat-messages-container">
                {messages.length === 0 ? (
                  <div className="chat-empty">
                    <span>No messages yet. Say hello!</span>
                  </div>
                ) : (
                  messages.map((item, index) => (
                    <div
                      key={index}
                      className={`chat-bubble-row ${item.isSelf ? 'msg-self' : 'msg-peer'}`}
                    >
                      <div className="bubble-wrapper">
                        <div className="bubble-header">
                          <span className="msg-sender">{item.isSelf ? "You" : item.sender}</span>
                          <span className="msg-time">{item.time}</span>
                        </div>
                        <p className="msg-text">{item.data}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatBottomRef} />
              </div>

              <div className="chat-input-area">
                <input
                  type="text"
                  placeholder="Send a message to everyone..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="chat-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="chat-send-btn"
                  aria-label="Send message"
                >
                  <SendIcon fontSize="small" />
                </button>
              </div>
            </aside>
          )}
        </div>
      )}

      <Snackbar
        open={copiedToast}
        autoHideDuration={3000}
        onClose={() => setCopiedToast(false)}
        message="Meeting link copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
};

