/*import React from 'react';
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
import Menu from "./pages/menu";
import Menu2 from "./pages/menu2";
import Menu3 from "./pages/menu3";
import MenuInfo from "./pages/menuInfo";
import Dashboard from './pages/Dashboard/Dashboard';

import { UserProvider } from './utils/userContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu/:restaurantId" element={<Menu2 />} />
            <Route path="/menu/:restaurantId/:itemName" element={<Menu3 />} />
            <Route path="/restaurant-info/:id" element={<MenuInfo />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}
export default App;*/





import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ReservationPage from './pages/Reservation/ReservationPage/ReservationPage';
import OrderSummaryPage from './pages/Reservation/OrderSummaryPage/OrderSummaryPage';
import HistoryPage from './pages/Reservation/HistoryPage/HistoryPage';
import { auth } from './firebase';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ReservationPage />} />
          <Route path="/order-summary" element={<OrderSummaryPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

