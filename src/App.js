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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Orders />} />
          {/* Add more routes here as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
