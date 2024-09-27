import {getDocs} from "firebase/firestore";
import {db, collection} from "../firebase";

export async function calculateAverageRating(restaurantID) {
    try {
        const reviewsRef = collection(db, `restaurants/${restaurantID}/restaurantReviews`);
        const querySnapshot = await getDocs(reviewsRef);

        let totalRating = 0;
        let numberOfReviews = 0;

        querySnapshot.forEach((doc) => {
            const reviewData = doc.data();
            if (reviewData.rating && typeof reviewData.rating === 'number') {
                totalRating += reviewData.rating;
                numberOfReviews++;
            }
        });

        if (numberOfReviews === 0) {
            return 0; // Return 0 if there are no reviews
        }

        const averageRating = totalRating / numberOfReviews;
        return Number(averageRating.toFixed(2)); // Round to two decimal place
    } catch (error) {
        console.error("Error calculating average rating:", error);
        return null; // Return null in case of an error
    }
}