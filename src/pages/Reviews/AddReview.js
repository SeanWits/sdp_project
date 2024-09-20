export function AddReview() {
    return (
        <>
        <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
            <header id="reviews_header">
                <span class="material-symbols-outlined">arrow_back</span>
                <h2>Review Restaurant/Dining Hall</h2>
                <img src="" />
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