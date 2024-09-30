import {useContext, useState} from "react";
import {db, doc, updateDoc, serverTimestamp} from "../../firebase";
import {arrayRemove, runTransaction, arrayUnion, Timestamp} from "firebase/firestore";
import {UserContext} from "../../utils/userContext";
import "./Reviews.css"

export function AddReview({restaurantID, mealID}) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");

    const {user} = useContext(UserContext);

    const addReview = async () => {
        if (!user) {
            console.error("User not signed in");
            return;
        }

        const reviewData = {
            user_id: user.uid,
            rating: rating,
            review: review,
            dateCreated: Timestamp.now() // Use Timestamp.now() instead of serverTimestamp()
        };

        try {
            const restaurantRef = doc(db, `restaurants/${restaurantID}`);

            if (!mealID) {
                // Restaurant review
                await runTransaction(db, async (transaction) => {
                    const restaurantDoc = await transaction.get(restaurantRef);
                    if (!restaurantDoc.exists()) {
                        throw "Restaurant document does not exist!";
                    }

                    const reviews = restaurantDoc.data().reviews || [];
                    const updatedReviews = reviews.filter(r => r.user_id !== user.uid);
                    updatedReviews.push(reviewData);

                    transaction.update(restaurantRef, {reviews: updatedReviews});
                });
            } else {
                // Meal review
                await runTransaction(db, async (transaction) => {
                    const restaurantDoc = await transaction.get(restaurantRef);
                    if (!restaurantDoc.exists()) {
                        throw "Restaurant document does not exist!";
                    }

                    const restaurantData = restaurantDoc.data();
                    let categories = restaurantData.categories || [];
                    let updated = false;

                    for (let category of categories) {
                        let menuItems = category.menu_items || [];
                        for (let item of menuItems) {
                            if (item.id === mealID) {
                                let reviews = item.reviews || [];
                                // Remove existing review by this user, if any
                                reviews = reviews.filter(r => r.user_id !== user.uid);
                                // Add the new review
                                reviews.push(reviewData);
                                item.reviews = reviews;
                                updated = true;
                                break;
                            }
                        }
                        if (updated) break;
                    }

                    if (!updated) {
                        throw "Meal not found in the restaurant's menu!";
                    }

                    transaction.update(restaurantRef, {categories: categories});
                });
            }

            alert(`${mealID ? "Meal" : "Restaurant"} review added successfully`);
            // Reset form fields
            setRating(0);
            setReview("");
        } catch (error) {
            console.error("Error adding review: ", error);
        }
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