import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.jsx';
import { Login } from './pages/Authentication.jsx';
import { Register } from './pages/Authentication.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Videomeet } from './pages/Videomeet.jsx';
import Home from './pages/Home.jsx';
import { History } from './pages/History.jsx';

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