import React, {useState, useEffect} from "react";
import {Link, useParams, useLocation} from "react-router-dom";
import "./RestaurantInfo.css";
import LoadModal from '../../components/LoadModal/LoadModal';
import Popup from "../Reviews/Popup/Popup";
import {Reviews} from "../Reviews/Reviews";
import Header from "../../components/Header/Header";

function RestaurantInfo() {
    const {id} = useParams();
    const location = useLocation();
    const [restaurant, setRestaurant] = useState(location.state?.restaurant || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //pop up
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const togglePopup = () => {
        setIsPopupOpen((prev) => !prev);
    };

    useEffect(() => {
        const fetchRestaurant = async () => {
            if (!restaurant) {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurant/${id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch restaurant data');
                    }
                    const restaurantData = await response.json();
                    setRestaurant(restaurantData);
                } catch (err) {
                    console.error("Error fetching restaurant:", err);
                    setError("Failed to load restaurant data");
                }
            }
            setTimeout(() => setLoading(false), 200);
        };

        fetchRestaurant();
    }, [id, restaurant]);

    const handleRatingChanged = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurant/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch updated restaurant data');
            }
            const updatedRestaurantData = await response.json();
            setRestaurant(updatedRestaurantData);
        } catch (err) {
            console.error("Error fetching updated restaurant data:", err);
            setError("Failed to load updated restaurant data");
        }
    };

    if (error) return <div>Error: {error}</div>;
    if (!restaurant && !loading) return <div>No restaurant data available</div>;

    return (
        <div className="restaurant-info">
            <Header/>
            <LoadModal loading={loading}/>
            <header className="menuHeader">
                <Link to="/" className="back-arrow">
                        <span className="material-symbols-outlined icon filled">
                            arrow_back_ios_new
                        </span>
                </Link>
                {restaurant?.name}
            </header>

            {!loading && restaurant && ( // Only render the content when not loading and restaurant data is available
                <>
                    <section className="resDeets">
                        <section id="reviews">
                            <section id="reviewsReviews">
                                <h2>Restaurant Details</h2>
                            </section>

                            <section id="reviewsRating">
                                <article id="nameRes">
                                    <ul>
                                        <li>Name: {restaurant.name}</li>
                                        <li>Location: {restaurant.location}</li>
                                        <li>Operating Hours: {restaurant.opening_time} - {restaurant.closing_time}</li>
                                        <li>Contact details: {restaurant.contact_details || 'No Contact Details'}</li>
                                        <li>Telephone: {restaurant.telephone || 'No Telephone'}</li>
                                        <li>Email: {restaurant.email || 'No Email'}</li>
                                        <li>Rating: {restaurant.rating || 'No Rating'}</li>
                                    </ul>
                                </article>
                                <article id={"restaurant_img"}>
                                    {restaurant.restImg && (
                                        <img id="imgRes" src={restaurant.restImg} alt={restaurant.name}/>
                                    )}
                                </article>
                            </section>
                        </section>
                    </section>

                    <button onClick={togglePopup} className="menuButton" id="RestaurantInfoButton">
                        Click For Review
                    </button>
                    <Popup isOpen={isPopupOpen} onClose={togglePopup}>
                        <Reviews restaurantID={restaurant.id} mealID={null} onRatingChanged={handleRatingChanged}/>
                    </Popup>
                </>
            )}
        </div>
    );
}

export default RestaurantInfo;