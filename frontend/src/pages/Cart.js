import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import "./Pages.css";


const Cart = () => {
 
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal,updateImage } = useCart();
  const { user } = useAuth();
   const shipping = cartTotal > 50 ? 0 : 5.99;
  const tax = +(cartTotal * 0.08).toFixed(2);
  const total = +(cartTotal + shipping + tax).toFixed(2);
  const images = cart.map((item) => ({ image: item.image, _id:item._id }));
 
  useEffect(()=>{
    const fetchProducts = async () => {
    try {
      const {data} =await API.post(`/products/cartImage`,images)
    if (data.Product)
      {
        updateImage(data.Product)
      }
    } catch { /* demo mode */ }
  };
  fetchProducts();
    
  },[])

  if (cart.length === 0) {
    return (
      
      <div className="cart-page container">
       
        <div className="cart-empty">
          <div style={{ fontSize: "4rem" }}>🛒</div>
          <h2>Your cart is empty</h2>
          <p style={{ margin: "1rem 0 2rem", color: "var(--slate)" }}>
            Looks like you haven't added anything yet.
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Browse Products →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1>Shopping <span className="highlight">Cart</span></h1>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          {cart.map((item, i) => (
            <div key={item._id} className="cart-item anim-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <img
                className="cart-item-image"
                src={item.imageUrl}
                alt={item.name}
              />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-cat">{item.category}</p>
                <div className="cart-item-price">{(item.price * item.quantity).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
              </div>
              <div className="cart-item-actions">
                <div className="qty-control">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
                <button className="cart-remove-btn" onClick={() => removeFromCart(item._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            className="btn btn-secondary btn-sm"
            style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cart.length} items)</span>
            <span>{cartTotal.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `${shipping.toLocaleString("en-IN", { style: "currency", currency: "INR" })}`}</span>
          </div>
          <div className="summary-row">
            <span>Estimated Tax</span>
            <span>{tax.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{total.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
          </div>

          {user ? (
            <Link to="/checkout" className="btn btn-primary btn-lg btn-block text-white">
              Proceed to Checkout →
            </Link>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-lg btn-block text-white">
              Sign In to Checkout →
            </Link>
          )}

          {cartTotal < 50 && (
            <p style={{
              textAlign: "center",
              fontSize: "0.8rem",
              color: "var(--slate)",
              marginTop: "0.75rem"
            }}>
              Add ${(50 - cartTotal).toFixed(2)} more for free shipping!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
