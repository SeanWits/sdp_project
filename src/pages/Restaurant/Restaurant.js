import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import { Link } from "react-router-dom";
import "./Restaurant.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LoadModal from "../../components/LoadModal/LoadModal";

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
          <Header />
          <LoadModal loading={loading} />
          <div className="restaurant-list">
              <header className="menuHeader">Restaurant/Dining Hall Name</header>
              <div>
                  <button className="prefbutton" onClick={openModal}>Dietary Preferences</button>
              </div>

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

              {filteredRestaurants.map((restaurant) => {
                  const upcomingEvent = getUpcomingEvent(restaurant.location);
                  return (
                      <article key={restaurant.id} className="restaurant-details">
                            <section id="main-section">
                                <div id="restaurant-summary">
                                    <h2>{restaurant.name}</h2>
                                    <p><b>Location:</b> {restaurant.location}</p>
                                    <p>
                                        <b>Hours:</b> {restaurant.opening_time} - {restaurant.closing_time}
                                    </p>
                                    <p><b>Rating:</b> {restaurant.rating || 'No Rating'}</p>
                                    {upcomingEvent && (
                                        <p style={{ color: 'green', cursor: 'pointer' }} onClick={() => openEventModal(upcomingEvent)}>
                                            <b>Upcoming Event:</b> {upcomingEvent.title}
                                        </p>
                                    )}
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
                    );
                })}
            </div>
            <Footer />
        </>
    );
}

export default Restaurant;