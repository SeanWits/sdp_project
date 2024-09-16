import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, doc, getDoc } from '../../firebase'; // Import necessary Firebase functions
import { styles } from './styles';

const OrderSummaryPage = () => {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservation = async () => {
      const reservationId = localStorage.getItem('reservationId');
      if (!reservationId) {
        // If no reservationId, redirect to the reservation page
        navigate('/');
        return;
      }

      try {
        // Fetch the reservation document from Firestore using the reservationId
        const reservationDoc = await getDoc(doc(db, 'Reservation', reservationId));
        if (reservationDoc.exists()) {
          // Set the data to state, and ensure "selectedFood" defaults to "None" if not provided
          const reservationData = reservationDoc.data();
          setData({
            ...reservationData,
            selectedFood: reservationData.selectedFood || 'None' // Default to 'None' if not provided
          });
        } else {
          console.error('No such document!');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching reservation: ', error);
        navigate('/');
      }
    };

    fetchReservation();
  }, [navigate]);

  const handleDone = () => {
    alert('Reservation confirmed!');
    // Clear the reservation ID from localStorage
    localStorage.removeItem('reservationId');
    // Navigate back to the reservation page
    navigate('/');
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.yellowBox}>
          <h1>Order Summary</h1>
        </div>

        <p><strong>Restaurant:</strong> {data.restaurant}</p>
        <p><strong>Date:</strong> {data.date?.toDate().toLocaleString()}</p>
        <p><strong>Number of People:</strong> {data.numberOfPeople}</p>
        <p><strong>Food Selected:</strong> {data.selectedFood}</p>

        <button onClick={handleDone} style={styles.button}>Done</button>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
