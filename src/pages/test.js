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
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUG2xUv3otxw9DpNAXfX8yqrHEFXkM6bPXJQ&s"
                },
                {
                  "name": "FALAFEL",
                  "description": "hummus, gherkin, lettuce, tomato, sweet chilli sauce",
                  "price": 65.00,
                  "is_available": true,
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa7RVmQ3YVU686d4u_uDv80fnXTY4uu_vnYA&s"
                },
                {
                  "name": "CRUMBED CHICKEN",
                  "description": "honey mustard dressing, lettuce",
                  "price": 60.00,
                  "is_available": true,
                  "image_url": "https://sailorbailey.com/wp-content/uploads/2023/01/Crispy-Chicken-WrapsKey.jpg"
                },
                {
                  "name": "CAJUN CHICKEN",
                  "description": "avo, cheddar cheese, honey mustard, lettuce",
                  "price": 60.00,
                  "is_available": true,
                  "image_url": "https://sweetpeasandsaffron.com/wp-content/uploads/2019/02/cajun-chicken-wraps-6.jpg"
                },
                {
                  "name": "GREEK CHICKEN",
                  "description": "oregano chicken, avo, feta, lettuce, honey mustard",
                  "price": 60.00,
                  "is_available": true,
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvPQHWRt8dcNK5LmkSA_pYPHXNrsazqeHdpQ&s"
                },
                {
                  "name": "BBQ STEAK",
                  "description": "cheddar cheese, gherkins, lettuce, tomato",
                  "price": 70.00,
                  "is_available": true,
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEJV_pIjDoI_69jEUJKlHdLVdPXqJfRpNXug&s"
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
                  "image_url": "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chopped-green-salad-with-herby-chilli-dressing-429ab82.jpg?quality=90&webp=true&resize=300,272"
                },
                {
                  "name": "GREEK SALAD",
                  "description": "green salad with feta cheese & olives",
                  "price": 70.00,
                  "is_available": true,
                  "image_url": "https://www.thehungrybites.com/wp-content/uploads/2017/07/Authentic-Greek-salad-horiatiki-2.jpg"
                },
                {
                  "name": "CHICKEN SALAD",
                  "description": "cajun or greek chicken with mixed greens",
                  "price": 70.00,
                  "is_available": true,
                  "image_url": "https://hips.hearstapps.com/hmg-prod/images/grilled-chicken-salad-index-6628169554c88.jpg?crop=0.8890484453220048xw:1xh;center,top&resize=1200:*"
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
                  "image_url": "https://pavaotogo.com/wp-content/uploads/2022/06/J17-Pavao-Grilled-Chicken-Breast.jpg"
                },
                {
                  "name": "200G CHICKEN STRIPS & CHIPS",
                  "description": "with sweet chilli/honey mustard dressing",
                  "price": 85.00,
                  "is_available": true,
                  "image_url": "https://timeoutcafe.co.za/cdn/shop/products/ChickenStrips1_f4d033d5-f163-40ab-876c-43eaa9d388a8.jpg?v=1665391368"
                }
              ]
            },
            {
              "name": "Pizzas",
              "menu_items": [
                {
                  "name": "FOCACCIA BREAD",
                  "description": "garlic & herbs",
                  "price": 35.00,
                  "is_available": true,
                  "image_url": "https://www.themediterraneandish.com/wp-content/uploads/2022/10/focaccia-recipe-11.jpg"
                },
                {
                  "name": "CHEESY FOCACCIA",
                  "description": "mozzarella cheese, garlic & herbs",
                  "price": 55.00,
                  "is_available": true,
                  "image_url": "https://staticcookist.akamaized.net/wp-content/uploads/sites/22/2023/07/cheese-focaccia.jpg"
                },
                {
                  "name": "MARGARITA",
                  "description": "cheese & tomato",
                  "price": 65.00,
                  "is_available": true,
                  "image_url": "https://cdn.loveandlemons.com/wp-content/uploads/2023/07/margherita-pizza.jpg"
                },
                {
                  "name": "VEGETARIAN",
                  "description": "mushrooms, olives, green peppers",
                  "price": 80.00,
                  "is_available": true,
                  "image_url": "https://www.orchidsandsweettea.com/wp-content/uploads/2019/05/Veggie-Pizza-2-of-5-e1691215701129.jpg"
                },
                {
                  "name": "REGINA",
                  "description": "ham & mushroom",
                  "price": 75.00,
                  "is_available": true,
                  "image_url": "https://media-cdn.tripadvisor.com/media/photo-s/11/9a/19/87/regina-pizza.jpg"
                },
                {
                  "name": "PEPPERONI",
                  "description": "",
                  "price": 80.00,
                  "is_available": true,
                  "image_url": "https://www.phantomgourmet.com/wp-content/uploads/2019/07/frame_118191-1778x1000.jpg"
                },
                {
                  "name": "CON POLLO",
                  "description": "chicken, green peppers, onions & chilli",
                  "price": 80.00,
                  "is_available": true,
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Yy0lim6sRQ4nMrYmzMYZCtbN4qUltO4vOQ&s"
                },
                {
                  "name": "CHICKEN MAYO",
                  "description": "",
                  "price": 80.00,
                  "is_available": true,
                  "image_url": "https://cdn.romanspizza.co.za/images/root/v2/pizza/ravenous/pizza-chickmayofeta-pan.png"
                },
                {
                  "name": "MEXICAN",
                  "description": "mince, green peppers & chilli",
                  "price": 90.00,
                  "is_available": true,
                  "image_url": "https://tastesbetterfromscratch.com/wp-content/uploads/2019/07/Mexican-Pizza-Thumbnail-11.jpg"
                },
                {
                  "name": "BBQ CHICKEN",
                  "description": "chicken, bbq sauce, mushroom, green peppers",
                  "price": 90.00,
                  "is_available": true,
                  "image_url": "https://www.tasteandtellblog.com/wp-content/uploads/2021/01/BBQ-Chicken-Pizza-1.jpg"
                },
                {
                  "name": "MEATY",
                  "description": "pepperoni, bacon, ham",
                  "price": 105.00,
                  "is_available": true,
                  "image_url": "https://www.schlotzskys.com/-/media/schlotzskys/menu/pizza/meaty_pizza_1200x800.jpg?v=1&d=20220823T063727Z"
                },
                {
                  "name": "ROMA",
                  "description": "bacon, avo & feta",
                  "price": 115.00,
                  "is_available": true,
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTryhx2fbFwe1dz5YMSbmQ2JUqGAHZTD3UKpg&s"
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
                  "image_url": "https://norecipes.com/wp-content/uploads/2020/10/spaghetti-napolitan-003-1200x1799.jpg"
                },
                {
                  "name": "ARABIATTA",
                  "description": "tomato and herb sauce with chilli",
                  "price": 50.00,
                  "is_available": true,
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjFaJEhRdYX89MuZ23K217Cd3dlx94Wyth2w&s"
                },
                {
                  "name": "CREAMY MUSHROOM",
                  "description": "",
                  "price": 70.00,
                  "is_available": true,
                  "image_url": "https://www.saltandlavender.com/wp-content/uploads/2018/10/creamy-mushroom-pasta-recipe-8.jpg"
                },
                {
                  "name": "PESTO PASTA",
                  "description": "basil pesto and cherry tomatoes",
                  "price": 65.00,
                  "is_available": true,
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHrv4vK03K9QsEhezKBkRyxGI4wbpdhw2qRQ&s"
                },
                {
                  "name": "ARABIATTA CHICKEN",
                  "description": "tomato and herb sauce with chicken and chilli",
                  "price": 65.00,
                  "is_available": true,
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdtYAtL_YkprSrTW5M7R6DyrmHxOmXdXiTcw&s"
                },
                {
                  "name": "CREAMY CHICKEN PESTO",
                  "description": "creamy basil pesto and chicken",
                  "price": 75.00,
                  "is_available": true,
                  "image_url": "https://www.budgetbytes.com/wp-content/uploads/2019/10/Creamy-Pesto-Chicken-Pasta-close-plate.jpg"
                },
                {
                  "name": "CREAMY CHICKEN",
                  "description": "and mushrooms in a herb creamy sauce",
                  "price": 75.00,
                  "is_available": true,
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA11NRYpEIqH06Mz1CgJVdJo8I2m3P8uQ7gw&s"
                },
                {
                  "name": "AMATRICIANNI",
                  "description": "tomato, chilli and bacon",
                  "price": 65.00,
                  "is_available": true,
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK9-3ib_gqGi5Won0YMp7--FfShM7MIdC-3g&s"
                },
                {
                  "name": "ALFREDO",
                  "description": "ham and muchroom in a creamy sauce",
                  "price": 73.00,
                  "is_available": true,
                  "image_url": "https://www.allrecipes.com/thmb/9aWCdbfttLcsW2dFQWwVQBGJM3E=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-236973-CreamyAlfredoSauce-0238-4x3-1-01e7091f47ae452d991abe32cbed5921.jpg"
                },
                {
                  "name": "BOLOGNAISE",
                  "description": "tomato sauce with beef mince",
                  "price": 80.00,
                  "is_available": true,
                  "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHe0jF12JOMJBRdv93DiE83F59KRjPM6jlHQ&s"
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