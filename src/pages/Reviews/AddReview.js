import React, {useContext, useState} from "react";
import {auth} from "../../firebase";
import {UserContext} from "../../utils/userContext";
import "./Reviews.css"
import LoadModal from "../../components/LoadModal/LoadModal";

export function AddReview({restaurantID, mealID, onReviewAdded}) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);

    const {user} = useContext(UserContext);


    const addReview = async () => {
        setLoading(true);
        if (!rating) {
            alert('Please select a rating');
            return;
        }

        const user_id = auth.currentUser.uid;
        const reviewData = {
            rating: rating,
            review: review
        };

        try {
            const idToken = await auth.currentUser.getIdToken();
            let url;
            if (mealID) {
                url = `/restaurant/${restaurantID}/mealReview/${mealID}/${user_id}`;
            } else {
                url = `/restaurant/${restaurantID}/restaurantReview/${user_id}`;
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL}/${url}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(reviewData)
            });

            if (!response.ok) {
                throw new Error('Failed to add review');
            }

            const result = await response.json();
            console.log('Review added successfully:', result);
            alert('Review added successfully');
            // Handle successful review submission (e.g., close modal, refresh reviews)
            onReviewAdded();
        } catch (error) {
            console.error('Error adding review:', error);
            alert('Failed to add review. Please try again.');
        }
        setTimeout(() => setLoading(false), 200);
    };


    const handleStarClick = (starRating) => {
        setRating(starRating);
    };

    return (
        <>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            />
            <LoadModal loading={loading}/>

            <article id={"add_review_page"}>
                <header className={"header2"} id="reviews_header">
                    <h2 className={"centre_no_margin"}>Review {mealID ? "Meal" : "Restaurant"}</h2>
                    <img src="" alt={"Restaurant logo."}/>
                </header>
                <section id="add_review_section">
                    <section id="add_rating_section">
                        <section id="rating_and_date_section">
                            <h3>Rating</h3>
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                    <span
                                        key={starValue}
                                        className={`material-symbols-outlined text-3xl cursor-pointer transition-all duration-150 ${
                                            starValue <= rating ? 'star-filled' : 'star-outlined'
                                        }`}
                                        onClick={() => handleStarClick(starValue)}
                                        style={{
                                            fontVariationSettings: starValue <= rating
                                                ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48"
                                                : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48"
                                        }}
                                    >
                                    star
                                </span>
                                ))}
                            </div>
                        </section>
                    </section>
                    <section id="add_review_text_section">
                        <h3 id="review_text_heading">Review</h3>
                        <textarea
                            id={"review_text_input"}
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Enter a review"
                        />
                    </section>
                    <button className={"menuButton"}
                            type="button"
                            onClick={addReview}
                            id="confirm_button"
                    >
                        Confirm
                    </button>
                </section>
            </article>
        </>
    );
}