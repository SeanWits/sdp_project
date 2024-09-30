import "./Reviews.css";
import Popup from "./Popup/Popup";
import React, {useState, useContext, useEffect} from "react";
import {UserContext} from "../../utils/userContext";
import {AddReview} from "./AddReview";

export function Reviews({restaurantID, mealID, onRatingChanged}) {
    const [reviews, setReviews] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const {user} = useContext(UserContext);

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
                        <span className="material-symbols-outlined icon filled">
                            filter_alt
                        </span>
                        <span className="material-symbols-outlined icon filled">
                            swap_vertical_circle
                        </span>
                    </section>
                </header>
                <section id="review_section">
                    {reviews.map((review, index) => (
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
                                <p id="review_paragraph">{review.review}</p>
                            </section>
                        </div>
                    ))}
                </section>
                <Popup isOpen={isPopupOpen} onClose={togglePopup}>
                    <AddReview restaurantID={restaurantID} mealID={mealID} onReviewAdded={handleReviewAdded}/>
                </Popup>
            </article>
        </>
    );
}