import "./Menu.css";
import React, {useState, useEffect} from "react";
import {useParams, Link, useLocation} from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LoadModal from "../../components/LoadModal/LoadModal";
import {NavBar} from "../../components/NavBar/NavBar";

function Menu() {
    const {restaurantId} = useParams();
    const location = useLocation();
    const [restaurant, setRestaurant] = useState(location.state?.restaurant || null);
    const [loading, setLoading] = useState(!restaurant);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            if (!restaurant) {
                try {
                    setLoading(true);
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurant/${restaurantId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch restaurant data');
                    }
                    const restaurantData = await response.json();
                    setRestaurant(restaurantData);
                    if (restaurantData.categories && restaurantData.categories.length > 0) {
                        setSelectedCategory(restaurantData.categories[0]);
                    }
                } catch (err) {
                    console.error("Error fetching restaurant:", err);
                    setError("Failed to load restaurant data");
                } finally {
                    setLoading(false);
                }
            } else if (restaurant.categories && restaurant.categories.length > 0 && !selectedCategory) {
                setSelectedCategory(restaurant.categories[0]);
            }
        };

        fetchRestaurant();
    }, [restaurantId, restaurant, selectedCategory]);

    if (error) return <div>Error: {error}</div>;
    if (!restaurant && !loading) return <div>No restaurant data available</div>;
    if (restaurant && (!restaurant.categories || restaurant.categories.length === 0)) return <div>No menu categories
        available</div>;

    return (
        <>
            <Header/>
            <LoadModal loading={loading}/>
            <div className="menu-container">
                {!loading && restaurant && (
                    <>
                        <NavBar Heading={restaurant.name} displayBackButton={true} returnTo={"/"}/>
                        <section className="categories-row">
                            {restaurant.categories.map((category) => (
                                <section
                                    key={category.name}
                                    className={`category-item ${selectedCategory && selectedCategory.name === category.name ? "active" : ""}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category.name}
                                </section>
                            ))}
                        </section>

                        {selectedCategory && (
                            <>
                                <div className="separator-line"></div>

                                <section id="menuFoodBanner">
                                    <h3>{selectedCategory.name}</h3>
                                    <p>{selectedCategory.description || `Delicious ${selectedCategory.name} options`}</p>
                                </section>

                                <article className="food-grid">
                                    {selectedCategory.menu_items.map((item) => (
                                        <Link
                                            to={`/menu/${restaurantId}/${encodeURIComponent(item.name)}`}
                                            state={{item, restaurantName: restaurant.name}}
                                            key={item.name}
                                        >
                                            <section className="food-item">
                                                <section className="foodDetails">
                                                    <h3>{item.name}</h3>
                                                    <p className="description">{item.description}</p>
                                                    <p><b>Price</b>: R{item.price.toFixed(2)}</p>
                                                    <p><b>Rating</b>: {item.rating || "No rating"}</p>
                                                    <p>
                                                        <b>Availability</b>: {item.is_available ? "In stock" : "Out of stock"}
                                                    </p>
                                                </section>
                                                <section className="foodPics">
                                                    {item.image_url && (
                                                        <img src={item.image_url} alt={item.name}
                                                             className="food-image"/>
                                                    )}
                                                </section>
                                            </section>
                                        </Link>
                                    ))}
                                </article>
                            </>
                        )}
                    </>
                )}
            </div>
            <Footer/>
        </>
    );
}

export default Menu;