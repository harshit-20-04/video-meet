import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { LandingPage } from './components/LandingPage.js';
import { Login } from './components/Authentication.js';
import { Register } from './components/Authentication.js';
import { AuthProvider } from './context/AuthContext.jsx';
import { Videomeet } from './components/Videomeet.jsx';
import Home from './components/Home.js';
import { History } from './components/History.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<LandingPage />}></Route>
          <Route path='/home' element={<Home />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/history' element={<History/>} />
          <Route path='/:url' element={<Videomeet/>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>

  )
}
export default App;