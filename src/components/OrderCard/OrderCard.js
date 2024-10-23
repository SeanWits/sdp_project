import React, {useState} from 'react';
import './OrderCard.css';

const OrderCard = ({order, onStatusUpdate}) => {
    const [showStatusOptions, setShowStatusOptions] = useState(false);

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'ongoing':
                return 'status-ongoing';
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

    const formatDate = (date) => {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleStatusClick = () => {
        setShowStatusOptions(!showStatusOptions);
    };

    const handleStatusUpdate = (newStatus) => {
        onStatusUpdate(order.id, newStatus);
        setShowStatusOptions(false);
    };

    return (
        <article className="order-card">
            <div className="order-image">
                {order.restaurantDetails.restImg ? (
                    <img src={order.restaurantDetails.restImg} alt={order.restaurantDetails.name}
                         className="restaurant-image"/>
                ) : (
                    <div className="image-placeholder" data-testid="image-placeholder">?</div>
                )}
            </div>
            <div className="order-details">
                <h2 className="restaurant-name">{order.restaurantDetails.name || 'Unknown Restaurant'}</h2>
                <div className="order-info-container">
                    <p className="order-info">
                        {order.items.length} items, Purchased on: {formatDate(order.createdAt)}
                    </p>
                    <button className="receipt-button" onClick={handleReceiptClick}>
                        View receipt
                    </button>
                </div>
                <ul className="order-items">
                    {order.items.map((item, index) => (
                        <li key={index} className="order-item">
                            <span className="item-quantity">{item.quantity}</span>
                            <span className="item-name">{item.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="order-summary">
                <p className="order-price">R{order.totalAmount.toFixed(2)}</p>
                <div className="status-container">
                    <p
                        className={`order-status ${getStatusClass(order.status)}`}
                        onClick={handleStatusClick}
                    >
                        {order.status}
                    </p>
                    {showStatusOptions && (
                        <div className="status-options">
                            <button onClick={() => handleStatusUpdate('collected')}>Collected</button>
                            <button onClick={() => handleStatusUpdate('cancelled')}>Cancel</button>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

export default OrderCard;