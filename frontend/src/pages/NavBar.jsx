import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

export const NavBar = () => {
  return (
    <Navbar>
      <div className='nav-container'>
        <Navbar.Brand href="#home" className='text-white brand-name'>VideoMeet</Navbar.Brand>
        <Navbar id='basic-navbar-nav' className='navbar-collapse'>
          <Nav className="me-auto">
            <Nav.Link href="/register" className='text-white'>Register</Nav.Link>
            <Nav.Link href="/login" className='text-white'>Login</Nav.Link>
            <Nav.Link href="#link" className='text-white'>Join as Guest</Nav.Link>
          </Nav>
        </Navbar>
      </div>
    </Navbar>
  )
}
