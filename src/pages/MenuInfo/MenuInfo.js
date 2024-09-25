import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import "./MenuInfo.css";
import {db} from '../../firebase';
import {doc, getDoc} from 'firebase/firestore';
import Popup from "../../components/Popup/Popup";
import {AddReview} from "../Reviews/AddReview";
import {Reviews} from "../Reviews/Reviews";

function MenuInfo() {
  const { id } = useParams();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState(location.state?.restaurant || null);
  const [loading, setLoading] = useState(!restaurant);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurant) {
        try {
          const restaurantDoc = await getDoc(doc(db, 'restaurants', id));
          if (restaurantDoc.exists()) {
            setRestaurant({ id: restaurantDoc.id, ...restaurantDoc.data() });
          } else {
            setError("Restaurant not found");
          }
        } catch (err) {
          console.error("Error fetching restaurant:", err);
          setError("Failed to load restaurant data");
        }
        setLoading(false);
      }
    };
    //pop up
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const togglePopup = () => {
        setIsPopupOpen((prev) => !prev);
    };

    useEffect(() => {
        const fetchRestaurant = async () => {
            if (!restaurant) {
                try {
                    const restaurantDoc = await getDoc(doc(db, 'restaurants', id));
                    if (restaurantDoc.exists()) {
                        setRestaurant({id: restaurantDoc.id, ...restaurantDoc.data()});
                    } else {
                        setError("Restaurant not found");
                    }
                } catch (err) {
                    console.error("Error fetching restaurant:", err);
                    setError("Failed to load restaurant data");
                }
                setLoading(false);
            }
        };

    fetchRestaurant();
  }, [id, restaurant]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!restaurant) return <div>No restaurant data available</div>;

  return (
    <div className="restaurant-info">
      <header className="menuHeader">
        <Link to="/" className="back-arrow">&#8592;</Link>
        {restaurant.name}
      </header>

      <section className="resDeets">
        <section id="reviews">
          <section id="reviewsReviews">
            <h2>Restaurant Details</h2>
          </section>

          <section id="reviewsRating">
            <article id="nameRes">
              <ul>
                <li>Name: {restaurant.name}</li>
                <li>Location: {restaurant.location}</li>
                <li>Operating Hours: {restaurant.opening_time} - {restaurant.closing_time}</li>
                <li>Contact details: {restaurant.contact_details || 'N/A'}</li>
                <li>Telephone: {restaurant.telephone || 'N/A'}</li>
                <li>Email: {restaurant.email || 'N/A'}</li>
                <li>Rating: {restaurant.rating || 'N/A'}</li>
              </ul>
            </article>
            <article>
              {restaurant.restImg && (
                <img src={restaurant.restImg} alt={restaurant.name} />
              )}
            </article>
          </section>
        </section>
      </section>

            <button onClick={togglePopup} className="menuButton" id="menuInfoButton">
                Click For Review
            </button>
            <Popup isOpen={isPopupOpen} onClose={togglePopup}>
                <Reviews restaurantID={restaurant.id}/>
            </Popup>
        </div>
    );
}

export default MenuInfo;