import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { UserContext } from '../../utils/userContext';
import { db, doc, getDoc } from '../../firebase';
import Cart from '../Cart/Cart';

function Header() {
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [cartItemCount, setCartItemCount] = useState(0);
    const { user } = useContext(UserContext);
    const restaurantID = "rest001";

    useEffect(() => {
        if (user) {
            fetchCart();
        }
    }, [user]);

    const fetchCart = async () => {
        if (!user) return;

        const cartRef = doc(db, `users/${user.uid}/carts/${restaurantID}`);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
            const items = cartSnap.data().items || [];
            setCartItems(items);
            updateCartItemCount(items);
        }
    };

    const updateCartItemCount = (items) => {
        const count = items.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(count);
    };

    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
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
                        onClick={() => navigate("/Orders")}
                    >
                        receipt
                    </span>
                    <div className="cart-icon-container-header" onClick={toggleCart}>
                        <span className="material-symbols-outlined icon">
                            shopping_basket
                        </span>
                        {cartItemCount > 0 && <span className="cart-counter">{cartItemCount}</span>}
                    </div>
                </section>
            </header>
            <Cart 
                isOpen={isCartOpen} 
                onClose={toggleCart} 
                items={cartItems}
                restaurantID={restaurantID}
                userID={user ? user.uid : null}
            />
        </>
    );
}

export default Header;