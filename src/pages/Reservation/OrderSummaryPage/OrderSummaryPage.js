import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../utils/userContext';
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import { styles } from '../styles';
import LoadModal from '../../../components/LoadModal/LoadModal'; // Add this import

const OrderSummaryPage = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
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

      setLoading(true);
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
        setTimeout(() => setLoading(false), 200);
      } catch (error) {
        console.error('Error fetching reservation: ', error);
        setTimeout(() => {
          setLoading(false);
          navigate('/');
        }, 200); 
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
    <>
      <Header />
    
    <div style={styles.pageWrapper}>
      <LoadModal loading={loading} />
      <div style={styles.container}>
        <div style={styles.yellowBox}>
          <h1>Reservation Summary</h1>
        </div>

        {!loading && (
          <>
            <p><strong>Restaurant:</strong> {data.restaurantName || 'Not specified'}</p>
            <p><strong>Date:</strong> {formatDate(data.date)}</p>
            <p><strong>Number of People:</strong> {data.numberOfPeople || 'Not specified'}</p>
          </>
        )}

        <button onClick={handleDone} style={styles.button}>Done</button>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default OrderSummaryPage;