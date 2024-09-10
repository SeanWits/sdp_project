import "./menu2.css";
import restaurantData from "./restaurant.json"; // Mock API for testing
import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useParams } from "react-router-dom";

function Menu2() {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const loadRestaurant = () => {
      try {
        const selectedRestaurant = restaurantData.find(r => r.id === restaurantId);
        
        if (selectedRestaurant) {
          setRestaurant(selectedRestaurant);
          setSelectedCategory(selectedRestaurant.categories[0]);
          setLoading(false);
        } else {
          setError("Restaurant not found");
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to load restaurant data");
        setLoading(false);
      }
    };

    loadRestaurant();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!restaurant) return <div>No restaurant data available</div>;

  return (
    <div className="menu-container">
      <header className="menuHeader">{restaurant.name}</header>
      {/* Row for displaying categories */}
      <section className="categories-row">
        {restaurant.categories.map((category) => (
          <section
            key={category.name}
            className={`category-item ${
              selectedCategory.name === category.name ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.name}
          </section>
        ))}
      </section>
      <div className="separator-line"></div>

      <section id="menuFoodBanner">
        <h1>Food Category</h1>
        <p>Enter food category here</p>
      </section>

      {/* Displaying food items */}
      <article className="food-grid">
        {selectedCategory.menu_items.map((item) => (
          <section key={item.name} className="food-item">
            <section className="foodDetails">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>Price: R{item.price.toFixed(2)}</p>
            <p>{item.is_available ? "Available" : "Out of stock"}</p>
            </section>
            <section className="foodPics">

            </section>
          </section>
        ))}
      </article>
    </div>
  );
}

/*const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<Menu2 />);*/
export default Menu2;
