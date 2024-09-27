import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, doc, getDoc } from '../../../firebase'; // Import necessary Firebase functions
import { styles } from '../styles';

const OrderSummaryPage = () => {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservation = async () => {
      const reservationId = localStorage.getItem('reservationId');
      if (!reservationId) {
        // If no reservationId, redirect to the home page
        navigate('/');
        return;
      }

      try {
        // Fetch the reservation document from Firestore using the reservationId
        const reservationDoc = await getDoc(doc(db, 'Reservation', reservationId));
        if (reservationDoc.exists()) {
          // Set the data to state
          setData(reservationDoc.data());
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
    console.log('handleDone called');
    localStorage.removeItem('reservationId');
    navigate('/history');
  };

  const formatDate = (date) => {
    if (date && date instanceof Date) {
      return date.toLocaleString();
    } else if (date && date.toDate instanceof Function) {
      return date.toDate().toLocaleString();
    }
    return 'Date not available';
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.yellowBox}>
          <h1>Reservation Summary</h1>
        </div>

        <p><strong>Restaurant:</strong> {data.restaurantName || 'Not specified'}</p>
        <p><strong>Date:</strong> {formatDate(data.date)}</p>
        <p><strong>Number of People:</strong> {data.numberOfPeople || 'Not specified'}</p>

        <button onClick={handleDone} style={styles.button}>Done</button>
      </div>
    </div>
  );
};

export default OrderSummaryPage;