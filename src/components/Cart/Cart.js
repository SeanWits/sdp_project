import React, { useEffect, useState } from 'react';
import './Cart.css';
import { useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc } from '../../firebase';

const Cart = ({ isOpen, onClose, restaurantID, userID }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const fetchCart = async () => {
    const cartRef = doc(db, `users/${userID}/carts/${restaurantID}`);
    const cartSnap = await getDoc(cartRef);
    console.log("read"); // Log read operation
    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      setItems(cartData.items || []);
      calculateTotal(cartData.items || []);
    }
  };

  const calculateTotal = (items) => {
    const newTotal = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
    setTotal(newTotal);
  };

  const updateItemQuantity = async (productId, newQuantity) => {
    const cartRef = doc(db, `users/${userID}/carts/${restaurantID}`);
    const cartSnap = await getDoc(cartRef);
    console.log("read"); // Log read operation
    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      const updatedItems = cartData.items.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      ).filter(item => item.quantity > 0);

      await updateDoc(cartRef, { items: updatedItems });
      console.log("write"); // Log write operation
      setItems(updatedItems);
      calculateTotal(updatedItems);
    }
  };

  const deleteItem = async (productId) => {
    const cartRef = doc(db, `users/${userID}/carts/${restaurantID}`);
    const cartSnap = await getDoc(cartRef);
    console.log("read"); // Log read operation
    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      const updatedItems = cartData.items.filter(item => item.productId !== productId);

      await updateDoc(cartRef, { items: updatedItems });
      console.log("write"); // Log write operation
      setItems(updatedItems);
      calculateTotal(updatedItems);
    }
  };

  const handleCheckout = () => {
    onClose(); // Close the cart modal
    navigate('/checkout'); // Navigate to the checkout page
  };

  if (!isOpen) return null;

  return (
    <aside className="cart-modal-overlay" aria-label="Shopping Cart">
      <section className="cart-modal">
        <header>
          <h2>Cart</h2>
        </header>
        <div className="cart-items-container">
          <ul className="cart-items">
            {items.map((item) => (
              <li key={item.productId} className="cart-item">
                <img src={item.imageSrc} alt={item.name} />
                <article className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-price">R{item.priceAtPurchase.toFixed(2)}</p>
                </article>
                <div className="item-quantity">
                  <button onClick={() => updateItemQuantity(item.productId, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateItemQuantity(item.productId, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`}>+</button>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteItem(item.productId)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="trash-icon">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <footer>
          <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </footer>
      </section>
    </aside>
  );
};

export default Cart;