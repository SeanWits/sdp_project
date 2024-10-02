import React, { useState, useEffect, useContext } from 'react';
import './Checkout.css';
import { UserContext } from '../../utils/userContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import LoadModal from '../../components/LoadModal/LoadModal';
import { Link, useNavigate } from "react-router-dom";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const restaurantID = "rest001";

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
    fetchWalletBalance();
  }, [user, navigate]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/${restaurantID}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const cartData = await response.json();
      setCartItems(cartData.items || []);
      calculateTotal(cartData.items || []);
      setTimeout(() => setLoading(false), 200);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setTimeout(() => setLoading(false), 200);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setWalletBalance(userData.wallet || 0);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const calculateTotal = (items) => {
    const newTotal = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
    setTotal(newTotal);
  };

  const deleteItem = async (productId) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/${restaurantID}/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      const updatedCart = await response.json();
      setCartItems(updatedCart.items || []);
      calculateTotal(updatedCart.items || []);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const confirmPurchase = async () => {
    if (total > walletBalance) {
      alert('Insufficient funds in wallet');
      return;
    }

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurantId: restaurantID,
          items: cartItems,
          totalAmount: total
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }
      const result = await response.json();
      setTimeout(() => {
        setLoading(false);
        alert('Purchase confirmed! Order ID: ' + result.orderId);
        setCartItems([]);
        setTotal(0);
        setWalletBalance(prevBalance => prevBalance - total);
        navigate('/orders');
      }, 2000);
    } catch (error) {
      console.error("Error during checkout:", error);
      setTimeout(() => {
        setLoading(false);
        alert('An error occurred while processing your order: ' + error.message);
      }, 2000);
    }
  };

  return (
    <>
      <Header disableCart={true} disableOrders={false}/>
      <LoadModal loading={loading} />
      <header className="checkoutHeader">
        <Link to="/" className="back-arrow-checkout">&#8592;</Link>
        <h1 className="checkoutHeading">Checkout</h1>
      </header>
      <main className="checkout-container">
      
      <section className="order-summary">
        <h2>Order Summary</h2>
        {cartItems.map((item, index) => (
          <React.Fragment key={item.productId}>
            <article className="meal-item">
              <img src={item.imageSrc} alt={item.name} className="meal-image" />
              <div className="meal-info">
                <span className="meal-name">{item.name} (x{item.quantity})</span>
                <span className="meal-price">R{(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
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
            </article>
            {index < cartItems.length - 1 && <hr className="item-divider" />}
          </React.Fragment>
        ))}
        <p className="total">Total: R{total.toFixed(2)}</p>
      </section>

      <section className="wallet-info">
        <p>Wallet Balance: R{walletBalance.toFixed(2)}</p>
      </section>

      <button className="confirm-purchase" onClick={confirmPurchase} disabled={total > walletBalance}>
        {total > walletBalance ? 'Insufficient Funds' : 'Confirm Purchase'}
      </button>
    </main>
    <Footer/>
    </>
  );
};

export default Checkout;