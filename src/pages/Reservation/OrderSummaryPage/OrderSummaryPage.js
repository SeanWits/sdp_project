import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../utils/userContext';
import { styles } from '../styles';

const OrderSummaryPage = () => {
  const [data, setData] = useState({});
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchReservation = async () => {
      const reservationId = localStorage.getItem('reservationId');
      if (!reservationId) {
        navigate('/');
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/reservations/${reservationId}`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reservation');
        }

        const reservationData = await response.json();
        setData(reservationData);
      } catch (error) {
        console.error('Error fetching reservation: ', error);
        navigate('/');
      }
    };

    fetchReservation();
  }, [user, navigate]);

  const handleDone = () => {
    localStorage.removeItem('reservationId');
    navigate('/history');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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