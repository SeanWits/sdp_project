import React, {useState, useEffect, useRef, useContext} from "react";
import Modal from 'react-modal';
import {Link, useNavigate} from "react-router-dom";
import "./Restaurant.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LoadModal from "../../components/LoadModal/LoadModal";
import ReservationPage from "../Reservation/ReservationPage/ReservationPage";
import {NavBar} from "../../components/NavBar/NavBar";
import {UserContext} from "../../utils/userContext";
import Popup from "../Reviews/Popup/Popup";
import HistoryPage from "../Reservation/HistoryPage/HistoryPage";
import {Hint} from "../../components/Hint/hint";

//Modal.setAppElement('#root'); // Set the app element for accessibility

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
    const [isActiveReservation, setIsActiveReservation] = useState(false);
    const [checkedReservations, setCheckedReservations] = useState(false);
    const {user} = useContext(UserContext);
    const navigate = useNavigate();
    const [isPopupOpen, setIsPopupOpen] = useState(false);


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

    useEffect(() => {
        if (user)
            (!checkedReservations) ? (checkActiveReservation()) : (setCheckedReservations(false));
    }, []);

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

    const checkActiveReservation = async () => {
        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/reservations/active`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to check active reservations');
            }

            const {hasActiveReservation} = await response.json();
            if (hasActiveReservation) {
                setIsActiveReservation(true);
            } else {
                setIsActiveReservation(false);
            }
        } catch (error) {
            console.error("Error checking active reservations: ", error);
            alert("Failed to check active reservations. Please try again.");
        }
    };

    const handleActiveReservation = () => {
        alert("You have an active reservation.");
        togglePopup();
    }
    const togglePopup = () => {
        setIsPopupOpen((prev) => !prev);
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
            padding: '0',
            backgroundColor: 'white',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }
    };

    const handleReservationButtonClick = (restaurant) => {
        if (user) {
            checkActiveReservation();
            (!isActiveReservation ? (openReservationModal(restaurant)) : (handleActiveReservation()))
        } else {
            navigate('/login');
        }
    };


    return (
        <>
            <Header/>
            <LoadModal loading={loading}/>
            <div className="restaurants-div">
                <NavBar Heading="Restaurants/Dining Halls" displayBackButton={false} displayIcon={true}
                        openModal={openModal}/>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Dietary Preferences"
                    style={modalStyle}
                >
                    <header className="modalHeader">
                        <h2 id={"dietary-heading"}>Dietary Preferences</h2>

                        <span className="material-symbols-outlined icon filled" onClick={closeModal}>
                            cancel
                        </span>
                    </header>
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
                </Modal>

                <Modal
                    isOpen={eventModalIsOpen}
                    onRequestClose={closeEventModal}
                    contentLabel="Event Details"
                    style={modalStyle}
                >
                    {selectedEvent && (
                        <div>
                            <header className="modalHeader">
                                <h2>{selectedEvent.title}</h2>
                            </header>
                            <div className="eventModalContent">
                                <img src={selectedEvent.imageUrl} alt={selectedEvent.title}
                                     style={{maxWidth: '100%', height: 'auto', marginBottom: '15px'}}/>
                                <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                                <p><strong>Date:</strong> {selectedEvent.date}</p>
                                <p><strong>Description:</strong> {selectedEvent.description}</p>
                                <p><strong>Available Tickets:</strong> {selectedEvent.availableTickets}</p>
                                <p>Get some food for the event and checkout <a href="https://example.com"
                                                                               target="_blank"
                                                                               rel="noopener noreferrer">our
                                    website</a> for bookings and more info.</p>
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
                        <ReservationPage restaurant={selectedRestaurant} onClose={closeReservationModal}/>
                    )}
                </Modal>

                <section id="restaurant-list">
                    {filteredRestaurants.map((restaurant) => {
                        const upcomingEvent = getUpcomingEvent(restaurant.location);
                        return (
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
                                        <h5 id={"upcoming-heading"}><b>Upcoming Event:</b></h5>
                                        {upcomingEvent ? (
                                            <p className="upcoming-event" id={"upcoming-event-paragraph"}
                                               onClick={() => openEventModal(upcomingEvent)}>{upcomingEvent.title}</p>
                                        ) : (
                                            <p className="upcoming-event" id={"no-upcoming-event-paragraph"}
                                            >None</p>
                                        )}
                                    </div>
                                    <div className="composite-buttons">
                                        <Link id={"menu-button"} to={`/menu/${restaurant.id}`} state={{restaurant}}>
                                            <button className="menuButton">
                                                <span
                                                    className="material-symbols-outlined icon filled menu-icon">
                                                    restaurant
                                                </span><p>Menu</p>
                                            </button>
                                        </Link>
                                        <button className="menuButton" id={"reservation-button"}
                                                onClick={() => {
                                                    handleReservationButtonClick(restaurant);
                                                }}>
                                            <span className="material-symbols-outlined icon filled menu-icon">
                                                table_restaurant
                                            </span>
                                            <p>Reservation</p>
                                        </button>
                                        <Link id={"more-info-button"} to={`/restaurant-info/${restaurant.id}`}
                                              state={{restaurant}}>
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
                        );
                    })}
                </section>
            </div>
            <Footer/>
            <Popup isOpen={isPopupOpen} onClose={togglePopup}>
                <HistoryPage onClose={togglePopup}/>
            </Popup>
        </>
    );
}

export default Restaurant;