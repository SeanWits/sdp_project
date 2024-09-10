import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./menu3.css";
import restaurantData from "./restaurant.json"; //Mock API for testing

function Menu3() {
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
      <h1>Meal Name</h1>
      <div className="separator-line"></div>
      <section id="mainThing">
        <article>
          <div className="menu3DivBox" id="longerThings">
            A description
          </div>
          
          </article>
        <article>
          <div className="menu3DivBox">
            Customise order
            </div>
        Total: <button>Add to cart</button>
        </article>
      </section>
      <div className="separator-line"></div>
      
      <section>
        
        <section id="reviews">
        <section id="reviewsReviews">
          <h2>Reviews</h2>
        </section>

        <section id="reviewsRating">
        <article>
        <h2>Rating</h2>
        </article>
        <article>
        <h2>Date posted: </h2>
        </article>
        </section>
        </section>
      </section>
    </div>
  );
}

export default Menu3;