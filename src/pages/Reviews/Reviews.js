import "./Reviews.css";
import Popup from "./Popup/Popup";
import React, {useState, useContext, useEffect} from "react";
import {UserContext} from "../../utils/userContext";
import {AddReview} from "./AddReview";
import {db, doc, getDoc} from "../../firebase";

export function Reviews({restaurantID, mealID}) {
    const [reviews, setReviews] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const {user} = useContext(UserContext);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!restaurantID) {
                console.error("Restaurant ID is required");
                return;
            }
            try {
                const restaurantRef = doc(db, `restaurants/${restaurantID}`);
                const restaurantDoc = await getDoc(restaurantRef);

                if (!restaurantDoc.exists()) {
                    console.error("Restaurant not found");
                    return;
                }

                const restaurantData = restaurantDoc.data();

                if (mealID) {
                    // Fetch meal-specific reviews
                    let mealReviews = [];
                    const categories = restaurantData.categories || [];
                    for (let category of categories) {
                        const menuItems = category.menu_items || [];
                        for (let item of menuItems) {
                            if (item.id === mealID) {
                                mealReviews = item.reviews || [];
                                break;
                            }
                        }
                        if (mealReviews.length > 0) break;
                    }
                    setReviews(mealReviews);
                } else {
                    // Fetch restaurant reviews
                    setReviews(restaurantData.reviews || []);
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };
        fetchReviews();
    }, [restaurantID, mealID]);

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
                                        {review.dateCreated ? new Date(review.dateCreated.seconds * 1000).toLocaleDateString() : 'N/A'}
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
                    <AddReview restaurantID={restaurantID} mealID={mealID}/>
                </Popup>
            </article>
        </>
    );
}