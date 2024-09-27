import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import "./Restaurant.css";
import {db} from '../../firebase';
import {collection, getDocs} from 'firebase/firestore';
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {calculateAverageRating} from "../../utils/averageRating";

function Restaurant() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const restaurantsCollection = collection(db, 'restaurants');
                const restaurantsSnapshot = await getDocs(restaurantsCollection);
                const restaurantsList = await Promise.all(restaurantsSnapshot.docs.map(async doc => {
                    const data = doc.data();
                    const averageRating = await calculateAverageRating(doc.id);
                    return {
                        id: doc.id,
                        ...data,
                        averageRating
                    };
                }));
                setRestaurants(restaurantsList);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching restaurants:", err);
                setError("Failed to load restaurant data");
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!restaurants.length) return <div>No restaurant data available</div>;

    return (
        <>
            <Header/>
            <div className="restaurant-list">
                <header className="menuHeader">Restaurant/Dining Hall Name</header>
                {restaurants.map((restaurant) => (
                    <article key={restaurant.id} className="restaurant-details restaurant-article">
                        <section id="main-section">
                            <div>
                                <h2>{restaurant.name}</h2>
                                <p>Location: {restaurant.location}</p>
                                <p>
                                    Hours: {restaurant.opening_time} - {restaurant.closing_time}
                                </p>
                                <p>Rating: {restaurant.averageRating || 'N/A'}</p>
                            </div>
                            <div>
                                <ul>
                                    <li>
                                        <Link to={`/menu/${restaurant.id}`} state={{restaurant}}>
                                            <button className="menuButton">Menu</button>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={`/restaurant-info/${restaurant.id}`} state={{restaurant}}>
                                            <button className="menuButton">More Info</button>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </section>
                        <section className="restaurant-image">
                            {restaurant.restImg && (
                                <img src={restaurant.restImg} alt={restaurant.name}/>
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
