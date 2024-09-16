import "./menu2.css";
import restaurantData from "./restaurant.json";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

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
  }, [restaurantId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!restaurant) return <div>No restaurant data available</div>;

  return (
    <div className="menu-container">
      <header className="menuHeader">
         <Link to="/" className="back-arrow">&#8592;</Link>
        {restaurant.name}
      </header>
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
        <h1>{selectedCategory.name}</h1>
        <p>{selectedCategory.description || `Delicious ${selectedCategory.name} options`}</p>
      </section>

      <article className="food-grid">
        {selectedCategory.menu_items.map((item) => (
          <Link 
            to={`/menu3/${item.name}`} 
            state={{ item }} 
            key={item.name}
          >
            <section className="food-item">
              <section className="foodDetails">
                <h3>{item.name}</h3>
                <p className="description">{item.description}</p>
                <p>Price: R{item.price.toFixed(2)}</p>
                <p>{item.is_available ? "Available" : "Out of stock"}</p>
              </section>
              <section className="foodPics">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="food-image" />
                )}
              </section>
            </section>
          </Link>
        ))}
      </article>
    </div>
  );
}

export default Menu2;