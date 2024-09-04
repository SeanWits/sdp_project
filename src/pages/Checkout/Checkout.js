import React, { useState, useEffect } from 'react';
import './Checkout.css';
import { db, doc, getDoc, updateDoc } from '../../firebase';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(150.75); // Mocked wallet balance
  const [voucherCode, setVoucherCode] = useState('');

  const restaurantID = "wet34yeuerueu";
  const userID = "GUuNErry035Y9L5q5fqa";

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const cartRef = doc(db, `users/${userID}/carts/${restaurantID}`);
    const cartSnap = await getDoc(cartRef);
    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      setCartItems(cartData.items || []);
      calculateTotal(cartData.items || []);
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
    // Here you would implement the logic to validate and apply the voucher
    console.log('Applying voucher:', voucherCode);
    // For now, we'll just log the voucher code
  };

  const deleteItem = async (productId) => {
    const cartRef = doc(db, `users/${userID}/carts/${restaurantID}`);
    const cartSnap = await getDoc(cartRef);
    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      const updatedItems = cartData.items.filter(item => item.productId !== productId);

      await updateDoc(cartRef, { items: updatedItems });
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    }
  };

  return (
    <main className="checkout-container">
      <h1>Checkout</h1>
      
      <section className="order-summary">
        <h2>Order Summary</h2>
        {cartItems.map((item, index) => (
          <React.Fragment key={item.productId}>
            <article className="meal-item">
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

      <button className="confirm-purchase">Confirm Purchase</button>
    </main>
  );
};

export default Checkout;