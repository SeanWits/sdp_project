import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, addDoc, serverTimestamp } from '../../../firebase'; // Import necessary Firebase functions
import { styles } from '../styles';

const ReservationPage = () => {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [people, setPeople] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').setAttribute('min', today);
  }, []);

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

  const timeSlots = generateTimeSlots('09:00', '17:00');

  const handleConfirm = async () => {
    if (!date) {
      alert('Please select a date.');
      return;
    }

    const selectedRestaurant = "Restaurant XYZ";
    const reservationData = {
      restaurant: selectedRestaurant,
      date: new Date(`${date}T${timeSlot}`), // Create a Date object from date and time
      userId: "vutshila", // Hardcoded User ID, replace with dynamic value if available
      numberOfPeople: people,
      createdAt: serverTimestamp(),
    };

    try {
      // Store the reservation data in Firestore
      const reservationRef = await addDoc(collection(db, "Reservation"), reservationData);

      // Store the Firestore document ID in localStorage to retrieve it in the next page
      localStorage.setItem('reservationId', reservationRef.id);

      // Navigate to the order summary page
      navigate('/order-summary');
    } catch (error) {
      console.error("Error adding reservation: ", error);
      alert("Failed to create reservation. Please try again.");
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.yellowBox}>
          <h1>Select Date, Time Slot & Number of People</h1>
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
          onChange={(e) => setPeople(e.target.value)}
        />

        <button onClick={handleConfirm} style={styles.button}>Confirm Reservation</button>
      </div>
    </div>
  );
};

export default ReservationPage;
