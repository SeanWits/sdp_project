import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import "./RestaurantInfo.css";
import LoadModal from '../../components/LoadModal/LoadModal';
import Popup from "../Reviews/Popup/Popup";
import {Reviews} from "../Reviews/Reviews";

function RestaurantInfo() {
  const { id } = useParams();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState(location.state?.restaurant || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //pop up
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const togglePopup = () => {
    setIsPopupOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurant) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurant/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch restaurant data');
          }
          const restaurantData = await response.json();
          setRestaurant(restaurantData);
        } catch (err) {
          console.error("Error fetching restaurant:", err);
          setError("Failed to load restaurant data");
        }
      }
      setTimeout(() => setLoading(false), 200);
    };

    fetchRestaurant();
  }, [id, restaurant]);


  if (error) return <div>Error: {error}</div>;
  if (!restaurant && !loading) return <div>No restaurant data available</div>;

  return (
    <div className="restaurant-info">
      <LoadModal loading={loading} /> 
      <header className="menuHeader">
        <Link to="/" className="back-arrow">&#8592;</Link>
        {restaurant?.name}
      </header>

      {!loading && restaurant && ( // Only render the content when not loading and restaurant data is available
        <>
          <section className="resDeets">
            <section id="reviews">
              <section id="reviewsReviews">
                <h2>Restaurant Details</h2>
              </section>

              <section id="reviewsRating">
                <article id="nameRes">
                  <ul>
                    <li>Name: {restaurant.name}</li>
                    <li>Location: {restaurant.location}</li>
                    <li>Operating Hours: {restaurant.opening_time} - {restaurant.closing_time}</li>
                    <li>Contact details: {restaurant.contact_details || 'N/A'}</li>
                    <li>Telephone: {restaurant.telephone || 'N/A'}</li>
                    <li>Email: {restaurant.email || 'N/A'}</li>
                    <li>Rating: {restaurant.rating || 'N/A'}</li>
                  </ul>
                </article>
                <article>
                  {restaurant.restImg && (
                    <img src={restaurant.restImg} alt={restaurant.name} />
                  )}
                </article>
              </section>
            </section>
          </section>

          <button onClick={togglePopup} className="menuButton" id="RestaurantInfoButton">
            Click For Review
          </button>
          <Popup isOpen={isPopupOpen} onClose={togglePopup}>
            <Reviews restaurantID={restaurant.id} mealID={null}/>
          </Popup>
        </>
      )}
    </div>
  );
}

export default RestaurantInfo;