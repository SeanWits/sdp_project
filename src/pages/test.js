import React, { useEffect, useState } from 'react';
import { db, doc, getDoc, setDoc, collection } from './firebase';

function Test() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userRef = doc(db, 'users', 'GUuNErry035Y9L5q5fqa');
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          setError('No such user!');
        }
      } catch (err) {
        setError('Error fetching user data: ' + err.message);
      }
    }

    async function addRestaurantsToFirestore() {
      const restaurants = [
        {
          "id": "rest001",
          "name": "Zesti Lemonz",
          "location": "West Campus",
          "opening_time": "07:00",
          "closing_time": "17:00",
          "categories": [
            {
              "name": "Breakfast",
              "menu_items": [
                {
                  "name": "Classic Pancakes",
                  "description": "Stack of fluffy pancakes served with maple syrup",
                  "price": 26.99,
                  "is_available": true
                },
                {
                  "name": "Veggie Omelette",
                  "description": "Three-egg omelette with seasonal vegetables",
                  "price": 28.99,
                  "is_available": true
                },
                {
                  "name": "French Toast",
                  "description": "Basically toast with some egg innit",
                  "price": 17.99,
                  "is_available": true
                },
                {
                  "name": "Flapjacks",
                  "description": "Flapjack, Flapjack... Come with me, we'll go and see a place called candy island...",
                  "price": 20.00,
                  "is_available": true
                }
              ]
            },
            {
              "name": "Lunch",
              "menu_items": [
                {
                  "name": "Grilled Chicken Sandwich",
                  "description": "Grilled chicken breast with lettuce, tomato, and mayo on a brioche bun",
                  "price": 29.99,
                  "is_available": true
                },
                {
                  "name": "Caesar Salad",
                  "description": "Crisp romaine lettuce, croutons, parmesan cheese, and Caesar dressing",
                  "price": 27.99,
                  "is_available": true
                }
              ]
            },
            {
              "name": "Burgers",
              "menu_items": [
                {
                  "name": "Cheese Burger",
                  "description": "Cheese burger with real meat",
                  "price": 35.99,
                  "is_available": true
                },
                {
                  "name": "Chilli Burger",
                  "description": "A burger with chillis",
                  "price": 27.99,
                  "is_available": true
                }
              ]
            }
          ]
        },
        {
          "id": "rest002",
          "name": "Olives and Plates",
          "location": "West Campus",
          "opening_time": "11:00",
          "closing_time": "22:00",
          "categories": [
            {
              "name": "Tacos",
              "menu_items": [
                {
                  "name": "Carne Asada Taco",
                  "description": "Grilled beef taco with onions and cilantro",
                  "price": 23.99,
                  "is_available": true
                },
                {
                  "name": "Veggie Taco",
                  "description": "Mixed vegetables with guacamole",
                  "price": 33.49,
                  "is_available": true
                }
              ]
            },
            {
              "name": "Sides",
              "menu_items": [
                {
                  "name": "Chips and Salsa",
                  "description": "Crispy tortilla chips with fresh salsa",
                  "price": 12.99,
                  "is_available": true
                },
                {
                  "name": "Mexican Rice",
                  "description": "Seasoned rice with vegetables",
                  "price": 41.99,
                  "is_available": true
                }
              ]
            }
          ]
        },
        {
          "id": "rest003",
          "name": "Chinese Lantern",
          "location": "The Matrix",
          "opening_time": "09:30",
          "closing_time": "20:00",
          "categories": [
            {
              "name": "Rolls",
              "menu_items": [
                {
                  "name": "California Roll",
                  "description": "Crab, avocado, and cucumber",
                  "price": 15.99,
                  "is_available": true
                },
                {
                  "name": "Spicy Tuna Roll",
                  "description": "Fresh tuna with spicy mayo",
                  "price": 26.99,
                  "is_available": true
                }
              ]
            },
            {
              "name": "Appetizers",
              "menu_items": [
                {
                  "name": "Miso Soup",
                  "description": "Traditional Japanese soup with tofu and seaweed",
                  "price": 22.99,
                  "is_available": true
                },
                {
                  "name": "Edamame",
                  "description": "Steamed soybean pods with sea salt",
                  "price": 23.99,
                  "is_available": true
                }
              ]
            }
          ]
        }
      ];

      try {
        const restaurantsCollection = collection(db, 'restaurants');
        for (const restaurant of restaurants) {
          await setDoc(doc(restaurantsCollection, restaurant.id), restaurant);
        }
        console.log('Restaurants added successfully');
      } catch (err) {
        console.error('Error adding restaurants: ', err);
        setError('Error adding restaurants: ' + err.message);
      }
    }

    fetchUserData();
    addRestaurantsToFirestore();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Data:</h2>
      <p>Name: {userData.name}</p>
      <p>Surname: {userData.surname}</p>
    </div>
  );
}

export default Test;