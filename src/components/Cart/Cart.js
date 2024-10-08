import React, { useEffect, useState, useContext, useRef } from 'react';
import './Cart.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../utils/userContext';
import LoadModal from '../../components/LoadModal/LoadModal';

const Cart = ({ isOpen, onClose, restaurantId }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const cartRef = useRef(null);

  useEffect(() => {
    if (isOpen && user && restaurantId) {
      fetchCart();
    }
  }, [isOpen, user, restaurantId]);

  useEffect(() => {
    calculateTotal(items);
  }, [items]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        onClose();
      }
    };
  
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);


  const fetchCart = async () => {
    if (!user || !restaurantId) return;

    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const cartData = await response.json();
      setItems(cartData.items || []);
      setTimeout(() => setLoading(false), 100);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setTimeout(() => setLoading(false), 100);
    }
  };

  const calculateTotal = (items) => {
    const newTotal = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
    setTotal(newTotal);
  };

  const updateItemQuantity = async (productId, newQuantity) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/${restaurantId}/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity: newQuantity })
      });
      if (!response.ok) {
        throw new Error('Failed to update cart');
      }
      await fetchCart();  // Fetch the updated cart
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const deleteItem = async (productId) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/${restaurantId}/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete item from cart');
      }
      await fetchCart();  // Fetch the updated cart
    } catch (error) {
      console.error("Error deleting item from cart:", error);
    }
  };

  const handleCheckout = () => {
    onClose(); // Close the cart modal
    navigate('/checkout', { state: { restaurantId } }); // Pass restaurantId to checkout page
  };

  if (!isOpen || !restaurantId) return null;

  return (
    <aside className="cart-modal-overlay" aria-label="Shopping Cart">
      <LoadModal loading={loading} />
      <section className="cart-modal" ref={cartRef}>
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
                <div className="item-quantity-cart">
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
          <p>Total: R{total.toFixed(2)}</p>
          <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
          <button className="close-cart-btn" onClick={onClose}>Close</button>
        </footer>
      </section>
    </aside>
  );
};

export default Cart;