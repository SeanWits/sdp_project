import "./Reviews.css";
import Popup from "./Popup/Popup";
import React, {useState, useContext, useEffect} from "react";
import {UserContext} from "../../utils/userContext";
import {AddReview} from "./AddReview";
import LoadModal from "../../components/LoadModal/LoadModal";

export function Reviews({restaurantID, mealID, onRatingChanged, onClose}) {
    const [reviews, setReviews] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const {user} = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                let url;
                if (mealID) {
                    url = `/restaurant/${restaurantID}/mealReviews/${mealID}`;
                } else {
                    url = `/restaurant/${restaurantID}/restaurantReviews`;
                }

                const response = await fetch(`${process.env.REACT_APP_API_URL}/${url}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }
                const data = await response.json();
                setReviews(data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                alert('Failed to fetch reviews');
            }
            setTimeout(() => setLoading(false), 200);
        };


        fetchReviews();

    }, [restaurantID, mealID]);

    const handleReviewAdded = () => {
        const fetchReviews = async () => {
            try {
                let url;
                if (mealID) {
                    url = `/restaurant/${restaurantID}/mealReviews/${mealID}`;
                } else {
                    url = `/restaurant/${restaurantID}/restaurantReviews`;
                }

                const response = await fetch(`${process.env.REACT_APP_API_URL}/${url}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }
                const data = await response.json();
                setReviews(data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                alert('Failed to fetch reviews');
            }
        };

        fetchReviews();
        onRatingChanged();
        togglePopup();
    };


    const togglePopup = () => {
        setIsPopupOpen((prev) => !prev);
    };

    const handleReview = () => {
        if (!user) {
            alert("Please log in to leave a review");
        } else {
            togglePopup();
        }
    };


    return (
        <>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            />
            <LoadModal loading={loading}/>
            <article id={"reviews_page"}>
                <header className="header2" id="reviews_header">
                    <h2 id="h2_reviews" className="centre_no_margin">
                        Reviews
                    </h2>
                    <section id="reviews_icons">
                        <span
                            className="material-symbols-outlined icon filled"
                            onClick={handleReview}
                        >
                            add_box
                        </span>
                        <span className="material-symbols-outlined icon filled" onClick={onClose}>
                            cancel
                        </span>
                    </section>
                </header>
                <section id="review_section">
                    {!loading ? (
                        reviews.length > 0 ? (
                            reviews.map((review, index) => (
                                <div key={index} className="review-item">
                                    <section id="rating_section">
                                        <section
                                            className="flex-direction-row"
                                            id="rating_and_date_section"
                                        >
                                            <h3 className="centre_no_margin">Rating:</h3>
                                            <p id="rating_paragraph">{review.rating}</p>
                                        </section>
                                        <section
                                            className="flex-direction-row"
                                            id="date_posted_section"
                                        >
                                            <h3 className="centre_no_margin">Date Posted:</h3>
                                            <p id="date_posted_paragraph">
                                                {review.dateCreated ? new Date(review.dateCreated._seconds * 1000).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </section>
                                    </section>
                                    <section id="review_text_section">
                                        <section id="review_text_heading_section">
                                            <h3
                                                className="centre_no_margin"
                                                id="review_text_heading"
                                            >
                                                Review
                                            </h3>
                                        </section>
                                        <p id="review_paragraph">{review.review ? (review.review) : ("None")}</p>
                                    </section>
                                </div>
                            ))
                        ) : (
                            <div className="no-reviews-message">
                                <p>No Reviews.</p>
                            </div>
                        )) : (null)
                    }
                </section>
                <Popup isOpen={isPopupOpen} onClose={togglePopup}>
                    <AddReview onClose={togglePopup} restaurantID={restaurantID} mealID={mealID}
                               onReviewAdded={handleReviewAdded}/>
                </Popup>
            </article>
        </>
    );
}