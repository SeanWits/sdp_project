import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../utils/userContext';
import { useNavigate, Link } from 'react-router-dom';
import { logoutUser } from '../../utils/authFunctions';
import './Dashboard.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import LoadModal from '../../components/LoadModal/LoadModal';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [walletAmount, setWalletAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard useEffect triggered');
    if (!user) {
      console.log('No user, navigating to login');
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    console.log('Fetching user data');
    try {
      setLoading(true);
      setError(null);
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
      console.log('User data fetched:', userData);
      setUserData(userData);
      await fetchRecentTransactions(idToken);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async (idToken) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders?limit=3`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch recent transactions');
      }
      const transactionsData = await response.json();
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
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user/update-wallet`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: parseFloat(walletAmount) })
      });
      if (!response.ok) {
        throw new Error('Failed to update wallet balance');
      }
      
      // Update the local state immediately
      setUserData(prevData => ({
        ...prevData,
        wallet: (prevData.wallet || 0) + parseFloat(walletAmount)
      }));
      
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
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
      alert('Failed to log out. Please try again.');
    }
  };
  
  console.log('Rendering Dashboard, userData:', userData);

  return (
    <>
      <Header/>
      <LoadModal loading={loading} />
      <header className="orderHeader">
        <Link to="/" className="back-arrow-dash">&#8592;</Link>
        <h1 className="dashHeading">Meal Credit Dashboard</h1>
      </header>
      <div className="dashboard">
        <p className="user-greeting">Welcome, {userData?.name || 'User'}</p>
        
        <div className="balance">
          <h2>Account Balance</h2>
          <p className="balance-amount" data-testid="balance-amount">
            R{userData ? userData.wallet.toFixed(2) : '0.00'}
          </p>
        </div>

        <div className="transactions">
          <h2>Recent Transactions</h2>
          {recentTransactions.length > 0 ? (
            recentTransactions.map(transaction => (
              <div key={transaction.id} className="transaction">
                <span>{transaction.restaurantDetails?.name || 'Unknown Restaurant'}</span>
                <span className="debit">
                  -R{transaction.totalAmount ? transaction.totalAmount.toFixed(2) : '0.00'}
                </span>
              </div>
            ))
          ) : (
            <p>No recent transactions</p>
          )}
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