import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import { Link } from 'react-router';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import Snackbar from '@mui/material/Snackbar';
import { BackButton } from './BackButton.jsx';


export const Register = () => {

  const [userName, setUserName] = useState("");
  const [password,setPassWord] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [err, setError] = useState("");
  const [open, setOpen] = useState(false);

  const {handleRegister} = useContext(AuthContext);
  const handleAuth = async(e)=>{
    try{
      e.preventDefault();
      let res = await handleRegister(name, userName,email, password);
      setMessage(res);
      setOpen(true);
      setError("");
    }catch(e){
      let message = e.response.data.message||"Something wrong";
      setError(message);
    }
  }
  const handleClose = (event, reason) => {
  if (reason === 'clickaway') return;
  setOpen(false);
};


  return (
    <div className='register-container'>
      <div className='image-container'>
        <img src='./bannerforlogin.png' alt='register' className='image'/>
        <div className='link'>
          <span>Already have a Account?</span> 
          <Link to='/login'>Login</Link>
        </div>
      </div>
      <BackButton />
      <div className='register-form'>
        <div className='register-user-icon'>
          <h3>Register</h3>
          <AccountCircleIcon style={{ fontSize: "xxx-large" }} className='user-icon' />
        </div>
        <Form onSubmit={handleAuth}>
          <Form.Text className='text-white'>
            We'll never share your data with anyone else.
          </Form.Text>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Name</Form.Label>
            <Form.Control type="String" placeholder="Enter Name"  value={name} onChange={(e)=>setName(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>User Name</Form.Label>
            <Form.Control type="String" placeholder="Enter username" value={userName} onChange={(e)=>setUserName(e.target.value)}/>
          </Form.Group>


          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="String" placeholder="Enter Email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" value={password} onChange={(e)=>setPassWord(e.target.value)}/>
          </Form.Group>

          <Form.Group className='mb-3' controlId='fromErrorMesage'>
            {err}
          </Form.Group>

          <Button variant='primary' type="submit" style={{backgroundColor:"orange"}}>
            Submit
          </Button>
        </Form>
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
}

export const Login = () => {

  const [userName, setUserName] = useState("");
  const [password,setPassWord] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [err, setError] = useState("");

  const {handleLogin} = useContext(AuthContext);
  const handleAuth = async(e)=>{
    try{
      e.preventDefault();
      let res = await handleLogin(userName, password);
      setMessage(res);
      setOpen(true);
      setError("");
    }catch(e){
      console.log(e);
      let message = e.response.data.message||"Something wrong";
      setError(message);
    }
  }

  const handleClose = (event, reason) => {
  if (reason === 'clickaway') return;
  setOpen(false);
};


  return (
    <div className='login-container'>
      <BackButton />
      <div className='login-form'>
        <div className='login-lock-icon'>
          <h3>Login</h3>
          <LockIcon style={{ fontSize: "xxx-large" }} className='lock-icon' />
        </div>
        <Form onSubmit={handleAuth}>
          <Form.Text className='text-white'>
            We'll never share your data with anyone else.
          </Form.Text>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>User Name</Form.Label>
            <Form.Control type="String" placeholder="Enter username" value={userName} onChange={(e)=>setUserName(e.target.value)}/>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" value={password} onChange={(e)=>setPassWord(e.target.value)}/>
          </Form.Group>

          <Form.Group className='mb-3' controlId='fromErrorMesage'>
            {err}
          </Form.Group>

          <Button variant="primary" type="submit" style={{backgroundColor:"orange"}}>
            Submit
          </Button>
        </Form>
      </div>
      <div className='image-container'>
        <img src='./bannerforlogin.png' alt='register' className='image'/>
        <div className='link'>
          <span>Don't Have a Account? </span>
          <Link to='/register'>Register</Link>
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
}

