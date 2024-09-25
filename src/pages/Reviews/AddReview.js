import {useContext, useEffect, useState} from "react";
import {db, doc, setDoc, serverTimestamp} from "../../firebase";
import {UserContext} from "../../utils/userContext";
import "./Reviews.css"

export function AddReview(restaurantID, mealID) {
    const [restaurantRating, setRestaurantRating] = useState(0);
    const [restaurantReview, setRestaurantReview] = useState("");

    const {user} = useContext(UserContext);

    const addRestaurantReview = async () => {
        if (!user) {
            console.error("User not signed in");
            return;
        }
        try {
            const reviewRef = doc(
                db,
                `restaurants/${restaurantID.restaurantID}/restaurantReviews/${user.uid}`
            );
            await setDoc(reviewRef, {
                rating: restaurantRating,
                review: restaurantReview,
                dateCreated: serverTimestamp(),
            });
            console.log("Restaurant review added successfully");
            // Reset form fields
            setRestaurantRating(0);
            setRestaurantReview("");
        } catch (error) {
            console.error("Error adding restaurant review: ", error);
        }
    };

    const handleStarClick = (starRating) => {
        setRestaurantRating(starRating);
    };

    return (
        <>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            />
            <header id="reviews_header">
                <span class="material-symbols-outlined">arrow_back</span>
                <h2>Review Restaurant/Dining Hall</h2>
                <img src=""/>
            </header>
            <section id="add_review_section">
                <section id="add_rating_section">
                    <section id="rating_and_date_section">
                        <h3>Rating:</h3>
                        <span id="one_star" class="material-symbols-outlined">
                            star
                        </span>
                        <span id="two_stars" class="material-symbols-outlined">
                            star
                        </span>
                        <span
                            id="three_stars"
                            class="material-symbols-outlined"
                        >
                            star
                        </span>
                        <span id="four_stars" class="material-symbols-outlined">
                            star
                        </span>
                        <span id="five_stars" class="material-symbols-outlined">
                            star
                        </span>
                    </section>
                </section>
                <section id="add_review_text_section">
                    <h3 id="review_text_heading">Review</h3>
                    <input type="text" placeholder="Enter a review" />
                </section>
                <button type="button" id="confirm_button">
                    Confirm
                </button>
            </section>
        </>
    );
}