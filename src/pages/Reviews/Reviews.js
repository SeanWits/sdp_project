import "./Reviews.css";
import Popup from "./Popup/Popup";
import React, {useState, useContext, useEffect} from "react";
import {UserContext} from "../../utils/userContext";
import {AddReview} from "./AddReview";
import {collection, db} from "../../firebase";
import {getDocs, where, query} from "firebase/firestore";

export function Reviews(restaurantID, mealID) {

    //get reviews from database
    const [reviews, setReviews] = useState([]);

    mealID = restaurantID.mealID;
    restaurantID = restaurantID.restaurantID;

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user) {
                console.error("User not signed in");
                return;
            }
            try {
                let reviewsRef;
                if (mealID) {
                    // If mealID is present, filter by productID
                    reviewsRef = query(
                        collection(db, `restaurants/${restaurantID}/mealReviews`),
                        where("productID", "==", mealID)
                    );
                } else {
                    reviewsRef = collection(
                        db,
                        `restaurants/${restaurantID}/restaurantReviews`
                    );
                }
                const querySnapshot = await getDocs(reviewsRef);
                const fetchedReviews = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()  //spread data in array
                }));
                setReviews(fetchedReviews);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };
        fetchReviews();
    }, [restaurantID, mealID]);


    //pop up
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    //get user id
    const {user} = useContext(UserContext);

    const togglePopup = () => {
        setIsPopupOpen((prev) => !prev);
    };

    //if user not logged in
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
            <header className="header2" id="reviews_header">
                <h2 id="h2_reviews" className="centre_no_margin">
                    Reviews
                </h2>
                <section id="reviews_icons">
                    <span
                        className="material-symbols-outlined icon filled"
                        onClick={handleAddReview}
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
                    {reviews.map((review) => (
                        <div key={review.id} className="review-item">
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
