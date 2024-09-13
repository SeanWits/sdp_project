import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./menu.css";
import restaurantData from "./restaurant.json"; //Mock API for testing

function Menu() {
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
    <div className="restaurant-list">
      <header className="menuHeader">Restaurant/Dining Hall Name</header>
      {restaurants.map((restaurant) => (
        <article key={restaurant.id} className="restaurant-details">
          <section id="main-section">
            <div>
              <h2>{restaurant.name}</h2>
              <p>Location: {restaurant.location}</p>
              <p>
                Hours: {restaurant.opening_time} - {restaurant.closing_time}
              </p>
              <p>Rating:</p>
            </div>
            <div>
              <ul>
                <li>
                  <Link to={`/menu/${restaurant.id}`}>
                    <button className="menuButton">Menu</button>
                  </Link>
                </li>
                <li>
                  <Link to={`/restaurant-info/${restaurant.id}`}>
                <button className="menuButton">More Info</button>
              </Link>
              </li>
              </ul>
            </div>
          </section>
        </article>
      ))}
    </div>
  );
}

export default Menu;