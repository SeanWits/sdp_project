import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserContext } from '../../utils/userContext';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../utils/authFunctions';
import './Dashboard.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [walletAmount, setWalletAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.uid) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }

      await fetchRecentTransactions();
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const querySnapshot = await getDocs(q);
      
      const transactionsData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
        const orderData = docSnapshot.data();
        let restaurantName = 'Unknown Restaurant';
        
        if (orderData.restaurantId) {
          const restaurantRef = doc(db, 'restaurants', orderData.restaurantId);
          const restaurantSnap = await getDoc(restaurantRef);
          if (restaurantSnap.exists()) {
            restaurantName = restaurantSnap.data().name;
          }
        }

        return {
          id: docSnapshot.id,
          restaurantName,
          amount: orderData.totalAmount
        };
      }));

      setRecentTransactions(transactionsData);
    } catch (err) {
      console.error("Error fetching recent transactions:", err);
    }
  };

  const handleViewTransactionHistory = () => {
    navigate('/orders');
  };

  const handleAddToWallet = async () => {
    if (!userData || !walletAmount) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const newWalletAmount = (userData.wallet || 0) + parseFloat(walletAmount);
      await updateDoc(userRef, { wallet: newWalletAmount });
      
      setUserData(prevData => ({ ...prevData, wallet: newWalletAmount }));
      setWalletAmount('');
      alert('Wallet updated successfully!');
    } catch (err) {
      console.error("Error updating wallet:", err);
      alert('Failed to update wallet. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null); // Clear the user context
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
      alert('Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <Header/>
    <div className="dashboard">
      <h1>Meal Credit Dashboard</h1>
      <p className="user-greeting">Welcome, {userData?.name || 'User'}</p>
      
      <div className="balance">
        <h2>Account Balance</h2>
        <p className="balance-amount">R{(userData?.wallet || 0).toFixed(2)}</p>
      </div>

      <div className="transactions">
        <h2>Recent Transactions</h2>
        {recentTransactions.map(transaction => (
          <div key={transaction.id} className="transaction">
            <span>{transaction.restaurantName}</span>
            <span className="debit">-R{transaction.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <button onClick={handleViewTransactionHistory} className="action-button">
        View Transaction History
      </button>

      <div className="add-to-wallet">
        <input
          type="number"
          value={walletAmount}
          onChange={(e) => setWalletAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <button onClick={handleAddToWallet} className="action-button">
          Add to Wallet
        </button>
      </div>

      <button onClick={handleLogout} className="action-button logout-button">
        Log Out
      </button>
    </div>
    <Footer/>
    </>
  );
};

export default Dashboard;