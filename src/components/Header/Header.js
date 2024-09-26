import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { UserContext } from '../../utils/userContext';
import Cart from '../Cart/Cart';

function Header({ disableCart = false, disableOrders = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [cartItemCount, setCartItemCount] = useState(0);
    const { user } = useContext(UserContext);
    const restaurantID = "rest001";

    useEffect(() => {
        if (user && !disableCart) {
            fetchCart();
        }

        window.addEventListener('cartUpdated', fetchCart);

        return () => {
            window.removeEventListener('cartUpdated', fetchCart);
        };

    }, [user, disableCart]);

    const fetchCart = async () => {
        if (!user) return;

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
            updateCartItemCount(cartData.items || []);
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
            handleNavigation("/admin");
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
                    <span
                        className="material-symbols-outlined icon"
                        onClick={() => handleNavigation("/dashboard")}
                    >
                        person
                    </span>
                    <span
                        className={`material-symbols-outlined icon ${disableOrders ? 'disabled' : ''}`}
                        onClick={handleOrdersClick}
                    >
                        receipt
                    </span>
                    <div
                        className={`cart-icon-container-header ${disableCart ? 'disabled' : ''}`}
                        onClick={toggleCart}
                    >
                        <span className="material-symbols-outlined icon">
                            shopping_basket
                        </span>
                        {cartItemCount > 0 && <span className="cart-counter">{cartItemCount}</span>}
                    </div>
                </section>
            </header>
            {!disableCart && user && (
                <Cart
                    isOpen={isCartOpen}
                    onClose={toggleCart}
                    items={cartItems}
                    restaurantID={restaurantID}
                    userID={user.uid}
                    fetchCart={fetchCart}
                />
            )}
        </>
    );
}

export default Header;