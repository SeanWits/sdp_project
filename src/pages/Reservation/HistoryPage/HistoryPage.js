import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, query, where, getDocs, deleteDoc, doc } from '../../../firebase'; // Firebase imports
import { styles } from '../styles'; // Importing updated styles

const HistoryPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const userId = "vutshila"; // Replace with actual user ID
      const q = query(collection(db, "Reservation"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const reservationsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReservations(reservationsData);
    } catch (error) {
      console.error("Error fetching reservations: ", error);
      alert("Failed to fetch reservations. Please try again.");
    }
    setLoading(false);
  };

  const handleCancel = async (reservationId, reservationDate) => {
    const now = new Date();
    const reservationTime = reservationDate.toDate();
    const timeDifference = reservationTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 3600);

    if (hoursDifference > 1) {
      try {
        await deleteDoc(doc(db, "Reservation", reservationId));
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
    const reservationTime = reservationDate.toDate();
    if (now > reservationTime) {
      return "Attended";
    } else {
      const timeDifference = reservationTime.getTime() - now.getTime();
      const hoursDifference = timeDifference / (1000 * 3600);
      return hoursDifference > 1 ? "Upcoming" : "Imminent";
    }
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
                <p><strong>Date:</strong> {reservation.date.toDate().toLocaleString()}</p>
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