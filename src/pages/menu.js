import "./menu.css";

import restaurantData from "./restaurant.json"; //Mock API for testing
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

//import { render } from "@testing-library/react";

//Function that is called in App.js to render the menu
function Menu() {
//Setting the states for the menu API (mocked for now)
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Used for asynchronous calls of the API
  useEffect(() => {
    //Placing the API in this function
    const loadRestaurant = () => {
      try {
        setRestaurant(restaurantData);
        setLoading(false);
        //Catching errors if the API does not load
      } catch (err) {
        setError("Failed to load restaurant data");
        setLoading(false);
      }
    };

    loadRestaurant();
  }, []);

  //If statements to when the API didn't know, something to just display on screen saying what the matter is.
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!restaurant) return <div>No restaurant data available</div>;

  return (
    //This is for displaying the menu info in a list, one after the other
    //Calling the API contents recursively
    <div className="restaurant-list">
    
      {restaurant.map((restaurant) => (
        <a href="#">
        <article key={restaurant.id} className="restaurant-details">
          <h2>{restaurant.name}</h2>
          <p>Location: {restaurant.location}</p>
          <p>
            Hours: {restaurant.opening_time} - {restaurant.closing_time}
          </p>

        </article>
        </a>
      ))}
    </div>
  );
}

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<Menu />);
export default Menu;

/*
<h3>Menu</h3>
          {restaurant.categories.map((category) => (
            <div key={category.name} className="menu-category">
              <h4>{category.name}</h4>
              <ul>
                {category.menu_items.map((item) => (
                  <li key={item.name}>
                    <strong>{item.name}</strong> - R{item.price}
                    <br />
                    {item.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
*/
