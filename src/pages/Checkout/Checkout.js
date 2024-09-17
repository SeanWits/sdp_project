import React, { useState, useEffect, useContext } from 'react';
import './Checkout.css';
import { db, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from '../../firebase';
import { UserContext } from '../../utils/userContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import {Link} from "react-router-dom";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(0);
  const [voucherCode, setVoucherCode] = useState('');

  const { user } = useContext(UserContext);
  const restaurantID = "rest001";

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWalletBalance();
    }
  }, [user]);

  const fetchCart = async () => {
    const cartRef = doc(db, `users/${user.uid}/carts/${restaurantID}`);
    const cartSnap = await getDoc(cartRef);
    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      setCartItems(cartData.items || []);
      calculateTotal(cartData.items || []);
    }
  };

  const fetchWalletBalance = async () => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      setWalletBalance(userData.wallet || 0);
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
    // implement the logic for apply the voucher
    console.log('Applying voucher:', voucherCode);
    // For now, log the voucher code
  };

  const deleteItem = async (productId) => {
    const cartRef = doc(db, `users/${user.uid}/carts/${restaurantID}`);
    const cartSnap = await getDoc(cartRef);
    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      const updatedItems = cartData.items.filter(item => item.productId !== productId);

      await updateDoc(cartRef, { items: updatedItems });
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    }
  };

  const confirmPurchase = async () => {
    if (selectedPayment === 'wallet' && total > walletBalance) {
      alert('Insufficient funds in wallet');
      return;
    }

    try {
      // Create new order document
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        restaurantId: restaurantID,
        status: "ongoing",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completedAt: null,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
          imageSrc: item.imageSrc,
          prepTime: item.prepTime
        })),
        totalAmount: total,
        paymentMethod: selectedPayment,
        voucherCode: selectedPayment === 'voucher' ? voucherCode : null,
        notes: "" // You could add a notes field in your UI if needed
      });

      console.log("Order created with ID: ", orderRef.id);

      // Update user's wallet balance if paid from wallet
      if (selectedPayment === 'wallet') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          wallet: walletBalance - total
        });
        setWalletBalance(walletBalance - total);
      }

      // Clear the cart
      const cartRef = doc(db, `users/${user.uid}/carts/${restaurantID}`);
      await updateDoc(cartRef, { items: [] });
      setCartItems([]);
      setTotal(0);

      alert('Purchase confirmed! Order ID: ' + orderRef.id);
      // redirect to the next page here
    } catch (error) {
      console.error("Error creating order: ", error);
      alert('An error occurred while processing your order. Please try again.');
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