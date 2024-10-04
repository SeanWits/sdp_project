import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../../../utils/userContext';
import { styles } from '../styles';
import { useNavigate } from "react-router-dom";

const ReservationPage = ({ restaurant, onClose }) => {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [people, setPeople] = useState(1);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const { user } = useContext(UserContext);
  const checkPerformed = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').setAttribute('min', today);

    if (!checkPerformed.current) {
      checkActiveReservation();
      checkPerformed.current = true;
    }
  }, []);

  useEffect(() => {
    if (date && restaurant) {
      const slots = generateTimeSlots(restaurant.opening_time, restaurant.closing_time, date);
      setAvailableTimeSlots(slots);
      setTimeSlot(''); // Reset time slot when date changes
    }
  }, [date, restaurant]);

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
        onClose();
      }
    } catch (error) {
      console.error("Error checking active reservations: ", error);
      alert("Failed to check active reservations. Please try again.");
    }
  };

  const generateTimeSlots = (open, close, selectedDate) => {
    const timeSlots = [];
    const [openHour, openMin] = open.split(':').map(Number);
    const [closeHour, closeMin] = close.split(':').map(Number);

    let currentDate = new Date(selectedDate);
    currentDate.setHours(openHour, openMin, 0, 0);

    const closeDate = new Date(selectedDate);
    closeDate.setHours(closeHour, closeMin, 0, 0);

    const now = new Date();
    const isToday = now.toDateString() === currentDate.toDateString();

    while (currentDate < closeDate) {
      if (!isToday || currentDate > now) {
        const formattedTime = currentDate.toTimeString().slice(0, 5);
        timeSlots.push(formattedTime);
      }

      currentDate.setMinutes(currentDate.getMinutes() + 30);
    }

    return timeSlots;
  };

  const handleConfirm = async () => {
    if (!date || !timeSlot) {
      alert('Please select a date and time slot.');
      return;
    }

    const reservationData = {
      restaurantId: restaurant.id,
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

      alert('Reservation confirmed');
      onClose(); // Close the modal after successful reservation
    } catch (error) {
      console.error("Error adding reservation: ", error);
      alert("Failed to create reservation. Please try again.");
    }
  };

  return (
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
          disabled={!date}
        >
          <option value="">Select a time slot</option>
          {availableTimeSlots.map((time) => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>

        <label htmlFor="people" style={styles.label}>Number of People:</label>
        <input
          type="number"
          id="people"
          name="people"
          min="1"
          max="8"
          style={styles.input}
          value={people}
          onChange={(e) => setPeople(Math.min(8, Math.max(1, Number(e.target.value))))}
        />

        <button onClick={handleConfirm} style={styles.button} disabled={!date || !timeSlot}>
          Confirm Reservation
        </button>

        <button onClick={onClose} style={styles.button}>Close</button>
      </div>
    </div>
  );
};

export default ReservationPage;