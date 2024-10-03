import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Header.css";
import { UserContext } from '../../utils/userContext';
import Cart from '../Cart/Cart';
import { Hint } from "../Hint/hint";

function Header({ disableCart = false, disableOrders = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [currentCartRestaurantId, setCurrentCartRestaurantId] = useState(null);
    const { user } = useContext(UserContext);

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
                console.log("Cart mounted:", cartData.restaurantId);
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
        </>
    );
}

export default Header;