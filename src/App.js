import logo from './logo.svg';
import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Menu from "./pages/menu";
import Menu2 from "./pages/menu2";
import Menu3 from "./pages/menu3";
import MenuInfo from "./pages/menuInfo";
import Test from "./pages/test";

export const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);

    return (
        <UserContext.Provider value={user}>
            <Router>
                <Routes>
                    
                    <Route path="/" element={<Menu />} />
                    {/*<Route path="/menu3" element={<Menu3 />} />*/}
                    <Route path="/menu3/:itemName" element={<Menu3 />} />
                    {/*<Route path="/test" element={<Test />} />*/}
                    {/*<Route path="/menuInfo" element={<MenuInfo />} />*/}
                    <Route path="/restaurant-info/:id" element={<MenuInfo />} />
                    {/*<Route path="/menu2" element={<Menu2 />} />  Remove this */}
                    <Route path="/menu/:restaurantId" element={<Menu2 />} />
                </Routes>
            </Router>
        </UserContext.Provider>
    );

}

export default App;
