import "./Menu.css";
import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

function Menu() {
  const { restaurantId } = useParams();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState(location.state?.restaurant || null);
  const [loading, setLoading] = useState(!restaurant);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);


  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurant) {
        try {
          const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
          if (restaurantDoc.exists()) {
            const restaurantData = { id: restaurantDoc.id, ...restaurantDoc.data() };
            setRestaurant(restaurantData);
            if (restaurantData.categories && restaurantData.categories.length > 0) {
              setSelectedCategory(restaurantData.categories[0]);
            }
          } else {
            setError("Restaurant not found");
          }
        } catch (err) {
          console.error("Error fetching restaurant:", err);
          setError("Failed to load restaurant data");
        }
        setLoading(false);
      } else if (restaurant.categories && restaurant.categories.length > 0 && !selectedCategory) {
        setSelectedCategory(restaurant.categories[0]);
      }
    };

    fetchRestaurant();
  }, [restaurantId, restaurant, selectedCategory]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!restaurant) return <div>No restaurant data available</div>;
  if (!restaurant.categories || restaurant.categories.length === 0) return <div>No menu categories available</div>;

  return (
    <>
    <Header/>
    <div className="menu-container">
      <header className="menuHeader">
        <Link to="/" className="back-arrow">&#8592;</Link>
        {restaurant.name}
      </header>
      <section className="categories-row">
        {restaurant.categories.map((category) => (
          <section
            key={category.name}
            className={`category-item ${selectedCategory && selectedCategory.name === category.name ? "active" : ""
              }`}
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
            <h1>{selectedCategory.name}</h1>
            <p>{selectedCategory.description || `Delicious ${selectedCategory.name} options`}</p>
          </section>

          <article className="food-grid">
            {selectedCategory.menu_items.map((item) => (
              <Link 
                to={`/menu/${restaurantId}/${encodeURIComponent(item.name)}`} 
                state={{ item, restaurantName: restaurant.name }} 
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
        </>
      )}
    </div>
    <Footer/>
    </>
  );
}

export default Menu;