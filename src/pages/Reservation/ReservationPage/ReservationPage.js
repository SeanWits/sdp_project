import React, {useState, useEffect, useContext} from 'react';
import {UserContext} from '../../../utils/userContext';
import {styles} from './reservationPageStyles';
import {useNavigate} from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const ReservationPage = ({restaurant, onClose, onReservationMade}) => {
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [people, setPeople] = useState(1);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [fullBookingDates, setFullBookingDates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const {user} = useContext(UserContext);
    const navigate = useNavigate();
    const db = getFirestore();

    // Fetch full booking dates when component mounts
    useEffect(() => {
        fetchFullBookings();
    }, [restaurant]);

    // Fetch full bookings from Firebase
    const fetchFullBookings = async () => {
        try {
            setIsLoading(true);
            const fullBookingsRef = collection(db, 'full_bookings');
            const q = query(
                fullBookingsRef,
                where('restaurantId', '==', restaurant.id)
            );

            const querySnapshot = await getDocs(q);
            const blockedDates = [];

            querySnapshot.forEach((doc) => {
                const bookingData = doc.data();
                // Convert Firebase timestamp to date string (YYYY-MM-DD format)
                if (bookingData.date) {
                    const dateStr = new Date(bookingData.date.seconds * 1000)
                        .toISOString()
                        .split('T')[0];
                    blockedDates.push(dateStr);
                }
            });

            setFullBookingDates(blockedDates);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching full bookings: ", error);
            alert("Failed to fetch availability. Please try again.");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.setAttribute('min', today);
            
            // Disable full booking dates
            const disableDates = (e) => {
                const selectedDate = e.target.value;
                if (fullBookingDates.includes(selectedDate)) {
                    e.preventDefault();
                    alert('This date is fully booked. Please select another date.');
                    e.target.value = '';
                    setDate('');
                }
            };
            
            dateInput.addEventListener('input', disableDates);
            return () => dateInput.removeEventListener('input', disableDates);
        }
    }, [fullBookingDates]);

    useEffect(() => {
        if (date && restaurant) {
            const slots = generateTimeSlots(restaurant.opening_time, restaurant.closing_time, date);
            setAvailableTimeSlots(slots);
            setTimeSlot('');
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

        // Check again if the date is fully booked before confirming
        if (fullBookingDates.includes(date)) {
            alert('Sorry, this date is no longer available. Please select another date.');
            setDate('');
            setTimeSlot('');
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
            onReservationMade();
            onClose();
        } catch (error) {
            console.error("Error adding reservation: ", error);
            alert("Failed to create reservation. Please try again.");
        }
    };

    const handlePeopleChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setPeople('');
            return;
        }
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setPeople(numValue);
        }
    };

    const handlePeopleBlur = () => {
        if (people === '' || people < 1) {
            setPeople(1);
        } else if (people > 8) {
            setPeople(8);
        }
    };

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        if (!fullBookingDates.includes(selectedDate)) {
            setDate(selectedDate);
        }
    };

    if (isLoading) {
        return (
            <div style={styles.pageWrapper}>
                <div style={styles.container}>
                    <div style={styles.yellowBox}>
                        <h2>Loading availability...</h2>
                    </div>
                </div>
            </div>
        );
    }

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
                    onChange={handleDateChange}
                />

                <label htmlFor="time-slot" style={styles.label}>Select Time Slot:</label>
                <select
                    id="time-slot"
                    name="time-slot"
                    style={styles.input}
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

                <button 
                    onClick={handleConfirm} 
                    style={styles.button} 
                    disabled={!date || !timeSlot}
                >
                    Confirm Reservation
                </button>

                <button onClick={onClose} style={styles.button}>Close</button>
            </div>
        </div>
    );
};

export default ReservationPage;