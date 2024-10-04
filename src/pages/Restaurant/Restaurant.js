import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import { Link } from "react-router-dom";
import "./Restaurant.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LoadModal from "../../components/LoadModal/LoadModal";
import ReservationPage from "../Reservation/ReservationPage/ReservationPage";

Modal.setAppElement('#root'); // Set the app element for accessibility

function Restaurant() {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [selectedPreferences, setSelectedPreferences] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventModalIsOpen, setEventModalIsOpen] = useState(false);
    const [reservationModalIsOpen, setReservationModalIsOpen] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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

        const fetchEvents = async () => {
            try {
                const response = await fetch('https://us-central1-witslivelycampus.cloudfunctions.net/app/events');
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const events = await response.json();
                const fiveDaysFromNow = new Date();
                fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
                const filteredEvents = events.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate <= fiveDaysFromNow && eventDate >= new Date();
                });
                setUpcomingEvents(filteredEvents);
            } catch (err) {
                console.error("Error fetching events:", err);
            }
        };

        fetchRestaurants();
        fetchEvents();
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

    const openEventModal = (event) => {
        setSelectedEvent(event);
        setEventModalIsOpen(true);
    };

    const closeEventModal = () => {
        setEventModalIsOpen(false);
        setSelectedEvent(null);
    };

    const openReservationModal = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setReservationModalIsOpen(true);
    };

    const closeReservationModal = () => {
        setReservationModalIsOpen(false);
        setSelectedRestaurant(null);
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

    const getUpcomingEvent = (restaurantLocation) => {
        return upcomingEvents.find(event =>
            event.venue.includes("West Campus") && restaurantLocation.includes("West Campus")
        );
    };

    if (error) return <div>Error: {error}</div>;
    if (!restaurants.length && !loading) return <div>No restaurant data available</div>;

    const modalStyle = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            borderRadius: '15px',
            padding: '20px',
            backgroundColor: 'white',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }
    };

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

                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Dietary Preferences"
                    style={modalStyle}
                >
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
                    <button onClick={closeModal} className="modalCloseButton">Close</button>
                </Modal>

                <Modal
                    isOpen={eventModalIsOpen}
                    onRequestClose={closeEventModal}
                    contentLabel="Event Details"
                    style={modalStyle}
                >
                    {selectedEvent && (
                        <div>
                            <header className="menuHeader">{selectedEvent.title}</header>
                            <div className="eventModalContent">
                                <img src={selectedEvent.imageUrl} alt={selectedEvent.title} style={{maxWidth: '100%', height: 'auto', marginBottom: '15px'}} />
                                <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                                <p><strong>Date:</strong> {selectedEvent.date}</p>
                                <p><strong>Description:</strong> {selectedEvent.description}</p>
                                <p><strong>Available Tickets:</strong> {selectedEvent.availableTickets}</p>
                                <p>Get some food for the event and checkout <a href="https://example.com" target="_blank" rel="noopener noreferrer">our website</a> for bookings and more info.</p>
                            </div>
                            <button onClick={closeEventModal} className="modalCloseButton">Close</button>
                        </div>
                    )}
                </Modal>

                <Modal
                    isOpen={reservationModalIsOpen}
                    onRequestClose={closeReservationModal}
                    contentLabel="Reservation"
                    style={modalStyle}
                >
                    {selectedRestaurant && (
                        <ReservationPage restaurant={selectedRestaurant} onClose={closeReservationModal} />
                    )}
                </Modal>

                <section id="restaurant-list">
                    const upcomingEvent = getUpcomingEvent(restaurant.location);
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
                                    {upcomingEvent && (
                                        <li
                                            className="upcoming-event"
                                            onClick={() => openEventModal(upcomingEvent)}
                                        >
                                            <b>Upcoming Event:</b> {upcomingEvent.title}
                                        </li>
                                    )}
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
                                        <button className="menuButton" onClick={() => openReservationModal(restaurant)}>
                                            <span className="material-symbols-outlined icon filled menu-icon">
                                                table_restaurant
                                            </span>
                                            <p>Reservation</p>
                                        </button>
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
            <Footer />
        </>
    );
}

export default Restaurant;