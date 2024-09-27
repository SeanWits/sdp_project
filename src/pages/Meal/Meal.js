import React, {useState, useEffect, useContext} from "react";
import {Link, useLocation, useParams, useNavigate} from "react-router-dom";
import "./Meal.css";
import {collection, db} from '../../firebase';
import {doc, getDoc, setDoc, updateDoc, arrayUnion, getDocs, query, where} from 'firebase/firestore';
import {UserContext} from '../../utils/userContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Popup from "../Reviews/Popup/Popup";
import {Reviews} from "../Reviews/Reviews";
import {calculateAverageRating} from "../../utils/averageRating";

function Meal() {
    const location = useLocation();
    const navigate = useNavigate();
    const {restaurantId, itemName} = useParams();
    const [item, setItem] = useState(location.state?.item || null);
    const [restaurantName, setRestaurantName] = useState(location.state?.restaurantName || "Restaurant/Dining Hall");
    const [loading, setLoading] = useState(!item);
    const [error, setError] = useState(null);
    const {user} = useContext(UserContext);
    const [rating, setRating] = useState(0);

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
    //pop up
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const togglePopup = () => {
        setIsPopupOpen((prev) => !prev);
    };

    fetchItem();
  }, [restaurantId, itemName, item]);

  const handleAddToCart = async () => {
    if (!user) {
      console.log("User not logged in");
      navigate('/login', { state: { from: location } });
      return;
    }

    const userID = user.uid;
    const cartRef = doc(db, `users/${userID}/carts/${restaurantId}`);
    const cartSnap = await getDoc(cartRef);

    const newItem = {
      productId: item.productID,
      quantity: 1,
      priceAtPurchase: item.price,
      imageSrc: item.image_url || "",
      name: item.name,
      prepTime: item.prepTime || 10
    };

    try {
      if (!cartSnap.exists()) {
        await setDoc(cartRef, {
          restaurantID: restaurantId,
          items: [newItem]
        });
      } else {
        const existingItems = cartSnap.data().items || [];
        const existingItemIndex = existingItems.findIndex(i => i.productId === newItem.productId);

        if (existingItemIndex > -1) {
          existingItems[existingItemIndex].quantity += 1;
          await updateDoc(cartRef, { items: existingItems });
        } else {
          await updateDoc(cartRef, {
            items: arrayUnion(newItem)
          });
        }
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
                <Popup isOpen={isPopupOpen} onClose={togglePopup}>
                    <Reviews restaurantID={restaurantId} mealID={item.productID}/>
                </Popup>
}

export default Meal;