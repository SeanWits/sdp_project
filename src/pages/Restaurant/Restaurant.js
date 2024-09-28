import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Restaurant.css";
import {db} from '../../firebase';
import {collection, getDocs} from 'firebase/firestore';
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {calculateAverageRating} from "../../utils/averageRating";
import LoadModal from "../../components/LoadModal/LoadModal"; // Adjust the import path as needed

function Restaurant() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurants`);
                if (!response.ok) {
                    throw new Error('Failed to fetch restaurants');
                }
                const restaurantsList = await response.json();
                setRestaurants(restaurantsList);
                setTimeout(() => setLoading(false), 500); // 0.5-second delay before hiding the loader
            } catch (err) {
                console.error("Error fetching restaurants:", err);
                setError("Failed to load restaurant data");
                setTimeout(() => setLoading(false), 500); // 0.5-second delay even on error
            }
        };

    fetchRestaurants();
  }, []);


    if (error) return <div>Error: {error}</div>;
    if (!restaurants.length && !loading) return <div>No restaurant data available</div>;

    return (
        <>
            <Header/>
            <LoadModal loading={loading} />
            <div className="restaurant-list">
                <header className="menuHeader">Restaurant/Dining Hall Name</header>
                {restaurants.map((restaurant) => (
                    <article key={restaurant.id} className="restaurant-details">
                        <section id="main-section">
                            <div>
                                <h2>{restaurant.name}</h2>
                                <p>Location: {restaurant.location}</p>
                                <p>
                                    Hours: {restaurant.opening_time} - {restaurant.closing_time}
                                </p>
                                <p>Rating: {restaurant.rating || 'N/A'}</p>
                            </div>
                            <div>
                                <ul>
                                    <li>
                                        <Link to={`/menu/${restaurant.id}`} state={{ restaurant }}>
                                            <button className="menuButton">Menu</button>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={`/reservation/${restaurant.id}`} state={{ restaurant }}>
                                            <button className="menuButton">Reservation</button>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={`/restaurant-info/${restaurant.id}`} state={{ restaurant }}>
                                            <button className="menuButton">More Info</button>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </section>
                        <section className="restaurant-image">
                            {restaurant.restImg && (
                                <img src={restaurant.restImg} alt={restaurant.name} />
                            )}
                        </section>
                    </article>
                ))}
            </div>
            <Footer/>
        </>
    );
}

export default Restaurant;
