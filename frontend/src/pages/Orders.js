import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import "./Pages.css";

const Orders = React.memo((props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      // navigate("/auth");
      return;
    }
    const fetchOrders = async () => {
      try {
        const endpoint = user.role === "seller" ? "/orders/seller-orders" : "/orders/my-orders";
        const { data } = await API.get(endpoint);
        if (data.orders) setOrders(data.orders);
      } catch { /* demo */ }
    };
    fetchOrders();
  }, [user, navigate]);

  return (
    <div className="orders-page container">
      <h1>My <span className="highlight">Orders</span></h1>
      <span>{props.name}</span>
      {orders.length === 0 ? (
        <div className="cart-empty">
          <div style={{ fontSize: "3rem" }}>📦</div>
          <h2>No orders yet</h2>
          <p style={{ color: "var(--slate)", margin: "0.5rem 0 1.5rem" }}>
            Start shopping to see your orders here!
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">Browse Products →</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card anim-fade-up">
              <div className="order-card-header">
                <div>
                  <h3>Order #{order._id?.slice(-8)}</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--slate)" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span className={`badge ${
                    order.orderStatus === "delivered" ? "badge-green" :
                    order.orderStatus === "shipped" ? "badge-sky" :
                    order.orderStatus === "cancelled" ? "badge-coral" : "badge-amber"
                  }`}>
                    {order.orderStatus}
                  </span>
                  <span className={`badge ${order.paymentStatus === "paid" ? "badge-green" : "badge-amber"}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.items?.map((item, i) => (
                  <div key={i} className="order-item-row">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                Total: ${order.totalAmount?.toFixed(2)}
              </div>

              {order.trackingNumber && (
                <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--sky)" }}>
                  Tracking: {order.trackingNumber}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default Orders;
