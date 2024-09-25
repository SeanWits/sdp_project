import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import "./App.css";
import firebase from "firebase/compat/app";
// Required for side-effects
import "firebase/firestore";
import Checkout from "./pages/Checkout/Checkout";
import Orders from "./pages/Orders/Orders";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Restaurant from "./pages/Restaurant/Restaurant";
import Menu from "./pages/Menu/Menu";
import Meal from "./pages/Meal/Meal";
import MenuInfo from "./pages/MenuInfo/MenuInfo";
import Dashboard from "./pages/Dashboard/Dashboard";

import {UserProvider} from "./utils/userContext";

function App() {
    return (
        <UserProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Restaurant/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/checkout" element={<Checkout/>}/>
                        <Route path="/orders" element={<Orders/>}/>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/menu/:restaurantId" element={<Menu/>}/>
                        <Route
                            path="/menu/:restaurantId/:itemName"
                            element={<Meal/>}
                        />
                        <Route
                            path="/restaurant-info/:id"
                            element={<MenuInfo/>}
                        />
                    </Routes>
                </div>
            </Router>
        </UserProvider>
    );
}

export default App;
