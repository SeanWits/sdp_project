import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import { Link } from "react-router-dom";
import "./Restaurant.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LoadModal from "../../components/LoadModal/LoadModal";

function Restaurant() {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [selectedPreferences, setSelectedPreferences] = useState([]);

    const prefOptions = ["Halaal", "Vegan", "Vegetarian", "Lactose-free", "Gluten-free", "Nut-free", "Egg-free"];

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
                setFilteredRestaurants(restaurantsList);
                setTimeout(() => setLoading(false), 500);
            } catch (err) {
                console.error("Error fetching restaurants:", err);
                setError("Failed to load restaurant data");
                setTimeout(() => setLoading(false), 500);
            }
        };

        fetchRestaurants();
    }, []);

    useEffect(() => {
        filterRestaurants();
    }, [selectedPreferences, restaurants]);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const handlePreferenceChange = (pref) => {
        setSelectedPreferences(prevPrefs => 
            prevPrefs.includes(pref)
                ? prevPrefs.filter(p => p !== pref)
                : [...prevPrefs, pref]
        );
    };

    const filterRestaurants = () => {
        if (selectedPreferences.length === 0) {
            setFilteredRestaurants(restaurants);
        } else {
            const filtered = restaurants.filter(restaurant => 
                selectedPreferences.every(pref => restaurant.prefs.includes(pref))
            );
            setFilteredRestaurants(filtered);
        }
    };

    if (error) return <div>Error: {error}</div>;
    if (!restaurants.length && !loading) return <div>No restaurant data available</div>;

    return (
        <>
            <Header />
            <LoadModal loading={loading} />
            <div className="restaurant-list">
                <header className="menuHeader">Restaurant/Dining Hall Name</header>
                <div>
                <button className="prefbutton" onClick={openModal}>Dietary Preferences</button>
                </div>

                <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Dietary Preferences">
                    <header className="menuHeader">Dietary Preferences</header>
                    <ul className="list-checkBox">
                        {prefOptions.map(pref => (
                            <li key={pref}>
                                <label htmlFor={pref} className="checkBox">
                                    <input
                                        type="checkbox"
                                        id={pref}
                                        value={pref}
                                        onChange={() => handlePreferenceChange(pref)}
                                        checked={selectedPreferences.includes(pref)}
                                    />
                                    {pref}
                                </label>
                            </li>
                        ))}
                    </ul>
                    <button onClick={closeModal}>Close</button>
                </Modal>

                {filteredRestaurants.map((restaurant) => (
                    <article key={restaurant.id} className="restaurant-details">
                        <section id="main-section">
                            <div id="restaurant-summary">
                                <h2>{restaurant.name}</h2>
                                <p>Location: {restaurant.location}</p>
                                <p>
                                    Hours: {restaurant.opening_time} - {restaurant.closing_time}
                                </p>
                                <p>Rating: {restaurant.rating || 'No Rating'}</p>
                            </div>
                            <div className="composite-buttons">
                                <Link to={`/menu/${restaurant.id}`} state={{restaurant}}>
                                    <button className="menuButton">Menu</button>
                                </Link>
                                <Link to={`/reservation/${restaurant.id}`} state={{restaurant}}>
                                    <button className="menuButton">Reservation</button>
                                </Link>
                                <Link to={`/restaurant-info/${restaurant.id}`} state={{restaurant}}>
                                    <button className="menuButton">More Info</button>
                                </Link>
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
            <Footer />
        </>
    );
}

export default Restaurant;