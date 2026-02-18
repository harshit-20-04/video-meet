import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ChatIcon from '@mui/icons-material/Chat';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import "../styles/Videomeet.css";
import Badge from '@mui/material/Badge';



const serverurl = import.meta.env.VITE_SERVER_URL;
const peerConfigconnections = {
    'iceServers': [
        { 'urls': "stun:stun.l.google.com:19302" }
    ]
};

export const Videomeet = () => {
    const connections = useRef({});
    var socketRef = useRef();
    let socketIdRef = useRef();
    let routeTo = useNavigate();

    let localVideoRef = useRef();

    let [audioAvailable, setAudioAvailable] = useState(true);
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [video, setVideo] = useState();
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [screenAvailable, setScreenAvailable] = useState(true);
    let [openChat, setOpenChat] = useState(false);
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessage, setNewMessage] = useState(0);
    let [askForUserName, setAskForUserName] = useState(true);
    let [username, setUserName] = useState("");
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);

    useEffect(() => {
        getPermissions();
    }, []);

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log("video permission granted");
            }
            else {
                setVideoAvailable(false);
                console.log("video permission denied");
            }
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });

            if (audioPermission) {
                setAudioAvailable(true);
                console.log("audio perimssion granted");
            }
            else {
                setAudioAvailable(false);
                console.log("audio permission denied");
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (audioAvailable || videoAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio])

    useEffect(() => {
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);


    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) {
            console.log(e);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;
        for (let id in connections.current) {
            if (id === socketIdRef.current) continue;

            window.localStream.getTracks().forEach(track => {
                connections.current[id].addTrack(track, window.localStream);
            });;
            connections.current[id].createOffer().then((description) => {
                console.log(description);
                connections.current[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections.current[id].localDescription }))
                    }).catch(e => console.log(e));
            })
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch (e) {
                console.log(e)
            }
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections.current) {
                window.localStream.getTracks().forEach(track => {
                    connections.current[id].addTrack(track, window.localStream);
                });;
                connections.current[id].createOffer().then((description) => {
                    connections.current[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections.current[id].localDescription }))
                        }).catch(e => console.log(e))
                })
            }

        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then(stream => { })
                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) {
                console.log(e)
            }
        }
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            connections.current[fromId].createAnswer().then((description) => {
                                connections.current[fromId].setLocalDescription(description)
                                    .then(() => {
                                        socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections.current[fromId].localDescription }))
                                    }).catch(e => console.log(e));
                            }).catch(e => console.log(e));
                        }
                    }).catch(e => console.log(e));
            }
            if (signal.ice) {
                connections.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    }

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages, {
                sender: sender, data: data
            }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessage((prev) => prev + 1)
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io(serverurl, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer)
        socketRef.current.on('connect', () => {
            socketRef.current.emit("join-meeting", window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on('chat-message', addMessage)
            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })
            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) return;
                    connections.current[socketListId] = new RTCPeerConnection(peerConfigconnections);
                    connections.current[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    }
                    connections.current[socketListId].ontrack = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);
                        if (videoExists) {
                            setVideos((videos) => {
                                const updateVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.streams[0] } : video
                                );
                                videoRef.current = updateVideos;
                                return updateVideos;
                            })
                        } else {
                            if (videoRef.current.some(v => v.socketId === socketListId)) return;
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.streams[0],
                                autoPlay: true,
                                playsInline: true
                            }
                            setVideos(videos => {
                                const updateVideos = [...videos, newVideo];
                                videoRef.current = updateVideos;
                                return updateVideos;
                            })
                        }
                    }
                    if (window.localStream !== undefined && window.localStream !== null) {
                        window.localStream.getTracks().forEach(track => {
                            connections.current[socketListId].addTrack(track, window.localStream);
                        });
                        ;
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        window.localStream.getTracks().forEach(track => {
                            connections.current[socketListId].addTrack(track, window.localStream);
                        });


                    }
                })
                if (id === socketIdRef.current) {
                    for (let id2 in connections.current) {
                        if (id2 === socketIdRef.current) continue;
                        try {
                            window.localStream.getTracks().forEach(track => {
                                connections.current[id2].addTrack(track, window.localStream);
                            });

                        } catch (e) {
                            console.log(e);
                        }
                        connections.current[id2].createOffer().then((description) => {
                            connections.current[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections.current[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });

    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let connect = () => {
        setAskForUserName(false);
        getMedia();
    }

    let getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) {
            console.log(e);
        }
        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections.current) {
            if (id === socketIdRef.current) continue;
            window.localStream.getTracks().forEach(track => {
                connections.current[id].addTrack(track, window.localStream);
            });
            connections.current[id].createOffer().then((description) => {
                connections.current[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections.current[id].localDescription }))
                }).catch(e => console.log(e))
            })
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setScreenAvailable(false);
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch (e) {
                console.log(e)
            }
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();

        })
    }

    let getDisplayMedia = () => {
        if (screenAvailable) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch(e => console.log(e));
            }
        }
    }
    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen);
    }


    let sendMessage = () => {
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        } catch (e) { console.log(e) }

        
        routeTo('/home');
        window.location.href = "/home";
    }

    let handleLogo= ()=>{
        window.location.href="/home";
        routeTo('/home');
    }

    return (
        <div className='main-container'>
            {askForUserName === true ?
                <div style={{ backgroundColor: "black" }}>
                    <Link onClick={handleLogo} className='nav-type'>VideoMeet</Link>
                    <div className='guestContainer'>
                        <div className='wrapContainer'>
                            <h2 className='text-white'>Enter into Meet</h2>
                            <input className='guestMeetCode' type="text" placeholder='Enter UserName' value={username} onChange={(e) => setUserName(e.target.value)} />
                            <button onClick={connect}>Connect</button>
                        </div>
                        <div>
                            <video ref={localVideoRef} autoPlay muted></video>
                        </div>
                    </div>
                </div> :
                <div className='meetVideoContainer'>
                    <div className="buttonContainer">
                        <IconButton className='text-white' onClick={() => {
                            setVideo(!video);
                        }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton className='text-white' onClick={() => {
                            setAudio(!audio);
                        }}>
                            {(audio === true) ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                        {screenAvailable === true ?
                            <IconButton className='text-white' onClick={handleScreen}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton>
                            : <></>}
                        <Badge badgeContent={newMessage} max={"100+"} color='primary'>
                            <IconButton className='text-white' onClick={() => setOpenChat(!openChat)}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                        <IconButton style={{ color: "red" }} onClick={handleEndCall}>
                            <CallEndIcon />
                        </IconButton>
                    </div>

                    <video className='meetUserVideo' ref={localVideoRef} autoPlay muted></video>
                    <div className='conferenceView'>
                        {videos.map((video) => (
                            <div key={video.socketId + Math.random()}>
                                <video
                                    data-socket={video.socketId + Math.random()}
                                    ref={(ref) => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }
                                    } autoPlay />
                            </div>
                        )
                        )}
                    </div>
                </div>
            }
            {openChat === true ?
                <div className='chat-container'>
                    <div className="chat-startcontainer">
                        {messages.map((item, index) => {
                            return (
                                <div key={index} className='mx-2'>
                                    <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                    <p className='mx-2'>{item.data}</p>
                                </div>
                            )
                        })}
                    </div>
                    <div className='newMessageSection'>
                        <input type="text" placeholder='Send Messages' value={message} onChange={(e) => { setMessage(e.target.value) }} />
                        <Button variant='contained' onClick={sendMessage}>Send</Button>
                    </div>
                </div>
                : <></>
            }
        </div>
    )
}
