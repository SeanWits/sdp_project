import React from 'react';
import OrderCard from '../../components/OrderCard/OrderCard';
import './Orders.css';

const ordersData = [
  {
    id: 1,
    restaurantName: "Jimmy's",
    itemCount: 4,
    orderDate: "August 17, 2024 @ 15:27",
    items: [
      { id: 1, name: "item 1", quantity: 3 },
      { id: 2, name: "item 2", quantity: 1 },
    //   { id: 3, name: "item 3", quantity: 1 },
    //   { id: 4, name: "item 4", quantity: 1 },
    //   { id: 5, name: "item 5", quantity: 1 },
    //   { id: 6, name: "item 6", quantity: 1 }
    ],
    totalPrice: 12.99,
    status: "Preparing"
  },
  {
    id: 2,
    restaurantName: "Zesty Lemons",
    itemCount: 2,
    orderDate: "August 17, 2024 @ 15:27",
    items: [
      { id: 1, name: "item 1", quantity: 1 },
      { id: 2, name: "item 2", quantity: 1 }
    ],
    totalPrice: 89.99,
    status: "Collected"
  },
  {
    id: 3,
    restaurantName: "Chinese Lantern",
    itemCount: 4,
    orderDate: "August 17, 2024 @ 15:27",
    items: [
      { id: 1, name: "item 1", quantity: 2 },
      { id: 2, name: "item 2", quantity: 2 }
    ],
    totalPrice: 72.99,
    status: "Collected"
  },
  {
    id: 4,
    restaurantName: "Jimmy's",
    itemCount: 4,
    orderDate: "August 17, 2024 @ 15:27",
    items: [
      { id: 1, name: "item 1", quantity: 3 },
      { id: 2, name: "item 2", quantity: 1 }
    ],
    totalPrice: 18.99,
    status: "Collected"
  },
  {
    id: 5,
    restaurantName: "Jimmy's",
    itemCount: 4,
    orderDate: "August 17, 2024 @ 15:27",
    items: [
      { id: 1, name: "item 1", quantity: 3 },
      { id: 2, name: "item 2", quantity: 1 }
    ],
    totalPrice: 48.99,
    status: "Cancelled"
  }
];

const Orders = () => {
  return (
    <div className="orders-container">
      <h1 className="orders-title">Orders</h1>
      <div className="order-list">
        {ordersData.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default Orders;