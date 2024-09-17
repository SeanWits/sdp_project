import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { UserContext } from '../../utils/userContext';
import { db, doc, getDoc } from '../../firebase';
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

        // Add event listener for cart updates
        window.addEventListener('cartUpdated', fetchCart);

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('cartUpdated', fetchCart);
        };

    }, [user, disableCart]);

    const fetchCart = async () => {
        if (!user) return;

        const cartRef = doc(db, `users/${user.uid}/carts/${restaurantID}`);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
            const items = cartSnap.data().items || [];
            setCartItems(items);
            updateCartItemCount(items);
        } else {
            setCartItems([]);
            updateCartItemCount([]);
        }
    };

    const updateCartItemCount = (items) => {
        const count = items.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(count);
    };

    const toggleCart = () => {
        if (!disableCart) {
            setIsCartOpen(prev => !prev);
        }
    };

    const handleOrdersClick = () => {
        if (!disableOrders) {
            navigate("/dashboard");
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
                        onClick={() => navigate("/dashboard")}
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
            {!disableCart && (
                <Cart
                    isOpen={isCartOpen}
                    onClose={toggleCart}
                    items={cartItems}
                    restaurantID={restaurantID}
                    userID={user ? user.uid : null}
                />
            )}
        </>
    );
}

export default Header;