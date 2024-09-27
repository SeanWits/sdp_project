import {useContext, useState} from "react";
import {db, doc, setDoc, serverTimestamp, collection} from "../../firebase";
import {UserContext} from "../../utils/userContext";
import "./Reviews.css"

export function AddReview(restaurantID, mealID) {
    const [restaurantRating, setRestaurantRating] = useState(0);
    const [restaurantReview, setRestaurantReview] = useState("");

    const {user} = useContext(UserContext);

    mealID = restaurantID.mealID;
    restaurantID = restaurantID.restaurantID;

    const addRestaurantReview = async () => {
        if (!user) {
            console.error("User not signed in");
            return;
        }
        try {
            let reviewRef;
            if (mealID) {
                // For meal reviews, create a new document with a unique ID
                let autoID = doc(collection(db, `restaurants/${restaurantID}/mealReviews`)).id;
                reviewRef = doc(db, `restaurants/${restaurantID}/mealReviews/${autoID}`);
            } else {
                // For restaurant reviews, use the user's ID
                reviewRef = doc(db, `restaurants/${restaurantID}/restaurantReviews/${user.uid}`);
            }
            const reviewData = {
                rating: restaurantRating,
                review: restaurantReview,
                dateCreated: serverTimestamp(),
            };

            // Add user_Id and productID only if mealID is not null
            if (mealID) {
                reviewData.user_Id = user.uid;
                reviewData.productID = mealID;
            }

            await setDoc(reviewRef, reviewData);
            alert(`${mealID ? "Meal" : "Restaurant"} review added successfully`);
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
                                            starValue <= restaurantRating ? 'star-filled' : 'star-outlined'
                                        }`}
                                        onClick={() => handleStarClick(starValue)}
                                        style={{
                                            fontVariationSettings: starValue <= restaurantRating
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
                            value={restaurantReview}
                            onChange={(e) => setRestaurantReview(e.target.value)}
                            placeholder="Enter a review"
                        />
                    </section>
                    <button className={"menuButton"}
                            type="button"
                            onClick={addRestaurantReview}
                            id="confirm_button"
                    >
                        Confirm
                    </button>
                </section>
            </article>
        </>
    );
}
