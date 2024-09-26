import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import "./Meal.css";
import { UserContext } from '../../utils/userContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

function Meal() {
  const location = useLocation();
  const navigate = useNavigate();
  const { restaurantId, itemName } = useParams();
  const [item, setItem] = useState(location.state?.item || null);
  const [restaurantName, setRestaurantName] = useState(location.state?.restaurantName || "Restaurant/Dining Hall");
  const [loading, setLoading] = useState(!item);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchItem = async () => {
      if (!item) {
        try {
          const response = await fetch(`https://your-firebase-function-url.com/restaurant/${restaurantId}/menu-item/${encodeURIComponent(itemName)}`);
          if (!response.ok) {
            throw new Error('Failed to fetch menu item');
          }
          const data = await response.json();
          setItem(data.item);
          setRestaurantName(data.restaurantName);
        } catch (err) {
          console.error("Error fetching item:", err);
          setError("Failed to load item data");
        }
        setLoading(false);
      }
    };

    fetchItem();
  }, [restaurantId, itemName, item]);

  const handleAddToCart = async () => {
    if (!user) {
      console.log("User not logged in");
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('${process.env.REACT_APP_API_URL}/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          restaurantId,
          item
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      console.log("Item added to cart");
      
      // Dispatch custom event to notify of cart update
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Implement user feedback for successful add to cart
    } catch (error) {
      console.error("Error adding item to cart:", error);
      // Implement user feedback for error
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!item) return <div>No item data available</div>;

  return (
    <>
    <Header/>
    <div className="restaurant-list">
      <header className="menuHeader">
        <Link to={`/menu/${restaurantId}`} className="back-arrow">&#8592;</Link>
        {restaurantName}
      </header>
      <h1>{item.name}</h1>
      <div className="separator-line"></div>
      <section id="mainThing">
        <article>
          <div className="MealDivBox" id="longerThings">
            {item.description}
          </div>
        </article>
        <article>
          <div className="MealDivBox">Customise order</div>
          Total: R{item.price.toFixed(2)} <button className="menuButton" onClick={handleAddToCart}>Add to cart</button>
        </article>
        <img src={item.image_url} alt={item.name} className="item-image" />
      </section>
      <div className="separator-line"></div>

      <button className="menuButton" id="menuInfoButton">
        Click For Review
      </button>
    </div>
    <Footer/>
    </>
  );
}

export default Meal;