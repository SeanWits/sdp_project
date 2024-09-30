import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { UserContext } from '../../../utils/userContext';
import { styles } from '../styles';
import Header from "../../../components/Header/Header"; // Import the Header
import Footer from "../../../components/Footer/Footer"; // Import the Footer

const ReservationPage = () => {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [people, setPeople] = useState(1);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const restaurant = location.state?.restaurant;
  const { user } = useContext(UserContext);
  const checkPerformed = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').setAttribute('min', today);
    
    if (!checkPerformed.current) {
      checkActiveReservation();
      checkPerformed.current = true;
    }
  }, []); // Empty dependency array

  const checkActiveReservation = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reservations/active`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check active reservations');
      }

      const { hasActiveReservation } = await response.json();
      if (hasActiveReservation) {
        alert("You have an active reservation");
        navigate('/history');
      }
    } catch (error) {
      console.error("Error checking active reservations: ", error);
      alert("Failed to check active reservations. Please try again.");
    }
  };

  const generateTimeSlots = (open, close) => {
    const timeSlots = [];
    const [openHour, openMin] = open.split(':').map(Number);
    const [closeHour, closeMin] = close.split(':').map(Number);

    let currentHour = openHour;
    let currentMin = openMin;

    while (currentHour < closeHour || (currentHour === closeHour && currentMin <= closeMin)) {
      const formattedTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      timeSlots.push(formattedTime);

      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin = 0;
      }
    }

    return timeSlots;
  };

  const timeSlots = restaurant ? generateTimeSlots(restaurant.opening_time, restaurant.closing_time) : [];

  const handleConfirm = async () => {
    if (!date || !timeSlot) {
      alert('Please select a date and time slot.');
      return;
    }

    if (!restaurant) {
      alert('Restaurant information is missing.');
      return;
    }

    const reservationData = {
      restaurantId: id,
      restaurantName: restaurant.name,
      date: `${date}T${timeSlot}`,
      numberOfPeople: people,
    };

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      });

      if (!response.ok) {
        throw new Error('Failed to create reservation');
      }

      const data = await response.json();
      localStorage.setItem('reservationId', data.reservationId);
      navigate('/order-summary');
    } catch (error) {
      console.error("Error adding reservation: ", error);
      alert("Failed to create reservation. Please try again.");
    }
  };

  if (!restaurant) {
    return <div style={styles.pageWrapper}>Loading restaurant information...</div>;
  }

  return (
    <>
      <Header /> {/* Add the Header here */}
      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          <div style={styles.yellowBox}>
            <h1>Reservation for {restaurant.name}</h1>
          </div>

          <label htmlFor="date" style={styles.label}>Select Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            style={styles.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label htmlFor="time-slot" style={styles.label}>Select Time Slot:</label>
          <select
            id="time-slot"
            name="time-slot"
            style={styles.input}
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
          >
            <option value="">Select a time slot</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>

          <label htmlFor="people" style={styles.label}>Number of People:</label>
          <input
            type="number"
            id="people"
            name="people"
            min="1"
            max="10"
            style={styles.input}
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
          />

          <button onClick={handleConfirm} style={styles.button}>Confirm Reservation</button>
        </div>
      </div>
      <Footer /> {/* Add the Footer here */}
    </>
  );
};

export default ReservationPage;
