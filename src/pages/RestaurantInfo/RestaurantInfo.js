import React, {useState, useEffect} from "react";
import {Link, useParams, useLocation} from "react-router-dom";
import Modal from 'react-modal';
import "./RestaurantInfo.css";
import LoadModal from '../../components/LoadModal/LoadModal';
import Popup from "../Reviews/Popup/Popup";
import {Reviews} from "../Reviews/Reviews";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {NavBar} from "../../components/NavBar/NavBar";

//Modal.setAppElement('#root');

function RestaurantInfo() {
    const {id} = useParams();
    const location = useLocation();
    const [restaurant, setRestaurant] = useState(location.state?.restaurant || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventModalIsOpen, setEventModalIsOpen] = useState(false);

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

        fetchRestaurant();
        fetchEvents();
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

    const togglePopup = () => {
        setIsPopupOpen((prev) => !prev);
    };

    const openEventModal = (event) => {
        setSelectedEvent(event);
        setEventModalIsOpen(true);
    };

    const closeEventModal = () => {
        setEventModalIsOpen(false);
        setSelectedEvent(null);
    };

    const getUpcomingEvent = (restaurantLocation) => {
        return upcomingEvents.find(event =>
            event.venue.includes("West Campus") && restaurantLocation.includes("West Campus")
        );
    };

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

    if (error) return <div>Error: {error}</div>;
    if (!restaurant && !loading) return <div>No restaurant data available</div>;

    const upcomingEvent = restaurant ? getUpcomingEvent(restaurant.location) : null;

    return (
        <>
            <Header/>
            <LoadModal loading={loading}/>
            <section id={"restaurant-info-section"} data-testid="restaurant-info-section">
                <NavBar displayBackButton={true} returnTo={"/"} Heading={restaurant.name}/>

                {!loading && restaurant && (
                    <>
                        <section className="resDeets" data-testid="restaurant-details">
                            <section id="reviews">
                                <section id="reviewsReviews">
                                    <h2>Restaurant Details</h2>
                                </section>

                                <section id="reviewsRating">
                                    <article id="nameRes">
                                        <ul>
                                            <li><p className={"key-paragpraph"}>Name:</p> <p
                                                className={"value-paragraph"}> {restaurant.name}</p></li>
                                            <li><p className={"key-paragpraph"}>Location: </p> <p
                                                className={"value-paragraph"}>{restaurant.location}</p></li>
                                            <li><p className={"key-paragpraph"}>Operating
                                                Hours:</p> <p
                                                className={"value-paragraph"}> {restaurant.opening_time} - {restaurant.closing_time}</p>
                                            </li>
                                            <li><p className={"key-paragpraph"}>Contact
                                                details: </p> <p
                                                className={"value-paragraph"}>{restaurant.contact_details || 'No Contact Details'}</p>
                                            </li>
                                            <li><p className={"key-paragpraph"}>Telephone: </p> <p
                                                className={"value-paragraph"}>{restaurant.telephone || 'No Telephone'}</p>
                                            </li>
                                            <li><p className={"key-paragpraph"}>Email: </p> <p
                                                className={"value-paragraph"}>{restaurant.email || 'No Email'}</p></li>
                                            <li><p className={"key-paragpraph"}>Rating: </p> <p
                                                className={"value-paragraph"}>{restaurant.rating || 'No Rating'}</p>
                                            </li>
                                            <li>
                                                <p
                                                    onClick={() => openEventModal(upcomingEvent)}
                                                    className={"key-paragpraph"}>Upcoming Event:</p>
                                                {upcomingEvent ? (
                                                    <p className={"value-paragraph upcoming-event"}>{upcomingEvent
                                                        .title}</p>
                                                ) : (<p className={"value-paragraph"}
                                                        id={"no-event"}>None</p>)}
                                            </li>
                                        </ul>
                                    </article>
                                    <article id="restaurant_img">
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
                                    <button
                                        className="modalCloseButton"
                                        data-testid="modal-close-button"
                                        onClick={closeEventModal}
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </Modal>
                    </>
                )}
            </section>
            <Popup isOpen={isPopupOpen} onClose={togglePopup}>
                <Reviews
                    onClose={togglePopup}
                    restaurantID={restaurant?.id} // Add optional chaining
                    mealID={null}
                    onRatingChanged={handleRatingChanged}
                />
            </Popup>
            <Footer/>
        </>
    );
}

export default RestaurantInfo;