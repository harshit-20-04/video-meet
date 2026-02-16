import React, { useState , useContext} from "react"
import { WithAuth } from "../utils/WithAuth"
import { useNavigate } from "react-router-dom"
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import PersonIcon from '@mui/icons-material/Person';
import RestoreIcon from '@mui/icons-material/Restore';
import Button from "@mui/material/Button";
import { AuthContext } from "../context/AuthContext";

const Home = ({ props }) => {
  const [meetingCode, setMeetingCode] = useState();
  const navigate = useNavigate();

  const {addUserHistory} = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    await addUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  }

  let handleHistory = () => {
    navigate("/history")
  }

  let handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div className="home-container">
      <div className="nav-login">
        <Navbar>
          <div className='nav-container'>
            <Navbar.Brand href="/home" className='text-white brand-name'>VideoMeet</Navbar.Brand>
            <Navbar id='basic-navbar-nav' className='navbar-collapse'>
              <Nav className="me-auto">
                <Nav.Link className='text-white'><PersonIcon /></Nav.Link>
                <Nav.Link className='text-white' onClick={handleHistory}><RestoreIcon /></Nav.Link>
                <Nav.Link className='text-white' onClick={handleLogout}>Logout</Nav.Link>
              </Nav>
            </Navbar>
          </div>
        </Navbar>
        <div className="logoMain">
          <div className="meet-container">
            <h4>Quality Video Call for Everyone</h4>
            <div className="meet-code">
              <h2 className="text-white">{meetingCode}</h2>
              <input placeholder="Enter Meeting code" value={meetingCode} onChange={(e) => setMeetingCode(e.target.value)} />
              <Button variant="outlined" onClick={handleJoinVideoCall}>Enter</Button>
            </div>
          </div>
          <p><img src="../public/logo.svg"/></p>
        </div>
      </div>
    </div>
  )
}

export default WithAuth(Home);