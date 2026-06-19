import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AddressProvider } from "./context/AddressContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import SellerDashboard from "./pages/SellerDashboard";
import Address from "./pages/Address";
import "./styles/global.css";


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AddressProvider>
          <Router>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/seller/dashboard" element={<SellerDashboard />} />
                  <Route path="/add-address" element={<Address />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AddressProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
