import React, {useState, useEffect, useContext} from "react";
import {Link, useLocation, useParams, useNavigate} from "react-router-dom";
import "./Meal.css";
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
            navigate("/login", { state: { from: location } });
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

            const result = await response.json();
            if (result.cartCleared) {
                alert("Your previous cart has been cleared as you've added an item from a different restaurant.");
            }

            // console.log("Item added to cart");

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
            <div className="meal-div">
                <header className="menuHeader">
                    <Link to={`/menu/${restaurantId}`} className="back-arrow">
                        <span className="material-symbols-outlined icon filled">
                            arrow_back_ios_new
                        </span>
                    </Link>
                    {restaurantName}
                </header>
                <h3>{item.name}</h3>
                <div className="separator-line"></div>
                <section id="meal-details-section">
                    <article id={"meal-details-article"}>
                        <div className="MealDivBox" id="longerThings">
                            <h4 id={"description_heading"}><b>Description</b></h4>
                            <p id={"description_paragraph"}>{item.description}</p>
                            <h4 id={"rating_heading"}><b>Rating</b></h4>
                            <section id="view_reviews_section">
                                <p>{item.rating ? `${item.rating}/5` : "No Rating"}</p>
                                <button className="menuButton" id="menuInfoButton" onClick={togglePopup}>
                                    Click For Reviews
                                </button>
                            </section>
                            <h4 id={"dietary_heading"}><b>Dietary Tags</b></h4>
                            <section id={"dietary_tags"}>
                                {item.dietary_tags && item.dietary_tags.length > 0 ? (
                                    item.dietary_tags.map((tag, index) => (
                                        <span key={index} className="dietary-tag">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span>No dietary tags available</span>
                                )}
                            </section>
                        </div>
                    </article>
                    <article id={"customise_and_pay_article"}>
                        
                        <section id={"payment_section"}>
                            <p id={"total_text"}>
                                <b>Total</b>: R{item.price.toFixed(2)}{" "}
                            </p>
                            <button
                                className="menuButton"
                                id="mealButton"
                                onClick={handleAddToCart}
                            >
                                Add to cart
                            </button>
                        </section>
                    </article>
                    <article id={"meal-image-article"}>
                        <img src={item.image_url} alt={item.name} className="item-image"/>
                    </article>
                </section>
                <div id={"last-seperator-line"} className="separator-line"></div>

                <Popup isOpen={isPopupOpen} onClose={togglePopup}>
                    <Reviews restaurantID={restaurantId} mealID={item.productID} onRatingChanged={handleRatingChanged}/>
                </Popup>
            </div>
            <Footer/>
        </>
    );
}

export default Meal;