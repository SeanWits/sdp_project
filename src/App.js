import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import firebase from "firebase/compat/app";
// Required for side-effects
import "firebase/firestore";
import Restaurant from './pages/Restaurant/Restaurant';
import Test from './Test';
import Checkout from './pages/Checkout/Checkout';
import Orders from './pages/Orders/Orders';
import Register from './pages/Register/Register'
import Login from './pages/Login/Login';
import { UserProvider } from './utils/userContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Restaurant />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
