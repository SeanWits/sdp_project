import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Restaurant.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LoadModal from "../../components/LoadModal/LoadModal"; // Adjust the import path as needed
import ReservationPage from "../Reservation/ReservationPage/ReservationPage"; // Import the ReservationPage
import Modal from "react-modal"; // Install this library: npm install react-modal

Modal.setAppElement('#root'); // This is required by react-modal for accessibility

function Restaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // State for selected restaurant

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurants`);
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const restaurantsList = await response.json();
        setRestaurants(restaurantsList);
        setTimeout(() => setLoading(false), 500);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurant data");
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchRestaurants();
  }, []);

  const openModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };

  if (error) return <div>Error: {error}</div>;
  if (!restaurants.length && !loading) return <div>No restaurant data available</div>;

  return (
    <>
      <Header />
      <LoadModal loading={loading} />
      <div className="restaurant-list">
        <header className="menuHeader">Restaurant/Dining Hall Name</header>
        {restaurants.map((restaurant) => (
          <article key={restaurant.id} className="restaurant-details">
            <section id="main-section">
              <div id="restaurant-summary">
                <h2>{restaurant.name}</h2>
                <p>Location: {restaurant.location}</p>
                <p>
                  Hours: {restaurant.opening_time} - {restaurant.closing_time}
                </p>
                <p>Rating: {restaurant.rating || 'No Rating'}</p>
              </div>
              <div className="composite-buttons">
                <Link to={`/menu/${restaurant.id}`} state={{ restaurant }}>
                  <button className="menuButton">Menu</button>
                </Link>
                <button className="menuButton" onClick={() => openModal(restaurant)}>Reservation</button>
                <Link to={`/restaurant-info/${restaurant.id}`} state={{ restaurant }}>
                  <button className="menuButton">More Info</button>
                </Link>
              </div>
            </section>
            <section className="restaurant-image">
              {restaurant.restImg && <img src={restaurant.restImg} alt={restaurant.name} />}
            </section>
          </article>
        ))}
      </div>
      
      {/* Modal for Reservation */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Reservation Modal"
        className="modal"
        overlayClassName="modal-overlay"
      >
        {selectedRestaurant && (
          <ReservationPage restaurant={selectedRestaurant} onClose={closeModal} />
        )}
      </Modal>

      <Footer />
    </>
  );
}

export default Restaurant;
