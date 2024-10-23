import React, {useState, useEffect, useContext, useRef} from 'react';
import {UserContext} from '../../../utils/userContext';
import {styles} from './reservationPageStyles';
import {useNavigate} from "react-router-dom";

const ReservationPage = ({restaurant, onClose, onReservationMade}) => {
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [people, setPeople] = useState(1);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').setAttribute('min', today);
    }, []);

    useEffect(() => {
        if (date && restaurant) {
            const slots = generateTimeSlots(restaurant.opening_time, restaurant.closing_time, date);
            setAvailableTimeSlots(slots);
            setTimeSlot(''); // Reset time slot when date changes
        }
    }, [date, restaurant]);

    const generateTimeSlots = (open, close, selectedDate) => {
        const timeSlots = [];
        const [openHour, openMin] = open.split(':').map(Number);
        const [closeHour, closeMin] = close.split(':').map(Number);

        let currentDate = new Date(selectedDate);
        currentDate.setHours(openHour, openMin, 0, 0);

        const closeDate = new Date(selectedDate);
        closeDate.setHours(closeHour, closeMin, 0, 0);

        const now = new Date();
        const isToday = now.toDateString() === currentDate.toDateString();

        while (currentDate < closeDate) {
            if (!isToday || currentDate > now) {
                const formattedTime = currentDate.toTimeString().slice(0, 5);
                timeSlots.push(formattedTime);
            }

            currentDate.setMinutes(currentDate.getMinutes() + 30);
        }

        return timeSlots;
    };

    const handleConfirm = async () => {
        if (!date || !timeSlot) {
            alert('Please select a date and time slot.');
            return;
        }

        const reservationData = {
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            date: `${date}T${timeSlot}`,
            numberOfPeople: people,
        };

        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });

            if (!response.ok) {
                throw new Error('Failed to create reservation');
            }

            alert('Reservation confirmed');
            onReservationMade(); // Notify parent component that reservation was made
            onClose(); // Close the modal after successful reservation
        } catch (error) {
            console.error("Error adding reservation: ", error);
            alert("Failed to create reservation. Please try again.");
        }
    };

    const handlePeopleChange = (e) => {
        const value = e.target.value;
        
        // Allow empty input for typing
        if (value === '') {
            setPeople('');
            return;
        }

        // Convert to number
        const numValue = parseInt(value, 10);

        // Only update if it's a valid number
        if (!isNaN(numValue)) {
            // Allow any number to be typed, but enforce limits on blur
            setPeople(numValue);
        }
    };

    const handlePeopleBlur = () => {
        // When the input loses focus, enforce the min/max limits
        if (people === '' || people < 1) {
            setPeople(1);
        } else if (people > 8) {
            setPeople(8);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <div style={styles.yellowBox}>
                    <h1>Reservation for {restaurant.name}</h1>
                </div>

                <label htmlFor="date" style={styles.label}>Select Date:</label>
                <input
                    type="date"
                    id="date"
                    name="date"
                    style={styles.input}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <label htmlFor="time-slot" style={styles.label}>Select Time Slot:</label>
                <select
                    id="time-slot"
                    name="time-slot"
                    style={styles.input.time}
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    disabled={!date}
                >
                    <option value="">Select a time slot</option>
                    {availableTimeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                    ))}
                </select>

                <label htmlFor="people" style={styles.label}>Number of People:</label>
                <input
                    type="number"
                    id="people"
                    name="people"
                    min="1"
                    max="8"
                    style={styles.input}
                    value={people}
                    onChange={handlePeopleChange}
                    onBlur={handlePeopleBlur}
                />

                <button onClick={handleConfirm} style={styles.button} disabled={!date || !timeSlot}>
                    Confirm Reservation
                </button>

                <button onClick={onClose} style={styles.button}>Close</button>
            </div>
        </div>
    );
};

export default ReservationPage;