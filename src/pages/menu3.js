import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "./menu3.css";
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Menu3() {
  const location = useLocation();
  const { restaurantId, itemName } = useParams();
  const [item, setItem] = useState(location.state?.item || null);
  const [restaurantName, setRestaurantName] = useState(location.state?.restaurantName || "Restaurant/Dining Hall");
  const [loading, setLoading] = useState(!item);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!item) {
        try {
          const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
          if (restaurantDoc.exists()) {
            const restaurantData = restaurantDoc.data();
            setRestaurantName(restaurantData.name);
            const foundItem = restaurantData.categories
              .flatMap(category => category.menu_items)
              .find(menuItem => menuItem.name === decodeURIComponent(itemName));
            
            if (foundItem) {
              setItem(foundItem);
            } else {
              setError("Item not found");
            }
          } else {
            setError("Restaurant not found");
          }
        } catch (err) {
          console.error("Error fetching item:", err);
          setError("Failed to load item data");
        }
        setLoading(false);
      }
    };

    fetchItem();
  }, [restaurantId, itemName, item]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!item) return <div>No item data available</div>;

  return (
    <div className="restaurant-list">
      <header className="menuHeader">
        <Link to={`/menu/${restaurantId}`} className="back-arrow">&#8592;</Link>
        {restaurantName}
      </header>
      <h1>{item.name}</h1>
      <div className="separator-line"></div>
      <section id="mainThing">
        <article>
          <div className="menu3DivBox" id="longerThings">
            {item.description}
          </div>
        </article>
        <article>
          <div className="menu3DivBox">Customise order</div>
          Total: R{item.price.toFixed(2)} <button className="menuButton">Add to cart</button>
        </article>
      </section>
      <div className="separator-line"></div>

      <button className="menuButton" id="menuInfoButton">
        Click For Review
      </button>
    </div>
  );
}

export default Menu3;