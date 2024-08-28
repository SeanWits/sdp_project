import logo from './logo.svg';
import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Menu from "./pages/menu";

export const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);

    return (
        <UserContext.Provider value={user}>
            <Router>
                <Routes>
                    
                    <Route path="/menu" element={<Menu />} />
                    
                </Routes>
            </Router>
        </UserContext.Provider>
    );

}

export default App;
