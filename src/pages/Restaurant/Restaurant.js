import React, {useState, useEffect} from "react";
import Modal from 'react-modal';
import {Link} from "react-router-dom";
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
            <Header/>
            <LoadModal loading={loading}/>
            <div className="restaurants-div">
                <header className="menuHeader"><h2 className="restaurants-heading">Restaurants/Dining Halls</h2>
                    <span id={"dietary-filter"} className="material-symbols-outlined icon filled" onClick={openModal}>
                        filter_alt
                    </span>
                </header>

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

                <section id="restaurant-list">
                    {filteredRestaurants.map((restaurant) => (
                        <article key={restaurant.id} className="restaurant-details">
                            <section id="main-section">
                                <div id="restaurant-summary">
                                    <h2 id="restaurant-name-heading">{restaurant.name}</h2>
                                    <h5 id="restaurant-location-heading"><b>Location:</b>
                                    </h5>
                                    <p id="restaurant-location-paragraph"> {restaurant.location}</p>
                                    <h5 id={"restaurant-hours-heading"}><b>Hours:</b></h5>
                                    <p id={"restaurant-hours-paragraph"}>
                                        {restaurant.opening_time} - {restaurant.closing_time}
                                    </p>
                                    <h5 id="restaurant-rating-heading"><b>Rating:</b></h5>
                                    <p id="restaurant-rating-paragraph">
                                        {restaurant.rating || 'No Rating'}</p>
                                </div>
                                <div className="composite-buttons">
                                    <Link to={`/menu/${restaurant.id}`} state={{restaurant}}>
                                        <button className="menuButton">

                                            <span
                                                className="material-symbols-outlined icon filled menu-icon">
                                                restaurant
                                            </span><p>Menu</p>
                                        </button>
                                    </Link>
                                    <Link to={`/reservation/${restaurant.id}`} state={{restaurant}}>
                                        <button className="menuButton">
                                            <span className="material-symbols-outlined icon filled menu-icon">
                                                table_restaurant
                                            </span>
                                            <p>Reservation</p>
                                        </button>
                                    </Link>
                                    <Link to={`/restaurant-info/${restaurant.id}`} state={{restaurant}}>
                                        <button className="menuButton">
                                            <span className="material-symbols-outlined icon filled menu-icon">
                                                info
                                            </span>
                                            <p>More Info</p>
                                        </button>
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
                </section>
            </div>
            <Footer/>
        </>
    );
}

export default Restaurant;