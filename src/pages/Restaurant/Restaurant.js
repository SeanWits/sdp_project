import React, { useState, useEffect, useContext } from 'react';
import './Restaurant.css';
import Cart from '../../components/Cart/Cart';
import { db, doc, getDoc, setDoc, updateDoc, arrayUnion } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import UserStatus from '../../utils/userStatus';
import { logoutUser } from '../../utils/authFunctions';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../utils/userContext';

const Restaurant = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const restaurantID = "rest001";
  const userID = user ? user.uid : null;;

  const product = {
    productId: "05032",
    name: "Grilled Chicken Sandwich",
    prepTime: 10,
    price: 29.99,
    imageSrc: "https://www.allrecipes.com/thmb/ICeU6n3kGzoTxOV4ONB0q_TpgYk=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/125434-GrilledCheeseoftheGods-mfs-3x2-067-267097af4d0b446ab646bba044445147.jpg"
  };

  useEffect(() => {
    if (userID) {
      fetchCart();
    }
  }, [userID]);

  const fetchCart = async () => {
    const cartRef = doc(db, `users/${userID}/carts/${restaurantID}`);
    const cartSnap = await getDoc(cartRef);
    console.log("read"); // Log read operation
    if (cartSnap.exists()) {
      const items = cartSnap.data().items || [];
      setCartItems(items);
      updateCartItemCount(items);
    }
  };

  const updateCartItemCount = (items) => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setCartItemCount(count);
  };

  const handleAddToCart = async () => {
    const cartRef = doc(db, `users/${userID}/carts/${restaurantID}`);
    const cartSnap = await getDoc(cartRef);
    console.log("read"); // Log read operation

    const newItem = {
      productId: product.productId,
      quantity: quantity,
      priceAtPurchase: product.price,
      imageSrc: product.imageSrc,
      name: product.name,
      prepTime: product.prepTime
    };

    if (!cartSnap.exists()) {
      // Create new cart document if it doesn't exist
      await setDoc(cartRef, {
        restaurantID: restaurantID,
        items: [newItem]
      });
      console.log("write"); // Log write operation
    } else {
      // Update existing cart document
      const existingItems = cartSnap.data().items || [];
      const existingItemIndex = existingItems.findIndex(item => item.productId === newItem.productId);

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        existingItems[existingItemIndex].quantity += quantity;
        await updateDoc(cartRef, { items: existingItems });
        console.log("write"); // Log write operation
      } else {
        // Add new item if it doesn't exist
        await updateDoc(cartRef, {
          items: arrayUnion(newItem)
        });
        console.log("write"); // Log write operation
      }
    }

    fetchCart(); // Refresh cart items
    setQuantity(1);
  };

  const handleQuantityChange = (change) => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity + change));
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCartItems([]);
      setCartItemCount(0);
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="restaurant-container">
    <UserStatus />
      <div className="cart-icon-container" onClick={toggleCart}>
        <FontAwesomeIcon icon={faCartShopping} className="cart-icon" />
        {cartItemCount > 0 && <span className="cart-counter">{cartItemCount}</span>}
      </div>
      <Cart isOpen={isCartOpen} onClose={toggleCart} items={cartItems} restaurantID={restaurantID} userID={userID} />
      <h1>Welcome to Our Restaurant</h1>
      <div className="product-card">
        <img src={product.imageSrc} alt={product.name} className="product-image" />
        <h2 className="product-name">{product.name}</h2>
        <p className="product-price">R{product.price.toFixed(2)}</p>
        <div className="quantity-control">
          <button onClick={() => handleQuantityChange(-1)} className="quantity-btn">-</button>
          <span className="quantity">{quantity}</span>
          <button onClick={() => handleQuantityChange(1)} className="quantity-btn">+</button>
        </div>
        <button onClick={handleAddToCart} className="add-to-cart-btn">Add to Cart</button>
      </div>
      {user && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
    </div>
  );
};

export default Restaurant;