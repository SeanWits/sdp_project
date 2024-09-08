import React from 'react';
import './OrderCard.css';

const OrderCard = ({ order }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'preparing':
        return 'status-preparing';
      case 'collected':
        return 'status-collected';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const handleReceiptClick = () => {
    // Implement receipt viewing logic here
    console.log('View receipt for order:', order.id);
  };

  return (
    <article className="order-card">
      <div className="order-image">
        {/* Placeholder for restaurant image */}
        <div className="image-placeholder"></div>
      </div>
      <div className="order-details">
        <h2 className="restaurant-name">{order.restaurantName}</h2>
        <div className="order-info-container">
          <p className="order-info">
            {order.itemCount} items, Purchased on: {order.orderDate}
          </p>
          <button className="receipt-button" onClick={handleReceiptClick}>
            View receipt
          </button>
        </div>
        <ul className="order-items">
          {order.items.map(item => (
            <li key={item.id} className="order-item">
              <span className="item-quantity">{item.quantity}</span>
              <span className="item-name">{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="order-summary">
        <p className="order-price">R{order.totalPrice.toFixed(2)}</p>
        <p className={`order-status ${getStatusClass(order.status)}`}>
          {order.status}
        </p>
      </div>
    </article>
  );
};

export default OrderCard;