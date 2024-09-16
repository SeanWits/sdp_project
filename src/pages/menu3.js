import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "./menu3.css";

function Menu3() {
  const location = useLocation();
  const { itemName } = useParams();
  const item = location.state?.item;

  if (!item) {
    return <div>Error: Item not found</div>;
  }

  return (
    <div className="restaurant-list">
      <header className="menuHeader">
        <Link to={-1} className="back-arrow">&#8592;</Link>
        Restaurant/Dining Hall Name
      </header>
      <h1>{item.name}</h1>
      <div className="separator-line"></div>
      <section id="mainThing">
        <article>
          <div className="menu3DivBox" id="longerThings">
            {item.description}
          </div>
        </article>
        <article>
          <div className="menu3DivBox">Customise order</div>
          Total: R{item.price.toFixed(2)} <button className="menuButton">Add to cart</button>
        </article>
      </section>
      <div className="separator-line"></div>

      <button className="menuButton" id="menuInfoButton">
        Click For Review
      </button>
    </div>
  );
}

export default Menu3;