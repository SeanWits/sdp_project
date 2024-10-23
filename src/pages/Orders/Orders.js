import React, {useState, useEffect, useContext} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {UserContext} from '../../utils/userContext';
import OrderCard from '../../components/OrderCard/OrderCard';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import LoadModal from '../../components/LoadModal/LoadModal'; // Add this import
import './Orders.css';
import {NavBar} from "../../components/NavBar/NavBar";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const idToken = await user.getIdToken();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const ordersData = await response.json();
            setOrders(ordersData);
            setTimeout(() => setLoading(false), 200); // 2-second delay before hiding the loader
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to load orders. Please try again.");
            setTimeout(() => setLoading(false), 200); // 2-second delay even on error
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/update-status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({newStatus})
            });
            if (!response.ok) {
                throw new Error('Failed to update order status');
            }
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? {...order, status: newStatus} : order
                )
            );
        } catch (err) {
            console.error("Error updating order status:", err);
            setError("Failed to update order status. Please try again.");
        }
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <Header disableCart={false} disableOrders={true}/>
            <LoadModal loading={loading}/>
            <section className="orders-section">
                <NavBar Heading={"Orders"} displayBackButton={true} returnTo={"/"}/>
                <section className="orders-container">
                    <div className="order-list">
                        {orders.length ? (orders.map(order => (
                            <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate}/>
                        ))) : <p style={{padding: "100px"}}>No Orders</p>}
                    </div>
                </section>
            </section>
            <Footer/>
        </>
    );
};

export default Orders;