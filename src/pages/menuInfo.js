import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./menuInfo.css";
import restaurantData from "./restaurant.json"; //Mock API for testing

function MenuInfo() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRestaurants = () => {
      try {
        setRestaurants(restaurantData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load restaurant data");
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!restaurants.length) return <div>No restaurant data available</div>;

  return (
    <div className="restaurant-info">
      <header className="menuHeader">
      <Link to="/" className="back-arrow">&#8592;</Link>
        Restaurant/Dining Hall Name</header>

      <section className="resDeets">
        <section id="reviews">
          <section id="reviewsReviews">
            <h2>Restaurant Details</h2>
          </section>

          <section id="reviewsRating">
            <article id="nameRes">
              <ul>
                <li>Name: </li>
                <li>Location: </li>
                <li>Operating Hours: </li>
                <li>Contact details: </li>
                <li>Telephone: </li>
                <li>Email: </li>
                <li>rating: </li>
              </ul>
            </article>
            <article>{/*Picture here */}</article>
          </section>
        </section>
      </section>

      <button className="menuButton" id="menuInfoButton">
        Click For Review
      </button>
    </div>
  );
}

export default MenuInfo;
