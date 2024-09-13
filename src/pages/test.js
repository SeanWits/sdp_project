import React, { useEffect, useState } from 'react';
import { db, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, setDoc } from '../firebase';

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
                  "name": "HEALTH BREAKFAST",
                  "description": "fruit salad, yoghurt, granola crunch",
                  "price": 66.00,
                  "is_available": true,
                  "image_url": "https://thumbor.forbes.com/thumbor/fit-in/900x510/https://www.forbes.com/health/wp-content/uploads/2023/10/Healthy-Breakfast-Ideas-6-Foods-To-Start-Your-Day-Ft-Image.jpg"
                },
                {
                  "name": "VEGAN BREAKFAST",
                  "description": "2 hash browns, avo*, mushrooms, grilled tomato",
                  "price": 75.00,
                  "is_available": true,
                  "image_url": "https://vancouverwithlove.com/wp-content/uploads/2017/06/IMG_7550.jpg.webp"
                },
                {
                  "name": "MINI GREEN BREAKFAST",
                  "description": "2 eggs, halloumi cheese / avo*, grilled tomato",
                  "price": 67.00,
                  "is_available": true,
                  "image_url": "https://mytastycurry.com/wp-content/uploads/2019/03/moong-dal-pancakes.jpg"
                },
                {
                  "name": "CREAMY OATS",
                  "description": "with toasted almond flakes & cinnamon",
                  "price": 50.00,
                  "is_available": true,
                  "image_url": "https://minimalistbaker.com/wp-content/uploads/2020/09/Instant-Pot-ROLLED-OATS-Perfect-tender-creamy-FAST-instantpot-plantbased-howto-oats-recipe-minimalistbaker-8.jpg"
                },
                {
                  "name": "MINI BREAKFAST",
                  "description": "1 egg, 2 rashers bacon, grilled tomato, toast",
                  "price": 44.00,
                  "is_available": true,
                  "image_url": "https://static.oakhousefoods.co.uk/media/catalog/product/cache/336111bc363ebdc007831e2145326566/8/5/850_10.jpg"
                },
                {
                  "name": "ENGLISH BREAKFAST",
                  "description": "2 eggs, 3 rashers bacon, grilled tomato, toast",
                  "price": 60.00,
                  "is_available": true,
                  "image_url": "https://iamafoodblog.b-cdn.net/wp-content/uploads/2019/02/full-english-7355w-2-1024x683.webp"
                },
                {
                  "name": "BREAKFAST BURRITO",
                  "description": "scrambled eggs, cheese, bacon/mushrooms",
                  "price": 60.00,
                  "is_available": true,
                  "image_url": "https://emilybites.com/wp-content/uploads/2021/06/Turkey-Sausage-Breakfast-Burritos-5b.jpg"
                },
                {
                  "name": "BREAKFAST ROLL",
                  "description": "bacon, egg, cheese",
                  "price": 60.00,
                  "is_available": true,
                  "image_url": "http://www.thegalaxyspace.co.za/wp-content/uploads/2024/02/Breakfast-roll.jpg"
                },
                {
                  "name": "BACON & EGG ROLL",
                  "description": "",
                  "price": 38.00,
                  "is_available": true,
                  "image_url": "https://www.ericlyons.co.uk/wp-content/uploads/2023/05/bacon-bun-e1683296440691-1536x825.jpeg"
                }
                
              ]
            },
            {
              "name": "Wraps",
              "menu_items": [
                {
                  "name": "HALLOUMI",
                  "description": "lettuce, cucumber, sweet chilli sauce",
                  "price": 65.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "FALAFEL",
                  "description": "hummus, gherkin, lettuce, tomato, sweet chilli sauce",
                  "price": 65.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "CRUMBED CHICKEN",
                  "description": "honey mustard dressing, lettuce",
                  "price": 60.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "CAJUN CHICKEN",
                  "description": "avo, cheddar cheese, honey mustard, lettuce",
                  "price": 60.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "GREEK CHICKEN",
                  "description": "oregano chicken, avo, feta, lettuce, honey mustard",
                  "price": 60.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "BBQ STEAK",
                  "description": "cheddar cheese, gherkins, lettuce, tomato",
                  "price": 70.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                }
              ]
            },
            {
              "name": "Salads",
              "menu_items": [
                {
                  "name": "GREEN SALAD",
                  "description": "mixed greens, tomato, cucumber, onion",
                  "price": 45.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "GREEK SALAD",
                  "description": "green salad with feta cheese & olives",
                  "price": 70.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "CHICKEN SALAD",
                  "description": "cajun or greek chicken with mixed greens",
                  "price": 70.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                }
              ]
            },
            {
              "name": "Light Meals",
              "menu_items": [
                {
                  "name": "CHICKEN BREAST & SIDE GREEN SALAD",
                  "description": "two chicken breasts",
                  "price": 70.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "200G CHICKEN STRIPS & CHIPS",
                  "description": "with sweet chilli/honey mustard dressing",
                  "price": 85.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                }
              ]
            },
            {
              "name": "Pizzas",
              "menu_items": [
                {
                  "name": "FOCACCIA BREAS",
                  "description": "garlic & herbs",
                  "price": 35.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "CHEESY FOCACCIA",
                  "description": "mozzarella cheese, garlic & herbs",
                  "price": 55.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "MARGARITA",
                  "description": "cheese & tomato",
                  "price": 65.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "VEGETARIAN",
                  "description": "mushrooms, olives, green peppers",
                  "price": 80.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "REGINA",
                  "description": "ham & mushroom",
                  "price": 75.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "PEPPERONI",
                  "description": "",
                  "price": 80.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "CON POLLO",
                  "description": "chicken, green peppers, onions & chilli",
                  "price": 80.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "CHICKEN MAYO",
                  "description": "",
                  "price": 80.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "MEXICAN",
                  "description": "mince, green peppers & chilli",
                  "price": 90.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "BBQ CHICKEN",
                  "description": "chicken, bbq sauce, mushroom, green peppers",
                  "price": 90.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "MEATY",
                  "description": "pepperoni, bacon, ham",
                  "price": 105.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "ROMA",
                  "description": "bacon, avo & feta",
                  "price": 115.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                }
      
              ]
            },
            {
              "name": "Pastas",
              "menu_items": [
                {
                  "name": "NEAPOLITAN",
                  "description": "tomato and herb sauce",
                  "price": 45.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "ARABIATTA",
                  "description": "tomato and herb sauce with chilli",
                  "price": 50.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "CREAMY MUSHROOM",
                  "description": "",
                  "price": 70.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "PESTO PASTA",
                  "description": "basil pesto and cherry tomatoes",
                  "price": 65.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "ARABIATTA CHICKEN",
                  "description": "tomato and herb sauce with chicken and chilli",
                  "price": 65.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "CREAMY CHICKEN PESTO",
                  "description": "creamy basil pesto and chicken",
                  "price": 75.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "CREAMY CHICKEN",
                  "description": "and mushrooms in a herb creamy sauce",
                  "price": 75.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "AMATRICIANNI",
                  "description": "tomato, chilli and bacon",
                  "price": 65.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "ALFREDO",
                  "description": "ham and muchroom in a creamy sauce",
                  "price": 73.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
                },
                {
                  "name": "BOLOGNAISE",
                  "description": "tomato sauce with beef mince",
                  "price": 80.00,
                  "is_available": true,
                  "image_url": "https://www.catschool.co/wp-content/uploads/2023/06/orange-tabby-kitten.png"
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