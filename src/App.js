import logo from './logo.svg';
import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Menu from "./pages/menu";
import Menu2 from "./pages/menu2";

export const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);

    return (
        <UserContext.Provider value={user}>
            <Router>
                <Routes>
                </Routes>
            </Router>
        </UserContext.Provider>
    );

}

export default App;
