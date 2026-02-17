import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';

export const NavBar = () => {
  return (
    <Navbar>
      <div className='nav-container'>
        <Link to='/' className='text-white brand-name'>VideoMeet</Link>
        <Navbar id='basic-navbar-nav' className='navbar-collapse'>
          <Nav className="me-auto">
            <Link to={'/register'} className='text-white nav-link'>Register</Link>
            <Link to={'/login'} className='text-white nav-link'>Login</Link>
          </Nav>
        </Navbar>
      </div>
    </Navbar>
  )
}
