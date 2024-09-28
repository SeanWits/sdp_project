import React, { useState, useEffect, useContext } from 'react';
import './Checkout.css';
import { UserContext } from '../../utils/userContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { Link, useNavigate } from "react-router-dom";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(0);
  const [voucherCode, setVoucherCode] = useState('');
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
    } catch (error) {
      console.error("Error fetching cart:", error);
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

  const selectPayment = (method) => {
    setSelectedPayment(method);
  };

  const handleVoucherChange = (e) => {
    setVoucherCode(e.target.value);
  };

  const applyVoucher = () => {
    // Implement voucher logic here
    console.log('Applying voucher:', voucherCode);
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
    if (selectedPayment === 'wallet' && total > walletBalance) {
      alert('Insufficient funds in wallet');
      return;
    }

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
          totalAmount: total,
          paymentMethod: selectedPayment,
          voucherCode: selectedPayment === 'voucher' ? voucherCode : null
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }
      const result = await response.json();
      alert('Purchase confirmed! Order ID: ' + result.orderId);
      // Clear local cart state
      setCartItems([]);
      setTotal(0);
      // Update wallet balance if paid from wallet
      if (selectedPayment === 'wallet') {
        setWalletBalance(prevBalance => prevBalance - total);
      }
      // Redirect to a confirmation page or back to the menu
      navigate('/orders');
    } catch (error) {
      console.error("Error during checkout:", error);
      alert('An error occurred while processing your order: ' + error.message);
    }
  };

  
  return (
    <>
      <Header disableCart={true} disableOrders={false}/>
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

      <section className="payment-method">
        <h2>Payment Method</h2>
        <div className="payment-options">
          <button 
            className={`payment-option ${selectedPayment === 'wallet' ? 'selected' : ''}`}
            onClick={() => selectPayment('wallet')}
          >
            Pay from Wallet
          </button>
          <button 
            className={`payment-option ${selectedPayment === 'voucher' ? 'selected' : ''}`}
            onClick={() => selectPayment('voucher')}
          >
            Pay with Voucher
          </button>
        </div>
      </section>

      {selectedPayment === 'wallet' && (
        <section id="walletDetails" className="payment-details">
          <p>Current Wallet Balance: R{walletBalance.toFixed(2)}</p>
        </section>
      )}

      {selectedPayment === 'voucher' && (
        <section id="voucherDetails" className="payment-details">
          <div>
            <label htmlFor="voucherCode">Voucher Code:</label>
            <input 
              type="text" 
              id="voucherCode" 
              value={voucherCode} 
              onChange={handleVoucherChange}
            />
          </div>
          <button className="apply-voucher" onClick={applyVoucher}>Apply Voucher</button>
        </section>
      )}

      <button className="confirm-purchase" onClick={confirmPurchase}>Confirm Purchase</button>
    </main>
    <Footer/>
    </>
  );
};

export default Checkout;