import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {Link} from "react-router-dom";
import { UserContext } from '../../utils/userContext';
import OrderCard from '../../components/OrderCard/OrderCard';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchOrdersAndRestaurants();
  }, [user]);

  const fetchOrdersAndRestaurants = async () => {
    if (!user) return;

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      }));

      // Fetch restaurant details for each unique restaurantId
      const uniqueRestaurantIds = [...new Set(ordersData.map(order => order.restaurantId))];
      const restaurantDetails = {};

      for (const restaurantId of uniqueRestaurantIds) {
        const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
        if (restaurantDoc.exists()) {
          restaurantDetails[restaurantId] = restaurantDoc.data();
        }
      }

      // Combine order data with restaurant details
      const ordersWithRestaurantDetails = ordersData.map(order => ({
        ...order,
        restaurantDetails: restaurantDetails[order.restaurantId] || {}
      }));

      setOrders(ordersWithRestaurantDetails);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });

      // Update the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Header disableCart={true} disableOrders={true}/>
      <header className="orderHeader">
        <Link to="/" className="back-arrow-orders">&#8592;</Link>
        <h1 className="orderHeading">Orders</h1>
      </header>
      <div className="orders-container">
        <div className="order-list">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Orders;