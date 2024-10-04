import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import Modal from 'react-modal';
import "./Header.css";
import { UserContext } from '../../utils/userContext';
import Cart from '../Cart/Cart';
import { Hint } from "../Hint/hint";

Modal.setAppElement('#root');

function Header({ disableCart = false, disableOrders = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [currentCartRestaurantId, setCurrentCartRestaurantId] = useState(null);
    const { user } = useContext(UserContext);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (user && !disableCart) {
            fetchCart();
        }

        window.addEventListener('cartUpdated', fetchCart);

        // Mock alerts
        setAlerts([
            { date: '2024-10-05', time: '14:30', incident: 'Suspicious activity', area: 'East Campus Matrix', affectedVenues: 'Matrix Cafeteria' },
            { date: '2024-10-05', time: '15:45', incident: 'Power outage', area: 'East Campus Matrix', affectedVenues: 'All restaurants in East Campus Matrix' },
            { date: '2024-10-05', time: '16:20', incident: 'Water supply issue', area: 'East Campus Matrix', affectedVenues: 'Matrix Food Court' }
        ]);

        return () => {
            window.removeEventListener('cartUpdated', fetchCart);
        };
    }, [user, disableCart]);

    const fetchCart = async () => {
        if (!user) return;

        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }
            const cartData = await response.json();
            if (cartData && cartData.items) {
                setCartItems(cartData.items);
                updateCartItemCount(cartData.items);
                setCurrentCartRestaurantId(cartData.restaurantId);
                // console.log("Cart mounted:", cartData.restaurantId);
            } else {
                setCartItems([]);
                setCartItemCount(0);
                setCurrentCartRestaurantId(null);
                console.log("Cart is empty");
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    const updateCartItemCount = (items) => {
        const count = items.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(count);
    };

    const handleNavigation = (path) => {
        if (user) {
            navigate(path);
        } else {
            navigate("/login");
        }
    };

    const toggleCart = () => {
        if (!disableCart) {
            if (user) {
                setIsCartOpen(prev => !prev);
            } else {
                navigate("/login");
            }
        }
    };

    const handleOrdersClick = () => {
        if (!disableOrders) {
            handleNavigation("/orders");
        }
    };

    const toggleAlertModal = () => {
        setIsAlertModalOpen(prev => !prev);
    };

    const modalStyle = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            borderRadius: '15px',
            padding: '20px',
            backgroundColor: 'white',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }
    };

    return (
        <>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            />

            <header id="Header">
                <section id="logo_on_header" onClick={() => navigate("/")}>
                    <img
                        id="logo"
                        src={require("../../assets/logo outline transparent.png")}
                        alt="Campus Bites Logo"
                    />
                    <p id="logo_label">Campus Bites</p>
                </section>
                <section id="icons_on_header">
                <Hint hintText={"View safety alerts"}>
                        <div
                            className="alert-icon-container-header"
                            onClick={toggleAlertModal}
                        >
                        <span className="material-symbols-outlined icon">
                            notifications
                        </span>
                            {alerts.length > 0 && <span className="alert-counter">{alerts.length}</span>}
                        </div>
                    </Hint>
                    <Hint hintText={"View your reservations"}>
                        <Link to={"/history"}>
                        <span className="material-symbols-outlined icon">
                            event
                        </span>
                        </Link>
                    </Hint>
                    <Hint hintText={"View your account dashboard"}>
                    <span
                        className="material-symbols-outlined icon"
                        onClick={() => handleNavigation("/dashboard")}
                    >
                        person
                    </span>
                    </Hint>
                    <Hint hintText={"View your orders"}>
                    <span
                        className={`material-symbols-outlined icon ${disableOrders ? 'disabled' : ''}`}
                        onClick={handleOrdersClick}
                    >
                        receipt
                    </span>
                    </Hint>
                    <Hint hintText={"View your cart"}>
                        <div
                            className={`cart-icon-container-header ${disableCart ? 'disabled' : ''}`}
                            onClick={toggleCart}
                        >
                        <span className="material-symbols-outlined icon">
                            shopping_basket
                        </span>
                            {cartItemCount > 0 && <span className="cart-counter">{cartItemCount}</span>}
                        </div>
                    </Hint>
                </section>
            </header>
            {!disableCart && user && (
                <Cart
                    isOpen={isCartOpen}
                    onClose={toggleCart}
                    items={cartItems}
                    restaurantId={currentCartRestaurantId}
                    userID={user.uid}
                    fetchCart={fetchCart}
                />
            )}
            <Modal
                isOpen={isAlertModalOpen}
                onRequestClose={toggleAlertModal}
                contentLabel="Safety Alerts"
                style={modalStyle}
            >
                <div>
                    <header className="menuHeader">Safety Alerts</header>
                    <div className="alertModalContent">
                        {alerts.map((alert, index) => (
                            <div key={index} className="alert-item">
                                <p><strong>Date:</strong> {alert.date}</p>
                                <p><strong>Time:</strong> {alert.time}</p>
                                <p><strong>Incident:</strong> {alert.incident}</p>
                                <p><strong>Area:</strong> {alert.area}</p>
                                <p><strong>Affected Venues:</strong> {alert.affectedVenues}</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={toggleAlertModal} className="modalCloseButton">Close</button>
                </div>
            </Modal>
        </>
    );
}

export default Header;