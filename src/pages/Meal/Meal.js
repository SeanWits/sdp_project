import React, {useState, useEffect, useContext} from "react";
import {Link, useLocation, useParams, useNavigate} from "react-router-dom";
import "./Meal.css";
import {collection, db} from '../../firebase';
import {doc, getDoc, setDoc, updateDoc, arrayUnion, getDocs, query, where} from 'firebase/firestore';
import {UserContext} from '../../utils/userContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Popup from "../Reviews/Popup/Popup";
import {Reviews} from "../Reviews/Reviews";

function Meal() {
    const [size, setSize] = useState("small");
    const location = useLocation();
    const navigate = useNavigate();
    const {restaurantId, itemName} = useParams();
    const [item, setItem] = useState(location.state?.item || null);
    const [restaurantName, setRestaurantName] = useState(
        location.state?.restaurantName || "Restaurant/Dining Hall"
    );
    const [loading, setLoading] = useState(!item);
    const [error, setError] = useState(null);
    const {user} = useContext(UserContext);
    const [reviews, setReviews] = useState([]);

    //pop up
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const togglePopup = () => {
        setIsPopupOpen((prev) => !prev);
    };

    useEffect(() => {
        const fetchItem = async () => {
            if (!item) {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurant/${restaurantId}/menu-item/${encodeURIComponent(itemName)}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch menu item');
                    }
                    const data = await response.json();
                    setItem(data.item);
                    setRestaurantName(data.restaurantName);
                } catch (err) {
                    console.error("Error fetching item:", err);
                    setError("Failed to load item data");
                }
                setLoading(false);
            }
        };

        fetchItem();
    }, [restaurantId, itemName, item]);

    const handleAddToCart = async () => {
        if (!user) {
            console.log("User not logged in");
            navigate("/login", {state: {from: location}});
            return;
        }

        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    restaurantId,
                    item
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }

            console.log("Item added to cart");

            // Dispatch custom event to notify of cart update
            window.dispatchEvent(new CustomEvent("cartUpdated"));

            // Implement user feedback for successful add to cart
        } catch (error) {
            console.error("Error adding item to cart:", error);
            // Implement user feedback for error
        }
    };

    const handleRatingChanged = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurant/${restaurantId}/menu-item/${encodeURIComponent(itemName)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch menu item');
            }
            const data = await response.json();
            setItem(data.item);
            setRestaurantName(data.restaurantName);
        } catch (err) {
            console.error("Error fetching item:", err);
            setError("Failed to load item data");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!item) return <div>No item data available</div>;

    return (
        <>
            <Header/>
            <div className="restaurant-list">
                <header className="menuHeader">
                    <Link to={`/menu/${restaurantId}`} className="back-arrow">
                        &#8592;
                    </Link>
                    {restaurantName}
                </header>
                <h1>{item.name}</h1>
                <div className="separator-line"></div>
                <section id="mainThing">
                    <article>
                        <div className="MealDivBox" id="longerThings">
                            <p>{item.description}</p>
                            <p>Rating: {item.rating || "No Rating."}</p>
                        </div>
                    </article>
                    <article>
                        <div className="MealDivBox">
                            <h3 className="text-lg font-semibold mb-2">Customise order</h3>
                            <div className="flex flex-col">
                                <label className="flex flex-col mb-2">
                                    <input
                                        type="radio"
                                        className="form-radio"
                                        checked={size === "small"}
                                        onChange={() => setSize("small")}
                                    />
                                    <span className="mt-1">Small</span>{" "}
                                    {/* Added margin-top for spacing */}
                                </label>

                                <label className="flex flex-col">
                                    <input
                                        type="radio"
                                        className="form-radio"
                                        checked={size === "large"}
                                        onChange={() => setSize("large")}
                                    />
                                    <span className="mt-1">Large</span>{" "}
                                    {/* Added margin-top for spacing */}
                                </label>
                            </div>
                        </div>
                        Total: R{item.price.toFixed(2)}{" "}
                        <button
                            className="menuButton"
                            id="mealButton"
                            onClick={handleAddToCart}
                        >
                            Add to cart
                        </button>
                    </article>
                    <img src={item.image_url} alt={item.name} className="item-image"/>
                </section>
                <div className="separator-line"></div>

                <button className="menuButton" id="menuInfoButton" onClick={togglePopup}>
                    Click For Review
                </button>

                <Popup isOpen={isPopupOpen} onClose={togglePopup}>
                    <Reviews restaurantID={restaurantId} mealID={item.productID} onRatingChanged={handleRatingChanged}/>
                </Popup>
            </div>
            <Footer/>
        </>
    );
}

export default Meal;