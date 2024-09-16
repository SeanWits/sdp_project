import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ReservationPage from './pages/Reservation/ReservationPage';
import OrderSummaryPage from './pages/Reservation/OrderSummaryPage';
import HistoryPage from './pages/Reservation/HistoryPage';
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