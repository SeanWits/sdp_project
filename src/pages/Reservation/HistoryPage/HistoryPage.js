import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../utils/userContext';
import { styles } from '../styles';

const HistoryPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReservations();
  }, [user, navigate]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reservations`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const reservationsData = await response.json();
      setReservations(reservationsData);
    } catch (error) {
      console.error("Error fetching reservations: ", error);
      alert("Failed to fetch reservations. Please try again.");
    }
    setLoading(false);
  };

  const handleCancel = async (reservationId, reservationDate) => {
    const now = new Date();
    const reservationTime = new Date(reservationDate);
    const timeDifference = reservationTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 3600);

    if (hoursDifference > 1) {
      try {
        const idToken = await user.getIdToken();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/reservations/${reservationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to cancel reservation');
        }

        alert("Reservation cancelled successfully.");
        fetchReservations(); // Refresh the list
      } catch (error) {
        console.error("Error cancelling reservation: ", error);
        alert("Failed to cancel reservation. Please try again.");
      }
    } else {
      alert("Reservations can only be cancelled more than 1 hour before the scheduled time.");
    }
  };

  const getReservationStatus = (reservationDate) => {
    const now = new Date();
    const reservationTime = new Date(reservationDate);
    if (now > reservationTime) {
      return "Attended";
    } else {
      const timeDifference = reservationTime.getTime() - now.getTime();
      const hoursDifference = timeDifference / (1000 * 3600);
      return hoursDifference > 1 ? "Upcoming" : "Imminent";
    }
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
          <h1>Reservation History</h1>
        </div>
        {loading ? (
          <p>Loading reservations...</p>
        ) : (
          <div>
            {reservations.map((reservation) => (
              <div key={reservation.id} style={styles.reservationItem}>
                <p><strong>Restaurant:</strong> {reservation.restaurantName}</p>
                <p><strong>Date:</strong> {formatDate(reservation.date)}</p>
                <p><strong>Number of People:</strong> {reservation.numberOfPeople}</p>
                <p><strong>Status:</strong> {getReservationStatus(reservation.date)}</p>
                {getReservationStatus(reservation.date) === "Upcoming" && (
                  <button 
                    onClick={() => handleCancel(reservation.id, reservation.date)}
                    style={styles.cancelButton}
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <button onClick={() => navigate('/')} style={styles.button}>Back to Menu</button>
      </div>
    </div>
  );
};

export default HistoryPage;