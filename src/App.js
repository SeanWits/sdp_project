import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Menu from "./pages/menu";
import Menu2 from "./pages/menu2";
import Menu3 from "./pages/menu3";
import MenuInfo from "./pages/menuInfo";
import Test from "./pages/Test";

export const UserContext = createContext(null);
import firebase from "firebase/compat/app";
// Required for side-effects
import "firebase/firestore";
import Restaurant from './pages/Restaurant/Restaurant';
import Test from './Test';
import Checkout from './pages/Checkout/Checkout';
import Orders from './pages/Orders/Orders';
import Register from './pages/Register/Register'
import Login from './pages/Login/Login';
import { UserProvider } from './utils/userContext';

function App() {
  const [user, setUser] = useState(null);

    return (
        <UserContext.Provider value={user}>
            <Router>
                <Routes>
                    
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/menu3" element={<Menu3 />} />
                    {/*<Route path="/Test" element={<Test />} />*/}
                    {/*<Route path="/menuInfo" element={<MenuInfo />} />*/}
                    <Route path="/restaurant-info/:id" element={<MenuInfo />} />
                    {/*<Route path="/menu2" element={<Menu2 />} />  Remove this */}
                    <Route path="/menu/:restaurantId" element={<Menu2 />} />
                </Routes>
            </Router>
        </UserContext.Provider>
    );

  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Restaurant />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
