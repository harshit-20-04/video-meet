import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Authentication';
import { Register } from './pages/Authentication';
import { AuthProvider } from './context/AuthContext.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<LandingPage />}></Route>
          <Route path='/home' element={<Home />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/register' element={<Register />}></Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>

  )
}
export default App;