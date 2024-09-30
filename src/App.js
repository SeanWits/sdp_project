
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Checkout from './pages/Checkout/Checkout';
import Orders from './pages/Orders/Orders';
import Register from './pages/Register/Register'
import Login from './pages/Login/Login';
import Restaurant from "./pages/Restaurant/Restaurant";
import Menu from "./pages/Menu/Menu";
import Meal from "./pages/Meal/Meal";
import Admin from './pages/Admin/Admin';
import ReservationPage from './pages/Reservation/ReservationPage/ReservationPage';
import OrderSummaryPage from './pages/Reservation/OrderSummaryPage/OrderSummaryPage';
import HistoryPage from './pages/Reservation/HistoryPage/HistoryPage';
import Dashboard from './pages/Dashboard/Dashboard';
import { UserProvider } from './utils/userContext';
import RestaurantInfo from './pages/RestaurantInfo/RestaurantInfo';
import Sean from './pages/Sean';

function App({ RouterComponent = Router }) {
  return (
    <UserProvider>
      <RouterComponent>
        <div className="App">
          <Routes>
            <Route path="/" element={<Restaurant />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu/:restaurantId" element={<Menu />} />
            <Route path="/menu/:restaurantId/:itemName" element={<Meal />} />
            <Route path="/restaurant-info/:id" element={<RestaurantInfo />} />
            <Route path="/reservation/:id" element={<ReservationPage />} />
            <Route path="/order-summary" element={<OrderSummaryPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/sean" element={<Sean />} />
          </Routes>
        </div>
      </RouterComponent>
    </UserProvider>
  );
}

export default App;